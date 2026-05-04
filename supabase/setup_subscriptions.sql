-- Script para preparar o banco de dados para Assinaturas e Kiwify

-- 1. Adicionar colunas de assinatura na tabela de lojas
ALTER TABLE stores ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial'; -- trial, active, expired, canceled
ALTER TABLE stores ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'Starter'; -- Starter, Growth, Diamond
ALTER TABLE stores ADD COLUMN IF NOT EXISTS last_payment_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS subscription_id TEXT; -- ID da Kiwify para referência

-- 2. Adicionar email na tabela de perfis (caso não tenha)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 3. Atualizar RLS para permitir que o sistema (service_role) edite essas colunas
-- O service_role já tem acesso total, então não precisamos de novas políticas de RLS para o Webhook.

-- 4. Índice para busca rápida por email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 5. Tabela de emails autorizados (whitelist da Kiwify)
CREATE TABLE IF NOT EXISTS authorized_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  plan_type TEXT DEFAULT 'Starter',
  kiwify_order_id TEXT,
  authorized_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_authorized_emails_email ON authorized_emails(email);

-- RLS: somente service_role pode escrever, mas todos podem consultar (para validação no cadastro)
ALTER TABLE authorized_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authorized emails select" ON authorized_emails;
CREATE POLICY "Authorized emails select"
  ON authorized_emails FOR SELECT
  USING (true);

-- 6. Função segura para o frontend checar se um email está autorizado
CREATE OR REPLACE FUNCTION is_email_authorized(check_email TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM authorized_emails WHERE LOWER(email) = LOWER(check_email)
  );
$$ LANGUAGE SQL SECURITY DEFINER;

