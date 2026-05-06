-- ✨ Adicionar flag de destaque aos produtos
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 📝 Comentário para documentação
COMMENT ON COLUMN products.is_featured IS 'Define se o produto aparece na seção de Destaques da vitrine';
