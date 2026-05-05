/**
 * seed_menu.mjs
 * Cria um cardápio completo de hamburgueria para testes.
 * Uso: node seed_menu.mjs [store_slug]
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const supabaseUrl = envFile.match(/VITE_SUPABASE_URL=(.*)/)?.[1].trim();
const supabaseAnonKey = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1].trim();

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const STORE_SLUG = process.argv[2] || null;

async function main() {
  // 1. Buscar loja
  let storeQuery = supabase.from('stores').select('id, name');
  if (STORE_SLUG) {
    storeQuery = storeQuery.eq('slug', STORE_SLUG).single();
  } else {
    storeQuery = storeQuery.limit(1).single();
  }
  const { data: store, error: storeErr } = await storeQuery;
  if (storeErr || !store) {
    console.error('❌ Loja não encontrada:', storeErr);
    process.exit(1);
  }
  console.log(`✅ Loja encontrada: ${store.name} (${store.id})`);

  // 2. Categorias a criar
  const categorias = [
    { name: 'Burgers', icon: '🍔', ordem: 1 },
    { name: 'Combos', icon: '🎁', ordem: 2 },
    { name: 'Lanches', icon: '🥪', ordem: 3 },
    { name: 'Bebidas', icon: '🥤', ordem: 4 },
    { name: 'Sobremesas', icon: '🍨', ordem: 5 },
    { name: 'Porções', icon: '🍟', ordem: 6 },
  ];

  // Limpa categorias antigas (e produtos em cascata)
  const { data: existingCats } = await supabase
    .from('categories')
    .select('id')
    .eq('store_id', store.id);

  if (existingCats?.length) {
    const catIds = existingCats.map(c => c.id);
    await supabase.from('products').delete().in('category_id', catIds);
    await supabase.from('categories').delete().eq('store_id', store.id);
    console.log(`🗑️  Limpou ${existingCats.length} categorias antigas`);
  }

  // 3. Inserir categorias e coletar IDs
  const { data: cats, error: catErr } = await supabase
    .from('categories')
    .insert(categorias.map(c => ({ store_id: store.id, name: c.name, icon: c.icon })))
    .select();
  if (catErr) { console.error('❌ Erro ao criar categorias:', catErr); process.exit(1); }
  console.log(`✅ ${cats.length} categorias criadas`);

  const catMap = {};
  for (const cat of cats) catMap[cat.name] = cat.id;

  // 4. Produtos — imagens do Unsplash (reais, sem autenticação necessária)
  const produtos = [
    // ── BURGERS ──────────────────────────────────────────────────────────────
    {
      category: 'Burgers',
      name: 'Classic Smash',
      description: 'Blend 160g smashado na chapa, queijo cheddar, alface, tomate, picles e molho especial da casa.',
      price: 28.90,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop',
    },
    {
      category: 'Burgers',
      name: 'Double Smash',
      description: 'Dois blends 120g smashados, duplo cheddar, bacon crocante, cebola caramelizada e barbecue.',
      price: 38.90,
      image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&auto=format&fit=crop',
    },
    {
      category: 'Burgers',
      name: 'Bacon Crispy',
      description: 'Blend 180g, cheddar derretido, cinco fatias de bacon crocante, maionese defumada e rúcula.',
      price: 34.90,
      image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&auto=format&fit=crop',
    },
    {
      category: 'Burgers',
      name: 'BBQ Monster',
      description: 'Blend 200g, queijo gouda, onion rings, jalapeño, molho barbecue artesanal e pão brioche tostado.',
      price: 42.90,
      image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&auto=format&fit=crop',
    },
    {
      category: 'Burgers',
      name: 'Veggie Burguer',
      description: 'Blend de grão-de-bico e cogumelos, queijo muçarela, rúcula, tomate seco e maionese de ervas.',
      price: 29.90,
      image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&auto=format&fit=crop',
    },
    {
      category: 'Burgers',
      name: 'Frango Crocante',
      description: 'Filé de frango empanado crocante, cheddar, coleslaw, tomate e molho honey mustard.',
      price: 27.90,
      image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&auto=format&fit=crop',
    },

    // ── COMBOS ───────────────────────────────────────────────────────────────
    {
      category: 'Combos',
      name: 'Combo Classic',
      description: 'Classic Smash + Batata Frita M + Refrigerante 350ml. Economize R$ 8,00!',
      price: 44.90,
      image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&auto=format&fit=crop',
    },
    {
      category: 'Combos',
      name: 'Combo Double',
      description: 'Double Smash + Batata Frita G + Milk Shake 400ml. Economize R$ 12,00!',
      price: 59.90,
      image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&auto=format&fit=crop',
    },
    {
      category: 'Combos',
      name: 'Combo Família',
      description: '2 Burgers à escolha + 2 Batatas G + 2 Refrigerantes. Perfeito para dividir!',
      price: 89.90,
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop',
    },
    {
      category: 'Combos',
      name: 'Combo BBQ',
      description: 'BBQ Monster + Onion Rings + Cerveja Artesanal 330ml. O combo perfeito!',
      price: 69.90,
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&auto=format&fit=crop',
    },

    // ── LANCHES ──────────────────────────────────────────────────────────────
    {
      category: 'Lanches',
      name: 'Hot Dog Tradicional',
      description: 'Salsicha alemã grelhada, purê de batata, vinagrete, molho especial e batata palha.',
      price: 18.90,
      image: 'https://images.unsplash.com/photo-1612392062126-19bdc6e7ffb3?w=400&auto=format&fit=crop',
    },
    {
      category: 'Lanches',
      name: 'Wrap Frango Grelhado',
      description: 'Tortilha, frango grelhado temperado, queijo, alface, tomate e cream cheese.',
      price: 22.90,
      image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&auto=format&fit=crop',
    },
    {
      category: 'Lanches',
      name: 'Bauru Especial',
      description: 'Pão francês, rosbife, queijo muçarela derretido, tomate e orégano.',
      price: 19.90,
      image: 'https://images.unsplash.com/photo-1540914124281-342587941389?w=400&auto=format&fit=crop',
    },
    {
      category: 'Lanches',
      name: 'Misto Quente Artesanal',
      description: 'Pão de forma artesanal, presunto defumado e queijo gruyère grelhado na manteiga.',
      price: 15.90,
      image: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=400&auto=format&fit=crop',
    },

    // ── BEBIDAS ──────────────────────────────────────────────────────────────
    {
      category: 'Bebidas',
      name: 'Refrigerante Lata',
      description: 'Coca-Cola, Pepsi, Guaraná Antarctica, Fanta Laranja ou Fanta Uva. 350ml gelado.',
      price: 6.00,
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop',
    },
    {
      category: 'Bebidas',
      name: 'Milk Shake Artesanal',
      description: 'Baunilha, Chocolate, Morango ou Ovomaltine. 400ml cremoso feito na hora.',
      price: 18.90,
      image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&auto=format&fit=crop',
    },
    {
      category: 'Bebidas',
      name: 'Suco Natural 500ml',
      description: 'Laranja, Limão, Maracujá, Abacaxi com Hortelã ou Melancia. Feito na hora.',
      price: 12.00,
      image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=400&auto=format&fit=crop',
    },
    {
      category: 'Bebidas',
      name: 'Cerveja Artesanal',
      description: 'IPA, Weiss ou Pilsen artesanal gelada. 330ml. Produzida localmente.',
      price: 16.00,
      image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&auto=format&fit=crop',
    },
    {
      category: 'Bebidas',
      name: 'Água Mineral',
      description: 'Água mineral sem gás ou com gás. 500ml gelada.',
      price: 4.00,
      image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&auto=format&fit=crop',
    },

    // ── SOBREMESAS ────────────────────────────────────────────────────────────
    {
      category: 'Sobremesas',
      name: 'Brownie com Sorvete',
      description: 'Brownie de chocolate belga quentinho com bola de sorvete de creme e calda de caramelo.',
      price: 19.90,
      image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&auto=format&fit=crop',
    },
    {
      category: 'Sobremesas',
      name: 'Sundae',
      description: 'Sorvete de creme com calda de chocolate, morango ou caramelo salgado. Com granola crocante.',
      price: 14.90,
      image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&auto=format&fit=crop',
    },
    {
      category: 'Sobremesas',
      name: 'Cheesecake do Dia',
      description: 'Fatia generosa de cheesecake artesanal com calda de frutas vermelhas. Pergunte o sabor do dia!',
      price: 16.90,
      image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&auto=format&fit=crop',
    },
    {
      category: 'Sobremesas',
      name: 'Churros com Doce de Leite',
      description: 'Churros crocante frito na hora, polvilhado com açúcar e canela, recheado com doce de leite.',
      price: 12.90,
      image: 'https://images.unsplash.com/photo-1624371414361-e670edf4b0fb?w=400&auto=format&fit=crop',
    },

    // ── PORÇÕES ───────────────────────────────────────────────────────────────
    {
      category: 'Porções',
      name: 'Batata Frita Clássica',
      description: 'Batata corte palito dourada e crocante. Acompanha ketchup e maionese. Porção média serve 2.',
      price: 22.90,
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop',
    },
    {
      category: 'Porções',
      name: 'Batata Frita Temperada',
      description: 'Batata frita com tempero especial da casa (páprica, alho e ervas). Irresistível!',
      price: 26.90,
      image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&auto=format&fit=crop',
    },
    {
      category: 'Porções',
      name: 'Onion Rings',
      description: 'Anéis de cebola empanados e fritos. Crocantes por fora, macios por dentro. Com molho ranch.',
      price: 24.90,
      image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&auto=format&fit=crop',
    },
    {
      category: 'Porções',
      name: 'Nuggets de Frango (12un)',
      description: 'Nuggets artesanais de frango, empanados e fritos. Com molho barbecue ou mel e mostarda.',
      price: 28.90,
      image: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&auto=format&fit=crop',
    },
  ];

  // 5. Inserir produtos
  const produtosParaInserir = produtos.map(p => ({
    store_id: store.id,
    category_id: catMap[p.category],
    name: p.name,
    description: p.description,
    price: p.price,
    image: p.image,
    is_available: true,
  }));

  const { data: prodsCriados, error: prodErr } = await supabase
    .from('products')
    .insert(produtosParaInserir)
    .select();

  if (prodErr) {
    console.error('❌ Erro ao criar produtos:', prodErr);
    process.exit(1);
  }

  console.log(`\n✅ Cardápio criado com sucesso!`);
  console.log(`   📂 ${cats.length} categorias`);
  console.log(`   🍔 ${prodsCriados.length} produtos`);
  console.log(`\n🔗 Acesse: http://localhost:5173/${STORE_SLUG || '(slug da sua loja)'}`);
}

main().catch(console.error);
