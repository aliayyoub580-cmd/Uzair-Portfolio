import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.warn('[server/supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
}

/**
 * Service-role client — bypasses RLS.
 * Used only on the server. NEVER expose this key to the frontend.
 */
export const supabaseAdmin = createClient(url ?? '', key ?? '', {
  auth: { autoRefreshToken: false, persistSession: false },
});
