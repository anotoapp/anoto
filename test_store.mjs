import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const envUrlMatch = envFile.match(/VITE_SUPABASE_URL=(.*)/);
const envKeyMatch = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = envUrlMatch ? envUrlMatch[1].trim() : process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = envKeyMatch ? envKeyMatch[1].trim() : process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testQuery() {
  const { data: store } = await supabase.from('stores').select('id, name, whatsapp_number, delivery_fee').limit(1).single();
  console.log("Store:", store);
}
testQuery();
