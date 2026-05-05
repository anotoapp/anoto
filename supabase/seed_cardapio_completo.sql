-- ============================================================
-- SEED: Cardápio Completo de Hamburgueria para Testes
-- Loja: To Indo Açaí (ID: 2de3edd7-1758-4327-b2bd-34a89901299b)
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

DO $$
DECLARE
  v_store_id UUID := '2de3edd7-1758-4327-b2bd-34a89901299b';
  
  cat_burgers   UUID;
  cat_combos    UUID;
  cat_lanches   UUID;
  cat_bebidas   UUID;
  cat_sobremesas UUID;
  cat_porcoes   UUID;
BEGIN

-- ─── 1. Limpar dados antigos ──────────────────────────────────────────────
DELETE FROM products      WHERE category_id IN (SELECT id FROM categories WHERE store_id = v_store_id);
DELETE FROM categories    WHERE store_id = v_store_id;

-- ─── 2. Criar categorias ─────────────────────────────────────────────────
INSERT INTO categories (store_id, name, icon) VALUES (v_store_id, 'Burgers',    '🍔') RETURNING id INTO cat_burgers;
INSERT INTO categories (store_id, name, icon) VALUES (v_store_id, 'Combos',     '🎁') RETURNING id INTO cat_combos;
INSERT INTO categories (store_id, name, icon) VALUES (v_store_id, 'Lanches',    '🥪') RETURNING id INTO cat_lanches;
INSERT INTO categories (store_id, name, icon) VALUES (v_store_id, 'Bebidas',    '🥤') RETURNING id INTO cat_bebidas;
INSERT INTO categories (store_id, name, icon) VALUES (v_store_id, 'Sobremesas', '🍨') RETURNING id INTO cat_sobremesas;
INSERT INTO categories (store_id, name, icon) VALUES (v_store_id, 'Porções',    '🍟') RETURNING id INTO cat_porcoes;

