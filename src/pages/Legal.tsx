import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Legal() {
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', marginBottom: '32px', fontWeight: '600' }}>
          <ArrowLeft size={20} /> Voltar para o início
        </Link>

        <h1 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '24px' }}>Termos de Uso e Política de Privacidade</h1>
        <p style={{ color: '#64748b', marginBottom: '32px' }}>Última atualização: Maio de 2025</p>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '16px' }}>1. Termos de Uso</h2>
          <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '16px' }}>
            Ao utilizar a plataforma ANOTÔ, você concorda em cumprir nossos termos. O ANOTÔ é uma ferramenta de automação de pedidos para delivery. Não nos responsabilizamos pela entrega dos produtos ou pela qualidade dos mesmos, sendo estas de inteira responsabilidade do lojista.
          </p>
          <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '16px' }}>
            A assinatura dá direito ao uso da plataforma conforme o plano escolhido (Mensal ou Anual). O cancelamento pode ser feito a qualquer momento através do suporte, mas não haverá reembolso de períodos já utilizados.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '16px' }}>2. Política de Privacidade</h2>
          <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '16px' }}>
            Nós levamos a sua privacidade a sério. Coletamos dados básicos como nome, email e WhatsApp para o funcionamento da plataforma e comunicação sobre sua assinatura.
          </p>
          <h3 style={{ fontSize: '1.1rem', color: '#334155', marginBottom: '12px' }}>2.1 Dados dos seus clientes</h3>
          <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '16px' }}>
            Os dados dos clientes finais (que fazem pedidos na sua loja) pertencem a você. O ANOTÔ apenas processa essas informações para gerar o pedido e enviá-lo ao seu WhatsApp. Não vendemos ou compartilhamos dados de clientes com terceiros.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '16px' }}>3. Segurança</h2>
          <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '16px' }}>
            Utilizamos tecnologias seguras para proteger suas informações. Pagamentos são processados pela Kiwify, uma das plataformas mais seguras do Brasil. Não armazenamos dados de cartão de crédito em nossos servidores.
          </p>
        </section>

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '32px', marginTop: '40px', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Dúvidas? Entre em contato conosco pelo WhatsApp de suporte.
          </p>
        </div>
      </div>
    </div>
  );
}
