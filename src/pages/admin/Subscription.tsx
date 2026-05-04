import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  CreditCard, Check, Zap, RefreshCw, ShieldCheck, Star, AlertTriangle, Clock
} from 'lucide-react';
import type { AdminContextType } from './AdminLayout';
import './Admin.css';

const MONTHLY_PRICE = 39.90;
const ANNUAL_PRICE = 297.00;
const ANNUAL_MONTHLY_EQUIV = ANNUAL_PRICE / 12; // 24.75
const SAVINGS_PERCENT = Math.round((1 - ANNUAL_MONTHLY_EQUIV / MONTHLY_PRICE) * 100); // 38%

const MONTHLY_LINK = 'https://pay.kiwify.com.br/8cR0dlH';
const ANNUAL_LINK  = 'https://pay.kiwify.com.br/OLBam8a';

const FEATURES = [
  'Cardápio digital ilimitado',
  'Pedidos em tempo real',
  'Dashboard com análises',
  'Gestão de clientes (CRM)',
  'Cupons de desconto',
  'Taxas de entrega por bairro',
  'Preview ao vivo da loja',
  'Suporte via WhatsApp',
  'Notificações automáticas (API)',
  'White Label (sua marca)',
];

export default function Subscription() {
  const { store } = useOutletContext<AdminContextType>();
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');

  const isActive = store?.subscription_status === 'active';
  const isTrial  = !store?.subscription_status || store?.subscription_status === 'trial';
  const isExpired = store?.subscription_status === 'expired';

  const renewalDate = store?.last_payment_at
    ? new Date(new Date(store.last_payment_at).getTime() + (billing === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
    : null;

  const checkoutLink = billing === 'monthly' ? MONTHLY_LINK : ANNUAL_LINK;

  return (
    <div className="subscription-page fade-in" style={{ maxWidth: '780px', margin: '0 auto', padding: '24px 20px 60px' }}>

      {/* Header */}
      <header className="dashboard-header" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Minha Assinatura</h1>
        <p style={{ color: '#64748b', margin: '6px 0 0' }}>Mantenha sua loja ativa e receba pedidos sem interrupções</p>
      </header>

      {/* Status Banner */}
      {isExpired && (
        <div style={{
          background: 'linear-gradient(135deg, #fef2f2, #fff)',
          border: '1px solid #fecaca',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ color: '#dc2626', flexShrink: 0 }}><AlertTriangle size={28} /></div>
          <div>
            <h3 style={{ margin: 0, color: '#dc2626', fontWeight: '700' }}>Assinatura expirada</h3>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
              Seu painel está pausado. Escolha um plano abaixo para reativar sua loja imediatamente.
            </p>
          </div>
        </div>
      )}

      {isActive && (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4, #fff)',
          border: '1px solid #bbf7d0',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', background: '#dcfce7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontWeight: '700', color: '#0f172a' }}>Plano ANOTÔ — Ativo ✅</h3>
              {renewalDate && (
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={13} /> Próxima renovação: {renewalDate}
                </p>
              )}
            </div>
          </div>
          <span style={{ background: '#dcfce7', color: '#16a34a', padding: '6px 16px', borderRadius: '20px', fontWeight: '700', fontSize: '0.85rem' }}>
            ATIVO
          </span>
        </div>
      )}

      {isTrial && (
        <div style={{
          background: 'linear-gradient(135deg, #fffbeb, #fff)',
          border: '1px solid #fde68a',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{ color: '#d97706', flexShrink: 0 }}><Star size={24} /></div>
          <div>
            <h3 style={{ margin: 0, color: '#92400e', fontWeight: '700' }}>Você está no período de teste</h3>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
              Assine agora para garantir acesso completo e contínuo à plataforma.
            </p>
          </div>
        </div>
      )}

      {/* Billing Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '36px' }}>
        <div style={{
          background: '#f1f5f9',
          borderRadius: '14px',
          padding: '6px',
          display: 'inline-flex',
          gap: '4px',
          position: 'relative'
        }}>
          <button
            onClick={() => setBilling('monthly')}
            style={{
              padding: '10px 28px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.95rem',
              transition: 'all 0.25s',
              background: billing === 'monthly' ? '#fff' : 'transparent',
              color: billing === 'monthly' ? '#0f172a' : '#64748b',
              boxShadow: billing === 'monthly' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            Mensal
          </button>
          <button
            onClick={() => setBilling('annual')}
            style={{
              padding: '10px 28px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.95rem',
              transition: 'all 0.25s',
              background: billing === 'annual' ? '#fff' : 'transparent',
              color: billing === 'annual' ? '#0f172a' : '#64748b',
              boxShadow: billing === 'annual' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Anual
            <span style={{
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              color: '#fff',
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '0.7rem',
              fontWeight: '800',
              letterSpacing: '0.3px'
            }}>
              -{SAVINGS_PERCENT}%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Card */}
      <div style={{
        background: '#fff',
        borderRadius: '24px',
        border: '2px solid var(--brand-red, #dc2626)',
        boxShadow: '0 20px 60px rgba(220, 38, 38, 0.1)',
        overflow: 'hidden',
        marginBottom: '24px'
      }}>
        {/* Card Header */}
        <div style={{
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          padding: '32px',
          textAlign: 'center',
          color: '#fff'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '12px', padding: '10px' }}>
              <Zap size={28} />
            </div>
          </div>
          <h2 style={{ margin: '0 0 6px', fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-0.5px' }}>
            Plano ANOTÔ
          </h2>
          <p style={{ margin: 0, opacity: 0.85, fontSize: '0.9rem' }}>Tudo que você precisa para vender mais</p>
        </div>

        {/* Price */}
        <div style={{ padding: '32px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
          {billing === 'annual' && (
            <div style={{ marginBottom: '8px' }}>
              <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '1rem' }}>
                R$ {(MONTHLY_PRICE * 12).toFixed(2).replace('.', ',')}/ano
              </span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#64748b' }}>R$</span>
            <span style={{ fontSize: '3.5rem', fontWeight: '900', color: '#0f172a', lineHeight: 1 }}>
              {billing === 'monthly'
                ? '39,90'
                : ANNUAL_MONTHLY_EQUIV.toFixed(2).replace('.', ',')
              }
            </span>
            <span style={{ color: '#64748b', fontSize: '1rem' }}>/mês</span>
          </div>

          {billing === 'annual' && (
            <div style={{ marginTop: '10px' }}>
              <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '4px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700' }}>
                💰 Cobrado R$ 297,00/ano — Economize R$ {(MONTHLY_PRICE * 12 - ANNUAL_PRICE).toFixed(2).replace('.', ',')}/ano
              </span>
            </div>
          )}

          {billing === 'monthly' && (
            <p style={{ margin: '10px 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
              Cobrado mensalmente • Cancele quando quiser
            </p>
          )}
        </div>

        {/* Features */}
        <div style={{ padding: '28px 32px' }}>
          <p style={{ margin: '0 0 16px', fontWeight: '700', color: '#0f172a', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Tudo incluído:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {FEATURES.map(feature => (
              <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: '#f0fdf4', color: '#16a34a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Check size={12} strokeWidth={3} />
                </div>
                <span style={{ fontSize: '0.88rem', color: '#475569' }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '0 32px 32px' }}>
          <a
            href={checkoutLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              padding: '16px',
              background: isActive
                ? '#f1f5f9'
                : 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: isActive ? '#64748b' : '#fff',
              borderRadius: '14px',
              textDecoration: 'none',
              fontWeight: '800',
              fontSize: '1.05rem',
              transition: 'all 0.2s',
              boxShadow: isActive ? 'none' : '0 8px 24px rgba(220, 38, 38, 0.3)',
              pointerEvents: isActive ? 'none' : 'auto',
              cursor: isActive ? 'default' : 'pointer',
            }}
          >
            {isActive ? (
              <><RefreshCw size={18} /> Plano já ativo</>
            ) : billing === 'annual' ? (
              <><Zap size={18} /> Assinar Anual — Economize {SAVINGS_PERCENT}%</>
            ) : (
              <><CreditCard size={18} /> Assinar Mensal</>
            )}
          </a>

          {!isActive && billing === 'monthly' && (
            <p style={{ textAlign: 'center', margin: '12px 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
              💡 Dica: Assine anual e economize{' '}
              <button
                onClick={() => setBilling('annual')}
                style={{ background: 'none', border: 'none', color: '#16a34a', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem', padding: 0 }}
              >
                R$ {(MONTHLY_PRICE * 12 - ANNUAL_PRICE).toFixed(2).replace('.', ',')}/ano
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div style={{
        background: '#f8fafc',
        borderRadius: '16px',
        padding: '20px 24px',
        border: '1px dashed #e2e8f0',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
          Dúvidas sobre pagamento ou plano?{' '}
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#dc2626', fontWeight: '700', textDecoration: 'none' }}
          >
            Fale conosco no WhatsApp
          </a>
        </p>
      </div>

    </div>
  );
}
