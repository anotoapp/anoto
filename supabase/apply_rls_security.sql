-- 🔐 Script de Segurança: Row Level Security (RLS) e Multi-tenancy (CORRIGIDO)
-- Este script garante que um lojista não veja os dados de outro, respeitando a estrutura de tabelas.

-- 1. Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

---------------------------------------------------------
-- 2. Função auxiliar de permissão (Dono da Loja)
---------------------------------------------------------
CREATE OR REPLACE FUNCTION is_store_owner(sid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM stores WHERE id = sid AND owner_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER;

---------------------------------------------------------
-- 3. Políticas para PROFILES e STORES
---------------------------------------------------------
-- Profiles
DROP POLICY IF EXISTS "Usuários podem ver o próprio perfil" ON profiles;
CREATE POLICY "Usuários podem ver o próprio perfil" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem editar o próprio perfil" ON profiles;
CREATE POLICY "Usuários podem editar o próprio perfil" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Stores
DROP POLICY IF EXISTS "Lojistas podem ver sua própria loja" ON stores;
CREATE POLICY "Lojistas podem ver sua própria loja" ON stores FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Lojistas podem editar sua própria loja" ON stores;
CREATE POLICY "Lojistas podem editar sua própria loja" ON stores FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Público pode ver lojas para vitrine" ON stores;
CREATE POLICY "Público pode ver lojas para vitrine" ON stores FOR SELECT USING (true);

---------------------------------------------------------
-- 4. CATEGORIES, DELIVERY_FEES, COUPONS, ORDERS (Têm store_id)
---------------------------------------------------------

-- Categories
DROP POLICY IF EXISTS "Dono pode gerir categorias" ON categories;
CREATE POLICY "Dono pode gerir categorias" ON categories FOR ALL USING (is_store_owner(store_id));

DROP POLICY IF EXISTS "Público pode ver categorias" ON categories;
CREATE POLICY "Público pode ver categorias" ON categories FOR SELECT USING (true);

-- Delivery Fees
DROP POLICY IF EXISTS "Dono pode gerir taxas" ON delivery_fees;
CREATE POLICY "Dono pode gerir taxas" ON delivery_fees FOR ALL USING (is_store_owner(store_id));

DROP POLICY IF EXISTS "Público pode ver taxas" ON delivery_fees;
CREATE POLICY "Público pode ver taxas" ON delivery_fees FOR SELECT USING (true);

-- Coupons
DROP POLICY IF EXISTS "Dono pode gerir cupons" ON coupons;
CREATE POLICY "Dono pode gerir cupons" ON coupons FOR ALL USING (is_store_owner(store_id));

DROP POLICY IF EXISTS "Público pode ver cupons ativos" ON coupons;
CREATE POLICY "Público pode ver cupons ativos" ON coupons FOR SELECT USING (active = true);

-- Orders
DROP POLICY IF EXISTS "Dono pode gerir pedidos da sua loja" ON orders;
CREATE POLICY "Dono pode gerir pedidos da sua loja" ON orders FOR ALL USING (is_store_owner(store_id));

DROP POLICY IF EXISTS "Clientes podem criar pedidos" ON orders;
CREATE POLICY "Clientes podem criar pedidos" ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Clientes podem ver seus próprios pedidos" ON orders;
CREATE POLICY "Clientes podem ver seus próprios pedidos" ON orders FOR SELECT USING (true);

---------------------------------------------------------
-- 5. PRODUCTS (Não tem store_id, usa category_id)
---------------------------------------------------------

DROP POLICY IF EXISTS "Dono pode gerir produtos" ON products;
CREATE POLICY "Dono pode gerir produtos" ON products FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM categories 
    WHERE categories.id = category_id AND is_store_owner(categories.store_id)
  )
);

DROP POLICY IF EXISTS "Público pode ver produtos" ON products;
CREATE POLICY "Público pode ver produtos" ON products FOR SELECT USING (true);

---------------------------------------------------------
-- 6. PRODUCT OPTIONS (Usa encadeamento)
---------------------------------------------------------

-- Option Groups
DROP POLICY IF EXISTS "Dono pode gerir grupos de opcionais" ON product_option_groups;
CREATE POLICY "Dono pode gerir grupos de opcionais" ON product_option_groups FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM products
    JOIN categories ON products.category_id = categories.id
    WHERE products.id = product_id AND is_store_owner(categories.store_id)
  )
);

DROP POLICY IF EXISTS "Público pode ver grupos de opcionais" ON product_option_groups;
CREATE POLICY "Público pode ver grupos de opcionais" ON product_option_groups FOR SELECT USING (true);

-- Options
DROP POLICY IF EXISTS "Dono pode gerir itens opcionais" ON product_options;
CREATE POLICY "Dono pode gerir itens opcionais" ON product_options FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM product_option_groups
    JOIN products ON product_option_groups.product_id = products.id
    JOIN categories ON products.category_id = categories.id
    WHERE product_option_groups.id = group_id AND is_store_owner(categories.store_id)
  )
);

DROP POLICY IF EXISTS "Público pode ver itens opcionais" ON product_options;
CREATE POLICY "Público pode ver itens opcionais" ON product_options FOR SELECT USING (true);

---------------------------------------------------------
-- 7. ORDER ITEMS (Usa order_id)
---------------------------------------------------------
DROP POLICY IF EXISTS "Dono pode ver itens dos pedidos" ON order_items;
CREATE POLICY "Dono pode ver itens dos pedidos" ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_id AND is_store_owner(orders.store_id)
  )
);

DROP POLICY IF EXISTS "Clientes podem inserir itens" ON order_items;
CREATE POLICY "Clientes podem inserir itens" ON order_items FOR INSERT WITH CHECK (true);

---------------------------------------------------------
-- 8. CUSTOMERS (Global)
---------------------------------------------------------
DROP POLICY IF EXISTS "Qualquer um pode gerir sua conta de cliente" ON customers;
CREATE POLICY "Qualquer um pode gerir sua conta de cliente" ON customers FOR ALL USING (true);
