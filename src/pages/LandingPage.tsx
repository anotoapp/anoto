import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, ArrowRight, 
  ShieldCheck, TrendingUp,
  ChevronDown, Layout, Bell
} from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqItems = [
    {
      q: "O cliente precisa baixar algum aplicativo?",
      a: "Não! O cardápio do ANOTÔ é um Web App que abre instantaneamente em qualquer navegador (Chrome, Safari, etc) pelo link da sua loja."
    },
    {
      q: "Como recebo o pagamento dos pedidos?",
      a: "O pagamento é feito diretamente para você! O cliente escolhe a forma de pagamento no site e você acerta com ele na entrega (Pix, Cartão ou Dinheiro)."
    },
    {
      q: "Existe taxa por cada pedido realizado?",
      a: "Zero taxas! Ao contrário de outros apps, o ANOTÔ não cobra nenhuma comissão sobre suas vendas. O lucro é 100% seu."
    },
    {
      q: "Posso usar meu próprio domínio?",
      a: "Sim! No plano anual você pode configurar seu próprio domínio (ex: www.sualoja.com.br) para deixar sua marca ainda mais profissional."
    }
  ];

  return (
    <div className="landing-page">
      <nav className="landing-nav landing-container">
        <Link to="/" className="logo-text">ANOTÔ</Link>
        <div className="nav-links">
          <a href="#como-funciona" className="nav-link">Como Funciona</a>
          <a href="#precos" className="nav-link">Preços</a>
          <Link to="/admin/login" className="btn-login-outline">Área do Lojista</Link>
          <Link to="/admin/register" className="btn-primary-small">Criar Minha Loja</Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="hero landing-container">
          <div className="hero-badge fade-up">✨ O Cardápio Digital que Vende por Você</div>
          <h1 className="fade-up">
            Transforme seu WhatsApp em uma <span className="text-gradient">Máquina de Vendas</span>.
          </h1>
          <p className="hero-subtitle fade-up delay-1">
            Chega de anotar pedidos manualmente. Com o <strong>ANOTÔ</strong>, seus clientes fazem o pedido sozinhos e você recebe tudo organizado no seu WhatsApp.
          </p>
          <div className="hero-actions fade-up delay-2">
            <Link to="/admin/register" className="btn-primary-main">Começar Agora <ArrowRight size={20} style={{ marginLeft: '8px' }} /></Link>
            <p className="hero-caption">Sem taxas por pedido. Cancele quando quiser.</p>
          </div>
        </section>

        {/* Product Preview */}
        <section id="preview" className="preview-section landing-container">
          <div className="preview-grid">
            <div className="preview-text fade-up">
              <h2 className="section-title">A melhor experiência para o <span className="text-primary">seu cliente</span>.</h2>
              <p>O ANOTÔ não é apenas um site, é um canal de vendas otimizado para converter curiosos em clientes fiéis.</p>
              
              <ul className="benefit-list">
                <li>
                  <div className="benefit-icon"><ShieldCheck size={20} /></div>
                  <div>
                    <strong>Fim dos Erros de Pedido</strong>
                    <p>O cliente escolhe exatamente o que quer, com todos os adicionais detalhados.</p>
                  </div>
                </li>
                <li>
                  <div className="benefit-icon"><TrendingUp size={20} /></div>
                  <div>
                    <strong>Aumento do Ticket Médio</strong>
                    <p>Sugestões inteligentes de adicionais e bebidas que fazem o cliente gastar mais.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="preview-image-container fade-up delay-1">
              <div className="mockup-bg"></div>
              <img src="/assets/anoto-preview.png" alt="Anotô Mobile Preview" className="mockup-img" />
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="como-funciona" className="how-it-works landing-container">
          <div className="section-header">
            <h2 className="section-title">Comece a vender em <span className="text-primary">3 passos</span></h2>
          </div>
          <div className="steps-grid">
            <div className="step-card fade-up">
              <div className="step-number">1</div>
              <Layout size={40} className="step-icon" />
              <h3>Cadastre sua Loja</h3>
              <p>Crie sua conta em segundos e configure as cores da sua marca.</p>
            </div>
            <div className="step-card fade-up delay-1">
              <div className="step-number">2</div>
              <Bell size={40} className="step-icon" />
              <h3>Suba seu Cardápio</h3>
              <p>Adicione seus produtos, fotos e todos os adicionais deliciosos.</p>
            </div>
            <div className="step-card fade-up delay-2">
              <div className="step-number">3</div>
              <TrendingUp size={40} className="step-icon" />
              <h3>Receba Pedidos</h3>
              <p>Divulgue seu link e receba pedidos prontos direto no seu WhatsApp.</p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="precos" className="pricing-section landing-container">
          <div className="section-header text-center">
            <h2 className="section-title">O melhor custo-benefício para <span className="text-primary">seu delivery</span></h2>
            <p className="section-subtitle">Escolha o plano que melhor se adapta ao seu momento.</p>
            
            <div className="pricing-toggle-wrapper">
              <span className={billingCycle === 'monthly' ? 'active' : ''}>Mensal</span>
              <button 
                className={`pricing-toggle-btn ${billingCycle === 'yearly' ? 'yearly' : ''}`}
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              >
                <div className="toggle-dot"></div>
              </button>
              <span className={billingCycle === 'yearly' ? 'active' : ''}>Anual <span className="save-badge">Economize 35%</span></span>
            </div>
          </div>

          <div className="pricing-grid">
            <div className="pricing-card featured fade-up">
              <div className="card-badge">MAIS POPULAR</div>
              <h3>Plano Profissional</h3>
              <div className="price-container">
                <span className="currency">R$</span>
                <span className="price">{billingCycle === 'monthly' ? '39,90' : '24,75'}</span>
                <span className="period">/mês</span>
              </div>
              <p className="price-subtext">
                {billingCycle === 'yearly' ? 'Total de R$ 297,00 por ano' : 'Assinatura mensal recorrente'}
              </p>
              
              <ul className="pricing-features">
                <li><CheckCircle size={18} className="text-primary" /> Pedidos Ilimitados</li>
                <li><CheckCircle size={18} className="text-primary" /> Gestão de Adicionais</li>
                <li><CheckCircle size={18} className="text-primary" /> Alerta Sonoro de Pedidos</li>
                <li><CheckCircle size={18} className="text-primary" /> Horário de Funcionamento</li>
                <li><CheckCircle size={18} className="text-primary" /> Suporte VIP via WhatsApp</li>
                {billingCycle === 'yearly' && <li><CheckCircle size={18} className="text-primary" /> Domínio Próprio (.com.br)</li>}
              </ul>
              
              <Link to="/admin/register" className="btn-pricing-primary">Quero começar agora</Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section landing-container">
          <div className="section-header">
            <h2 className="section-title">Dúvidas <span className="text-primary">Frequentes</span></h2>
          </div>
          <div className="faq-list">
            {faqItems.map((item, index) => (
              <div 
                key={index} 
                className={`faq-item ${openFaq === index ? 'open' : ''}`}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <div className="faq-question">
                  <h4>{item.q}</h4>
                  <ChevronDown size={20} className="faq-arrow" />
                </div>
                <div className="faq-answer">
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="cta-section landing-container">
          <div className="cta-card fade-up">
            <h2>Pronto para profissionalizar seu delivery?</h2>
            <p>Junte-se a estabelecimentos que já estão vendendo mais com o ANOTÔ.</p>
            <Link to="/admin/register" className="btn-secondary">Criar meu cardápio agora</Link>
            
            <div className="cta-benefits">
              <span><CheckCircle size={16} /> Sem fidelidade</span>
              <span><CheckCircle size={16} /> Setup em 2 minutos</span>
              <span><CheckCircle size={16} /> Suporte humanizado</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer landing-container">
        <div className="footer-content">
          <p className="footer-brand">ANOTÔ</p>
          <p className="footer-copy">&copy; 2024 ANOTÔ. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/5519995933655?text=Olá! Gostaria de saber mais sobre o ANOTÔ."
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="whatsapp-tooltip">Fale com a Lívia</span>
        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" />
      </a>
    </div>
  );
}
