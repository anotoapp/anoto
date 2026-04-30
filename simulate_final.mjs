import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ehpnsastaisgnamuqfpn.supabase.co';
const supabaseAnonKey = 'sb_publishable_BEx9ndCco850vUOoCTRPuA_SwmjkhXQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function simulate() {
  try {
    // 1. Sign in as admin
    const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
      email: 'naturamixrepresentacoes@gmail.com',
      password: '123456'
    });
    if (authError) throw authError;
    console.log('Admin signed in');

    const storeId = '00000000-0000-0000-0000-000000000001';
    const productId = 'd8ad2a59-5744-4027-a2d0-9be3151670c7';

    // 2. Insert Order
    const { data: order, error: orderError } = await supabase.from('orders').insert({
      store_id: storeId,
      customer_name: 'Simulado Premium',
      customer_phone: '5511999999999',
      customer_address: 'Av. Paulista, 1000',
      payment_method: 'Pix',
      order_type: 'delivery',
      total: 35.50,
      status: 'pending'
    }).select().single();

    if (orderError) {
      console.log('Order Error:', orderError);
      return;
    }
    console.log(`Order created: ${order.id}`);

    // 3. Insert Item
    const { error: itemsError } = await supabase.from('order_items').insert({
      order_id: order.id,
      product_id: productId,
      quantity: 1,
      price: 35.50,
      notes: 'Simulado via Admin'
    });
    if (itemsError) throw itemsError;

    console.log('Simulation complete! Check your dashboard now.');
  } catch (err) {
    console.error('Final Error:', err);
  }
}

simulate();
