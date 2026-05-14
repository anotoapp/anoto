import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStore() {
  const { data: profile } = await supabase.from('profiles').select('*').eq('email', 'naturamixrepresentacoes@gmail.com');
  console.log('Profile:', profile);
  
  if (profile && profile.length > 0) {
    const { data: store } = await supabase.from('stores').select('*').eq('owner_id', profile[0].id);
    console.log('Store matching owner_id:', store);
  }
  
  const { data: storeByEmail } = await supabase.from('stores').select('*, profiles(email)').eq('profiles.email', 'naturamixrepresentacoes@gmail.com');
  console.log('Store matching profile email:', storeByEmail);
  
  const { data: allStores } = await supabase.from('stores').select('id, name, owner_id');
  console.log('Stores with owner_id:', allStores.filter(s => s.owner_id === profile?.[0]?.id));
}

checkStore();
