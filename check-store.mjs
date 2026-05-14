import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStores() {
  const { data: stores } = await supabase.from('stores').select('*');
  console.log('Stores:', stores.map(s => ({ id: s.id, name: s.name, owner: s.owner_id })));
  
  const { data: profiles } = await supabase.from('profiles').select('*');
  console.log('Profiles emails:', profiles.map(p => ({ id: p.id, email: p.email })));
}

checkStores();
