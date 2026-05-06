-- 🛒 Atualização da tabela de pedidos para suportar cupons e detalhes financeiros
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0;

-- 📝 Comentários para documentação
COMMENT ON COLUMN orders.coupon_code IS 'Código do cupom aplicado ao pedido';
COMMENT ON COLUMN orders.discount_amount IS 'Valor total do desconto aplicado';
COMMENT ON COLUMN orders.subtotal IS 'Valor dos itens sem taxa de entrega e sem descontos';
