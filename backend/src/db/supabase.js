import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

let supabase = null;

export function getSupabase() {
  if (!supabase) {
    // Read env vars inside function to ensure dotenv has loaded them
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Trim whitespace and newlines from the key
    const cleanKey = SUPABASE_SERVICE_ROLE_KEY ? SUPABASE_SERVICE_ROLE_KEY.trim().replace(/\s+/g, '') : null;
    
    // Check if Service Role key is a placeholder or invalid
    const isValidKey = cleanKey && 
                      !cleanKey.includes('PASTE') &&
                      cleanKey.length > 20;
    
    // Debug logging removed - connection is working
    
    if (!SUPABASE_URL || !isValidKey) {
      const errorMsg = `Supabase not configured. SUPABASE_URL: ${SUPABASE_URL ? 'Set' : 'Missing'}, SUPABASE_SERVICE_ROLE: ${isValidKey ? 'Valid' : 'Invalid'}`;
      throw new Error(errorMsg);
    }
    supabase = createClient(SUPABASE_URL, cleanKey, {
      auth: { persistSession: false },
      db: { schema: 'public' },
    });
  }
  return supabase;
}

export async function healthCheckSupabase() {
  const sb = getSupabase();
  // Simple query to ensure connectivity; table may not exist yet so handle gracefully
  const { data, error } = await sb.from('ngos').select('id').limit(1);
  if (error && !String(error.message || '').toLowerCase().includes('relation') ) {
    throw error;
  }
  return true;
}



