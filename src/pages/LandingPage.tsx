import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, CheckCircle2, XCircle, TrendingUp, 
  Clock, Zap, MessageSquare, Printer, BarChart
} from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'burger' | 'pizza' | 'acai'>('burger');
  const [isVisible, setIsVisible] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    const handleScroll = () => {
      const nav = document.querySelector('.lp-nav');
      if (window.scrollY > 50) {
        nav?.classList.add('scrolled');
      } else {
        nav?.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const timer = setTimeout(() => setIsVisible(true), 50);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="lp-nav">
        <div className="landing-container nav-flex">
          <Link to="/" className="lp-logo">
            <img src="/assets/logo-anoto.png" alt="ANOTÔ Logo" className="logo-img" />
          </Link>
          <div className="nav-actions">
            <Link to="/admin" className="btn-lp btn-lp-secondary login-btn">
              Login do Lojista
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="lp-hero">
        <div className="lp-hero-bg"></div>
        <div className="landing-container lp-hero-content">
          <div className={`fade-up ${isVisible ? '' : 'hidden'}`}>
            <h1 className="headline">
              Seu WhatsApp está te fazendo <span className="text-primary">perder vendas</span> todos os dias.
            </h1>
            <p className="subheadline">
              Transforme seu delivery em uma operação profissional com cardápio digital, pedidos automáticos e gestão completa em um só lugar. Pare de depender de atendente para faturar.
            </p>
            <div className="lp-hero-buttons">
              <a href="https://pay.kiwify.com.br/8cR0dlH" target="_blank" rel="noopener noreferrer" className="btn-lp btn-lp-primary">
                Começar a Vender Agora <ArrowRight size={18} style={{ marginLeft: '8px' }} />
              </a>
            </div>
            <p className="hero-trust-tag">
              <CheckCircle2 size={14} /> Setup em 5 minutos. Sem taxa sobre vendas.
            </p>
          </div>

          <div className={`mockup-composition fade-up delay-1 ${isVisible ? '' : 'hidden'}`}>
            <div className="laptop-mockup">
              <div className="laptop-header">
                <div className="laptop-dot dot-red"></div>
                <div className="laptop-dot dot-orange"></div>
                <div className="laptop-dot dot-green"></div>
              </div>
              <div className="laptop-body">
                <div className="laptop-sidebar">
                  <div className="laptop-skeleton-line" style={{width: '60%', marginBottom: '20px'}}></div>
                  <div className="laptop-skeleton-line" style={{width: '100%'}}></div>
                  <div className="laptop-skeleton-line" style={{width: '80%'}}></div>
                  <div className="laptop-skeleton-line" style={{width: '90%'}}></div>
                </div>
                <div className="laptop-main-content">
                  <div className="laptop-top-cards">
                    <div className="laptop-mini-card">
                      <div className="laptop-skeleton-line card-label"></div>
                      <div className="laptop-skeleton-line card-value-red"></div>
                    </div>
                    <div className="laptop-mini-card">
                       <div className="laptop-skeleton-line card-label"></div>
                       <div className="laptop-skeleton-line card-value-green"></div>
                    </div>
                  </div>
                  <div className="laptop-table-box">
                    <div className="table-header-skeleton">
                       <div className="laptop-skeleton-line" style={{width: '20%'}}></div>
                       <div className="laptop-skeleton-line" style={{width: '10%'}}></div>
                    </div>
                    <div className="table-row-skeleton">
                       <div className="laptop-skeleton-line" style={{width: '30%'}}></div>
                       <div className="laptop-skeleton-line" style={{width: '15%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="phone-mockup">
              <div className="phone-notch"></div>
              <div className="phone-body">
                <div className="phone-header-skeleton"></div>
                <div className="phone-line-long"></div>
                <div className="phone-line-short"></div>
                <div className="phone-item-card">
                   <div className="item-image-skeleton"></div>
                   <div className="item-details-skeleton">
                      <div className="line-long"></div>
                      <div className="line-price"></div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Section */}
      <section className="lp-pain">
        <div className="landing-container">
          <header className="lp-section-header">
            <h2 className="lp-section-title">Ainda atende pedidos no WhatsApp?</h2>
            <p className="subheadline center-text">A cada minuto que seu cliente passa esperando uma resposta, é uma chance de ele ir para o concorrente.</p>
          </header>

          <div className="split-comparison">
            <div className="split-side split-bad">
              <h3 className="split-title"><MessageSquare size={24} /> A Bagunça do WhatsApp</h3>
              <ul className="split-list">
                <li><XCircle size={20} /> 38 mensagens acumuladas</li>
                <li><XCircle size={20} /> Cliente perguntando "qual o cardápio?"</li>
                <li><XCircle size={20} /> Áudios longos e confusos</li>
                <li><XCircle size={20} /> Pedido anotado errado ou esquecido</li>
                <li><XCircle size={20} /> Print de PIX falso ou perdido</li>
                <li><XCircle size={20} /> Atendente sobrecarregado</li>
              </ul>
            </div>
            <div className="split-side split-good">
              <h3 className="split-title"><Zap size={24} /> O Profissionalismo ANOTÔ</h3>
              <ul className="split-list">
                <li><CheckCircle2 size={20} /> Pedido cai pronto e pago</li>
                <li><CheckCircle2 size={20} /> Cliente escolhe sozinho em segundos</li>
                <li><CheckCircle2 size={20} /> Cardápio sempre atualizado</li>
                <li><CheckCircle2 size={20} /> Impressão direta para a cozinha</li>
                <li><CheckCircle2 size={20} /> Histórico de clientes (Remarketing)</li>
                <li><CheckCircle2 size={20} /> Atendimento instantâneo 24h</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="lp-demo">
        <div className="landing-container">
          <header className="lp-section-header">
            <h2 className="lp-section-title text-light">Veja como seu delivery ficaria</h2>
            <p className="subheadline center-text" style={{ color: '#a1a1aa' }}>Uma experiência de compra ultra-rápida.</p>
          </header>

          <div className="demo-tabs">
            <button className={`demo-tab ${activeTab === 'burger' ? 'active' : ''}`} onClick={() => setActiveTab('burger')}>🍔 Hamburgueria</button>
            <button className={`demo-tab ${activeTab === 'pizza' ? 'active' : ''}`} onClick={() => setActiveTab('pizza')}>🍕 Pizzaria</button>
            <button className={`demo-tab ${activeTab === 'acai' ? 'active' : ''}`} onClick={() => setActiveTab('acai')}>🍧 Açaiteria</button>
          </div>

          <div className="demo-content">
            <div className="phone-demo-wrapper">
              <div className="phone-notch"></div>
              <div className="phone-body-content">
                <div className="demo-header" style={{ background: activeTab === 'burger' ? '#18181b' : activeTab === 'pizza' ? '#7f1d1d' : '#4c1d95' }}>
                  <div className="demo-logo-circle">
                    {activeTab === 'burger' ? '🍔' : activeTab === 'pizza' ? '🍕' : '🍧'}
                  </div>
                </div>
                <div className="demo-details">
                  <h3 className="demo-title">
                    {activeTab === 'burger' ? 'Smash Premium' : activeTab === 'pizza' ? 'Pizzaria Napoli' : 'Açaí Tropical'}
                  </h3>
                  <p className="demo-meta">Aberto agora • 30-40 min</p>
                  
                  <div className="demo-cats">
                    <div className="cat-badge active">Destaques</div>
                    <div className="cat-badge">Combos</div>
                  </div>

                  <div className="demo-product-card">
                     <div className="product-info">
                        <h4 className="product-title">
                          {activeTab === 'burger' ? 'Duplo Smash Bacon' : activeTab === 'pizza' ? 'Pizza Calabresa (G)' : 'Barca de Açaí 1L'}
                        </h4>
                        <p className="product-desc">
                          {activeTab === 'burger' ? '2 blends de 90g, cheddar, bacon.' : activeTab === 'pizza' ? 'Calabresa fatiada e mussarela.' : 'Açaí puro com acompanhamentos.'}
                        </p>
                        <div className="product-price">
                          R$ {activeTab === 'burger' ? '34,90' : activeTab === 'pizza' ? '55,00' : '45,90'}
                        </div>
                     </div>
                     <div className="product-img-skeleton">
                        {activeTab === 'burger' ? '🍔' : activeTab === 'pizza' ? '🍕' : '🍧'}
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="lp-benefits">
        <div className="landing-container">
          <header className="lp-section-header">
            <h2 className="lp-section-title" style={{ color: 'white' }}>O que muda no seu negócio</h2>
          </header>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon"><TrendingUp size={24} /></div>
              <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Mais lucro</h3>
              <p style={{ color: '#a1a1aa' }}>Receba pedidos simultâneos sem precisar de mais atendentes.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon"><Printer size={24} /></div>
              <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Organização</h3>
              <p style={{ color: '#a1a1aa' }}>Pedidos padronizados direto na impressora térmica.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon"><Clock size={24} /></div>
              <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Fim do caos</h3>
              <p style={{ color: '#a1a1aa' }}>Sexta à noite sem estresse. Pedidos organizados no painel.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon"><BarChart size={24} /></div>
              <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Controle</h3>
              <p style={{ color: '#a1a1aa' }}>Saiba quanto faturou e quem são seus melhores clientes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="lp-pricing" id="pricing">
        <div className="landing-container">
          <header className="lp-section-header">
            <h2 className="lp-section-title">O melhor investimento</h2>
            
            <div className="pricing-toggle-wrapper">
              <span className={billingCycle === 'monthly' ? 'active' : ''}>Mensal</span>
              <button 
                className={`pricing-toggle ${billingCycle === 'annual' ? 'annual' : ''}`}
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              >
                <div className="toggle-dot"></div>
              </button>
              <span className={billingCycle === 'annual' ? 'active' : ''}>Anual <span className="discount-badge">ECONOMIZE</span></span>
            </div>
          </header>

          <div className="pricing-grid-lp">
            <div className="pricing-card-lp">
              <div className="plan-name">Plano Único Profissional</div>
              <div className="plan-price">
                <span className="currency">R$</span>
                <span className="amount">{billingCycle === 'monthly' ? '39,90' : '24,75'}</span>
                <span className="period">/mês</span>
              </div>
              {billingCycle === 'annual' && (
                <p className="annual-total">Apenas R$ 297,00 no ano</p>
              )}
              <p className="plan-desc">Tudo o que você precisa para dominar o seu bairro.</p>
              
              <ul className="plan-features">
                <li><CheckCircle2 size={18} /> Cardápio Digital Ilimitado</li>
                <li><CheckCircle2 size={18} /> Pedidos Ilimitados (Zero Taxas)</li>
                <li><CheckCircle2 size={18} /> Gestão de Bairros e CEP</li>
                <li><CheckCircle2 size={18} /> Impressão Térmica Automática</li>
                <li><CheckCircle2 size={18} /> CRM de Clientes e Remarketing</li>
              </ul>

              <a href={billingCycle === 'monthly' ? 'https://pay.kiwify.com.br/8cR0dlH' : 'https://pay.kiwify.com.br/OLBam8a'} target="_blank" rel="noopener noreferrer" className="btn-lp btn-lp-primary full-width">
                Começar Agora
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="lp-comparison">
        <div className="landing-container">
          <header className="lp-section-header">
            <h2 className="lp-section-title">A Escolha é Simples</h2>
          </header>

          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Recurso</th>
                  <th>WhatsApp manual</th>
                  <th className="anoto-col">ANOTÔ Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Recepção de Pedidos</td>
                  <td>Lenta e Manual</td>
                  <td className="anoto-col">Automática e Instantânea</td>
                </tr>
                <tr>
                  <td>Apresentação do Cardápio</td>
                  <td>PDF ou texto</td>
                  <td className="anoto-col">App digital interativo</td>
                </tr>
                <tr>
                  <td>Erros de anotação</td>
                  <td>Frequentes</td>
                  <td className="anoto-col">Zero Erros</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="lp-cta">
        <div className="landing-container">
          <h2 className="headline" style={{ color: 'white' }}>Quantos pedidos você perdeu hoje?</h2>
          <p className="subheadline center-text" style={{ color: 'white', marginBottom: '3rem' }}>Pare de digitar preços e comece a receber pedidos automáticos.</p>
          <div className="center-content">
            <a href="https://pay.kiwify.com.br/8cR0dlH" target="_blank" rel="noopener noreferrer" className="btn-lp btn-lp-white">
              Quero Profissionalizar Meu Delivery
            </a>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container footer-grid">
          <div className="footer-brand">
            <img src="/assets/logo-anoto.png" alt="ANOTÔ Logo" className="footer-logo" />
            <p className="footer-tagline">Escalando o seu delivery sem depender de taxas abusivas.</p>
          </div>
          
          <div className="footer-links-group">
            <div className="footer-links">
              <h4>Plataforma</h4>
              <Link to="/admin">Login Lojista</Link>
              <Link to="/admin/register">Criar Loja</Link>
              <a href="#pricing">Planos</a>
              <Link to="/legal">Termos e Privacidade</Link>
            </div>

            <div className="footer-links">
              <h4>Suporte</h4>
              <a href="https://wa.me/5519995933655" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="landing-container">
            <p>© 2025 Anotô Platform. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float */}
      <a 
        href="https://wa.me/5519995933655" 
        className="whatsapp-float" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" />
      </a>
    </div>
  );
}
