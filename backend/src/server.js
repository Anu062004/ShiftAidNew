import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { usingSupabase } from './db/adapter.js';
import { healthCheckSupabase } from './db/supabase.js';
import donationRoutes from './routes/donations.js';
import ngoRoutes from './routes/ngos.js';
import sideshiftRoutes from './routes/sideshift.js';
import webhookRoutes from './routes/webhooks.js';
import dashboardRoutes from './routes/dashboard.js';
import { killProcessOnPort, findAvailablePort, isPortAvailable } from './utils/port-finder.js';
import { validateEnv, updateEnvPort } from './utils/env-validator.js';
import { getPublicIP } from './utils/get-public-ip.js';

// Load and validate environment variables
let env;
try {
  env = validateEnv();
} catch (error) {
  console.error('❌ Environment validation failed:', error.message);
  process.exit(1);
}

const app = express();
let PORT = parseInt(env.PORT) || 3001;
const originalPort = PORT;

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  console.error('Stack:', err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
});

// Middleware
// CORS configuration - allow all origins in development for easier debugging
const corsOptions = process.env.NODE_ENV === 'development' 
  ? {
      origin: true, // Allow all origins in development
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }
  : {
      origin: env.FRONTEND_URL || ['http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    };

// Trust proxy to get correct client IP (important for x-user-ip header)
app.set('trust proxy', true);

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to extract and attach user IP to request
app.use((req, res, next) => {
  // Extract IP from various headers (proxy-aware)
  const forwardedFor = req.headers['x-forwarded-for'];
  const xUserIp = req.headers['x-user-ip'];
  const xRealIp = req.headers['x-real-ip'];
  const xClientIp = req.headers['x-client-ip'];
  
  let extractedIP = null;
  
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one (client IP)
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    extractedIP = ips[0];
  } else if (xUserIp) {
    extractedIP = xUserIp.trim();
  } else if (xRealIp) {
    extractedIP = xRealIp.trim();
  } else if (xClientIp) {
    extractedIP = xClientIp.trim();
  } else if (req.ip) {
    extractedIP = req.ip;
  } else if (req.connection && req.connection.remoteAddress) {
    extractedIP = req.connection.remoteAddress;
  } else if (req.socket?.remoteAddress) {
    extractedIP = req.socket.remoteAddress;
  }
  
  // Clean up IPv6-mapped IPv4 addresses (::ffff:127.0.0.1 -> 127.0.0.1)
  if (extractedIP && extractedIP.startsWith('::ffff:')) {
    extractedIP = extractedIP.replace('::ffff:', '');
  }
  
  // Set the IP, but don't use invalid localhost IPs for SideShift
  // In development, if we get localhost, we'll handle it in the SideShift config
  req.userIp = extractedIP || '0.0.0.0';
  
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'ShiftAid Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
      ngos: '/api/ngos',
      donations: '/api/donations',
      sideshift: '/api/sideshift',
      dashboard: '/api/dashboard',
      webhooks: '/api/webhooks',
    },
    timestamp: new Date().toISOString(),
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: PORT,
    database: usingSupabase() ? 'supabase' : 'unknown',
  });
});

// Routes
app.use('/api/donations', donationRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/sideshift', sideshiftRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Request Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

/**
 * Test MongoDB connection
 */
async function testDatabaseConnection() {
  if (usingSupabase()) {
    try {
      await healthCheckSupabase();
      console.log('✅ Supabase connected');
      return true;
    } catch (error) {
      console.error('❌ Supabase connection failed:', error.message);
      // Log more details in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error details:', error);
      }
      return false;
    }
  } 
  return false;
}

/**
 * Initialize server with port conflict resolution
 */
async function initializeServer() {
  console.log('\n🚀 Starting ShiftAid Backend...\n');

  // Step 1: Handle port conflicts
  console.log(`📌 Checking port ${PORT}...`);
  const portCheck = await killProcessOnPort(PORT);
  console.log(`   ${portCheck.message}`);

  // Step 2: Verify port is available, or find alternative
  const portAvailable = await isPortAvailable(PORT);
  
  if (!portAvailable) {
    console.log(`⚠️  Port ${PORT} still in use, finding alternative...`);
    try {
      PORT = await findAvailablePort(PORT + 1, 10);
      console.log(`✅ Found available port: ${PORT}`);
      
      // Update .env if port changed
      if (PORT !== originalPort) {
        await updateEnvPort(PORT);
        console.log(`💡 Updated .env with new PORT=${PORT}`);
        console.log(`💡 Frontend should use: NEXT_PUBLIC_API_URL=http://localhost:${PORT}`);
      }
    } catch (error) {
      console.error(`❌ Could not find available port: ${error.message}`);
      process.exit(1);
    }
  }

  // Step 3: Test database connection
  console.log('\n📌 Testing database connection...');
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.warn('⚠️  Database connection failed. Server will start but API endpoints may not work.');
    console.warn('⚠️  Please set SUPABASE_SERVICE_ROLE in .env file with your Service Role key from Supabase Dashboard.');
  }

  // Step 3.5: Pre-fetch public IP for development (non-blocking)
  if (process.env.NODE_ENV === 'development') {
    console.log('\n📌 Pre-fetching public IP for SideShift API...');
    getPublicIP()
      .then((ip) => {
        if (ip) {
          console.log(`✅ Public IP cached: ${ip}`);
        } else {
          console.warn('⚠️  Could not fetch public IP. Quote requests may fail if using localhost.');
        }
      })
      .catch((error) => {
        console.warn('⚠️  Error pre-fetching public IP:', error.message);
      });
  }

  // Step 4: Start server
  return new Promise((resolve, reject) => {
    try {
      const server = app.listen(PORT, () => {
        console.log(`\n✅ Server running on port ${PORT}`);
        console.log(`🌐 Health check: http://localhost:${PORT}/health`);
        console.log(`📡 API base: http://localhost:${PORT}/api`);
        console.log(`\n[BACKEND] ✅ Running on PORT: ${PORT}`);
        console.log('[BACKEND] 🟢 All services initialized successfully\n');
        resolve(server);
      });

      // Handle server errors
      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`❌ Port ${PORT} is already in use.`);
          console.error('💡 Attempting to find alternative port...');
          
          findAvailablePort(PORT + 1, 10)
            .then(async (newPort) => {
              PORT = newPort;
              await updateEnvPort(PORT);
              console.log(`✅ Switching to port ${PORT}`);
              // Restart server on new port
              initializeServer().catch(reject);
            })
            .catch((err) => {
              console.error(`❌ Could not find available port: ${err.message}`);
              reject(error);
            });
        } else {
          console.error('❌ Server error:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      reject(error);
    }
  });
}

// Start the server
initializeServer()
  .then((server) => {
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('\n🛑 SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\n🛑 SIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
  })
  .catch((error) => {
    console.error('❌ Failed to initialize server:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  });

export default app;
