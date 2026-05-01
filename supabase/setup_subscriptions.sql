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
