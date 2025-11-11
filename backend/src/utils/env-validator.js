import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Validate critical environment variables
 */
export function validateEnv() {
  dotenv.config();
  
  const requiredVars = {
    SIDESHIFT_SECRET: process.env.SIDESHIFT_SECRET,
  };

  const optionalVars = {
    PORT: process.env.PORT || '3001',
    SIDESHIFT_API_URL: process.env.SIDESHIFT_API_URL || 'https://sideshift.ai/api/v2',
    AFFILIATE_ID: process.env.AFFILIATE_ID || process.env.SIDESHIFT_AFFILIATE_ID,
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    NODE_ENV: process.env.NODE_ENV || 'development',
    USE_SUPABASE: process.env.USE_SUPABASE || 'false',
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  const missing = [];
  const warnings = [];

  // Log all variables (without sensitive data)
  console.log('\n📋 Environment Configuration:');
  console.log('   Required:');
  console.log(`   ${requiredVars.SIDESHIFT_SECRET ? '✅' : '⚠️ '} SIDESHIFT_SECRET: ${requiredVars.SIDESHIFT_SECRET ? 'Set' : 'Missing'}`);
  console.log('   Optional:');
  console.log(`   📌 PORT: ${optionalVars.PORT}`);
  console.log(`   📌 SIDESHIFT_API_URL: ${optionalVars.SIDESHIFT_API_URL}`);
  console.log(`   📌 AFFILIATE_ID: ${optionalVars.AFFILIATE_ID ? 'Set' : 'Not set'}`);
  console.log(`   📌 FRONTEND_URL: ${optionalVars.FRONTEND_URL}`);
  console.log(`   📌 NODE_ENV: ${optionalVars.NODE_ENV}`);
  console.log(`   📌 USE_SUPABASE: ${optionalVars.USE_SUPABASE}`);
  if (optionalVars.USE_SUPABASE === 'true' || optionalVars.SUPABASE_URL) {
    const hasServiceRole = optionalVars.SUPABASE_SERVICE_ROLE && 
                          !optionalVars.SUPABASE_SERVICE_ROLE.includes('PASTE') &&
                          optionalVars.SUPABASE_SERVICE_ROLE.length > 20;
    console.log(`   ${optionalVars.SUPABASE_URL ? '✅' : '❌'} SUPABASE_URL`);
    console.log(`   ${hasServiceRole ? '✅' : '⚠️ '} SUPABASE_SERVICE_ROLE: ${hasServiceRole ? 'Set' : 'Not set (using placeholder)'}`);
    if (!optionalVars.SUPABASE_URL) {
      console.error('❌ Supabase URL is missing');
      throw new Error('Supabase configuration incomplete: SUPABASE_URL is required');
    }
    if (!hasServiceRole) {
      console.warn('⚠️  SUPABASE_SERVICE_ROLE is not set. Please update .env with your Service Role key from Supabase Dashboard.');
      console.warn('⚠️  Backend will start but database operations will fail until this is configured.');
    }
  }

  // Check required variables after logging
  if (!requiredVars.SIDESHIFT_SECRET) {
    warnings.push('⚠️  SIDESHIFT_SECRET not set - API calls will fail');
  }

  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Warnings:');
    warnings.forEach(w => console.warn(`   ${w}`));
  }

  return {
    ...requiredVars,
    ...optionalVars,
  };
}

/**
 * Update .env file with new port
 */
export async function updateEnvPort(port) {
  const envPath = path.join(__dirname, '../../.env');
  
  try {
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Update or add PORT
    if (envContent.includes('PORT=')) {
      envContent = envContent.replace(/PORT=.*/g, `PORT=${port}`);
    } else {
      envContent += `\nPORT=${port}\n`;
    }

    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log(`✅ Updated .env with PORT=${port}`);
  } catch (error) {
    console.warn(`⚠️  Could not update .env file: ${error.message}`);
  }
}


