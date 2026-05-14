import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Need a service role key to query profiles if RLS is enabled, or we can use admin API
// But wait, we can just fetch all stores, all profiles, and match them!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugData() {
  // Try to login as naturamix to get their session? We don't have the password.
  // Instead, let's just create an edge function to run our query!
}