-- ─── 3. BURGERS ───────────────────────────────────────────────────────────
INSERT INTO products (store_id, category_id, name, description, price, image, is_available) VALUES
(v_store_id, cat_burgers, 'Classic Smash',
 'Blend 160g smashado na chapa, queijo cheddar, alface, tomate, picles e molho especial da casa.',
 28.90, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop', true),

(v_store_id, cat_burgers, 'Double Smash',
 'Dois blends 120g smashados, duplo cheddar, bacon crocante, cebola caramelizada e barbecue.',
 38.90, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&auto=format&fit=crop', true),

(v_store_id, cat_burgers, 'Bacon Crispy',
 'Blend 180g, cheddar derretido, cinco fatias de bacon crocante, maionese defumada e rúcula.',
 34.90, 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&auto=format&fit=crop', true),

(v_store_id, cat_burgers, 'BBQ Monster',
 'Blend 200g, queijo gouda, onion rings, jalapeño, molho barbecue artesanal e pão brioche tostado.',
 42.90, 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&auto=format&fit=crop', true),

(v_store_id, cat_burgers, 'Veggie Burger',
 'Blend de grão-de-bico e cogumelos, queijo muçarela, rúcula, tomate seco e maionese de ervas.',
 29.90, 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&auto=format&fit=crop', true),

(v_store_id, cat_burgers, 'Frango Crocante',
 'Filé de frango empanado crocante, cheddar, coleslaw, tomate e molho honey mustard.',
 27.90, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&auto=format&fit=crop', true);

-- ─── 4. COMBOS ────────────────────────────────────────────────────────────
INSERT INTO products (store_id, category_id, name, description, price, image, is_available) VALUES
(v_store_id, cat_combos, 'Combo Classic',
 'Classic Smash + Batata Frita M + Refrigerante 350ml. Economize R$ 8,00!',
 44.90, 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&auto=format&fit=crop', true),

(v_store_id, cat_combos, 'Combo Double',
 'Double Smash + Batata Frita G + Milk Shake 400ml. Economize R$ 12,00!',
 59.90, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&auto=format&fit=crop', true),

(v_store_id, cat_combos, 'Combo Família',
 '2 Burgers à escolha + 2 Batatas G + 2 Refrigerantes. Perfeito para dividir!',
 89.90, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop', true),

(v_store_id, cat_combos, 'Combo BBQ',
 'BBQ Monster + Onion Rings + Cerveja Artesanal 330ml. O combo perfeito!',
 69.90, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&auto=format&fit=crop', true);

-- ─── 5. LANCHES ───────────────────────────────────────────────────────────
INSERT INTO products (store_id, category_id, name, description, price, image, is_available) VALUES
(v_store_id, cat_lanches, 'Hot Dog Tradicional',
 'Salsicha alemã grelhada, purê de batata, vinagrete, molho especial e batata palha.',
 18.90, 'https://images.unsplash.com/photo-1612392062126-19bdc6e7ffb3?w=400&auto=format&fit=crop', true),

(v_store_id, cat_lanches, 'Wrap Frango Grelhado',
 'Tortilha, frango grelhado temperado, queijo, alface, tomate e cream cheese.',
 22.90, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&auto=format&fit=crop', true),

(v_store_id, cat_lanches, 'Bauru Especial',
 'Pão francês, rosbife, queijo muçarela derretido, tomate e orégano.',
 19.90, 'https://images.unsplash.com/photo-1540914124281-342587941389?w=400&auto=format&fit=crop', true),

(v_store_id, cat_lanches, 'Misto Quente Artesanal',
 'Pão de forma artesanal, presunto defumado e queijo gruyère grelhado na manteiga.',
 15.90, 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=400&auto=format&fit=crop', true);

-- ─── 6. BEBIDAS ───────────────────────────────────────────────────────────
INSERT INTO products (store_id, category_id, name, description, price, image, is_available) VALUES
(v_store_id, cat_bebidas, 'Refrigerante Lata',
 'Coca-Cola, Pepsi, Guaraná Antarctica, Fanta Laranja ou Fanta Uva. 350ml gelado.',
 6.00, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop', true),

(v_store_id, cat_bebidas, 'Milk Shake Artesanal',
 'Baunilha, Chocolate, Morango ou Ovomaltine. 400ml cremoso feito na hora.',
 18.90, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&auto=format&fit=crop', true),

(v_store_id, cat_bebidas, 'Suco Natural 500ml',
 'Laranja, Limão, Maracujá, Abacaxi com Hortelã ou Melancia. Feito na hora.',
 12.00, 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=400&auto=format&fit=crop', true),

(v_store_id, cat_bebidas, 'Cerveja Artesanal 330ml',
 'IPA, Weiss ou Pilsen artesanal gelada. 330ml. Produzida localmente.',
 16.00, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&auto=format&fit=crop', true),

(v_store_id, cat_bebidas, 'Água Mineral 500ml',
 'Água mineral sem gás ou com gás. 500ml gelada.',
 4.00, 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&auto=format&fit=crop', true);

-- ─── 7. SOBREMESAS ────────────────────────────────────────────────────────
INSERT INTO products (store_id, category_id, name, description, price, image, is_available) VALUES
(v_store_id, cat_sobremesas, 'Brownie com Sorvete',
 'Brownie de chocolate belga quentinho com bola de sorvete de creme e calda de caramelo.',
 19.90, 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&auto=format&fit=crop', true),

(v_store_id, cat_sobremesas, 'Sundae',
 'Sorvete de creme com calda de chocolate, morango ou caramelo salgado. Com granola crocante.',
 14.90, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&auto=format&fit=crop', true),

(v_store_id, cat_sobremesas, 'Cheesecake do Dia',
 'Fatia generosa de cheesecake artesanal com calda de frutas vermelhas. Pergunte o sabor do dia!',
 16.90, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&auto=format&fit=crop', true),

(v_store_id, cat_sobremesas, 'Churros com Doce de Leite',
 'Churros crocante frito na hora, polvilhado com açúcar e canela, recheado com doce de leite.',
 12.90, 'https://images.unsplash.com/photo-1624371414361-e670edf4b0fb?w=400&auto=format&fit=crop', true);

-- ─── 8. PORÇÕES ───────────────────────────────────────────────────────────
INSERT INTO products (store_id, category_id, name, description, price, image, is_available) VALUES
(v_store_id, cat_porcoes, 'Batata Frita Clássica',
 'Batata corte palito dourada e crocante. Acompanha ketchup e maionese. Porção média serve 2.',
 22.90, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop', true),

(v_store_id, cat_porcoes, 'Batata Frita Temperada',
 'Batata frita com tempero especial da casa (páprica, alho e ervas). Irresistível!',
 26.90, 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&auto=format&fit=crop', true),

(v_store_id, cat_porcoes, 'Onion Rings',
 'Anéis de cebola empanados e fritos. Crocantes por fora, macios por dentro. Com molho ranch.',
 24.90, 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&auto=format&fit=crop', true),

(v_store_id, cat_porcoes, 'Nuggets de Frango (12un)',
 'Nuggets artesanais de frango, empanados e fritos. Com molho barbecue ou mel e mostarda.',
 28.90, 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&auto=format&fit=crop', true);

RAISE NOTICE '✅ Cardápio criado! 6 categorias e 26 produtos inseridos.';
END $$;
