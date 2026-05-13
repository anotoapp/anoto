import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  const { data: profile, error } = await supabase.from('profiles').select('*').eq('email', 'bomdmaispensao@gmail.com');
  console.log('Profile:', profile);
  console.log('Error:', error);
  
  const { data: store, error: storeError } = await supabase.from('stores').select('*');
  const storeFound = store?.find(s => JSON.stringify(s).includes('bomd'));
  console.log('Store:', storeFound);
  
  const { data: auth, error: authError } = await supabase.from('profiles').select('*');
  const authFound = auth?.find(a => JSON.stringify(a).includes('bomd'));
  console.log('Auth profile found:', authFound);
}

checkUser();
