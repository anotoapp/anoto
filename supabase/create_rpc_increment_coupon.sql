-- 🚀 Função para incrementar o uso de cupons de forma atômica
CREATE OR REPLACE FUNCTION increment_coupon_uses(p_store_id UUID, p_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE coupons
  SET current_uses = current_uses + 1
  WHERE store_id = p_store_id AND code = UPPER(p_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
