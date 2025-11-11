import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import donationRoutes from './routes/donations.js';
import ngoRoutes from './routes/ngos.js';
import sideshiftRoutes from './routes/sideshift.js';
import webhookRoutes from './routes/webhooks.js';
import dashboardRoutes from './routes/dashboard.js';
import { killProcessOnPort, findAvailablePort, isPortAvailable } from './utils/port-finder.js';
import { validateEnv, updateEnvPort } from './utils/env-validator.js';

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
app.use(cors({
  origin: env.FRONTEND_URL || ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: PORT,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
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
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Database connected');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    if (error.name === 'MongooseServerSelectionError') {
      console.error('💡 Make sure MongoDB is running:');
      console.error('   Windows: Get-Service MongoDB');
      console.error('   Or start manually: mongod');
    }
    return false;
  }
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
    console.error('❌ Cannot start server without database connection');
    process.exit(1);
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
        mongoose.connection.close();
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\n🛑 SIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        mongoose.connection.close();
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
