import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const envUrlMatch = envFile.match(/VITE_SUPABASE_URL=(.*)/);
const envKeyMatch = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = envUrlMatch ? envUrlMatch[1].trim() : process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = envKeyMatch ? envKeyMatch[1].trim() : process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  try {
    // get a store id
    const { data: store } = await supabase.from('stores').select('id').limit(1).single();
    if (!store) {
      console.log('No store found');
      return;
    }

    const { data: product } = await supabase.from('products').select('id').limit(1).single();

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        store_id: store.id,
        customer_name: "Test User",
        customer_phone: "11999999999",
        customer_address: "Rua Teste - Bairro: Teste",
        payment_method: "Pix",
        order_type: "delivery",
        total: 10,
        status: 'pending'
      })
      .select().single();

    if (orderError) {
      console.error("Order Insert Error:", orderError);
    } else {
    const { error: itemsError } = await supabase.from('order_items').insert([{
      order_id: orderData.id,
      product_id: product ? product.id : null,
      quantity: 1,
      price: 10,
      notes: ''
    }]);

    if (itemsError) {
      console.error("Order Items Insert Error:", itemsError);
    } else {
      console.log("Order Items Insert Success");
    }
  } catch (err) {
    console.error("Exception:", err);
  }
}

testInsert();
