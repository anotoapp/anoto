import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ehpnsastaisgnamuqfpn.supabase.co';
const supabaseAnonKey = 'sb_publishable_BEx9ndCco850vUOoCTRPuA_SwmjkhXQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function simulate() {
  try {
    // 0. Sign in
    const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
      email: 'naturamixrepresentacoes@gmail.com',
      password: '123456'
    });
    if (authError) throw authError;
    console.log('Signed in successfully');
    const { data: stores, error: storeError } = await supabase.from('stores').select('id, name').limit(1);
    if (storeError) throw storeError;
    const store = stores[0];
    const { data: categories } = await supabase.from('categories').select('id').eq('store_id', store.id);
    const { data: products, error: prodError } = await supabase.from('products').select('id, name, price').in('category_id', categories.map(c => c.id)).limit(2);
    if (prodError) throw prodError;

    const { data: order, error: orderError } = await supabase.from('orders').insert({
      store_id: store.id,
      customer_name: 'Simulação Antigravity',
      customer_phone: '5511999999999',
      customer_address: 'Rua de Teste, 123 - Centro',
      payment_method: 'Pix',
      order_type: 'delivery',
      total: products.reduce((acc, p) => acc + p.price, 0) + 7,
      status: 'pending'
    }).select().single();

    if (orderError) throw orderError;
    const items = products.map(p => ({
      order_id: order.id,
      product_id: p.id,
      quantity: 1,
      price: p.price,
      notes: 'Simulado ESM'
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(items);
    if (itemsError) throw itemsError;

    console.log('Simulation complete!');
  } catch (err) {
    console.error('Error:', err);
  }
}

simulate();
