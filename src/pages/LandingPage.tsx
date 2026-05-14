import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, CheckCircle2, XCircle, TrendingUp, 
  Clock, Zap, MessageSquare, Printer, BarChart, Star, UserCheck
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
    
    // Use requestAnimationFrame to avoid "set-state-in-effect" lint error
    const animFrame = requestAnimationFrame(() => setIsVisible(true));
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animFrame);
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
            <div className="lp-hero-buttons" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/admin/register" className="btn-lp btn-lp-primary">
                Começar Teste Grátis <ArrowRight size={18} style={{ marginLeft: '8px' }} />
              </Link>
              <a href="#pricing" className="btn-lp btn-lp-secondary" style={{ background: 'transparent', border: '2px solid rgba(255,255,255,0.2)', color: 'white' }}>
                Ver Planos
              </a>
            </div>
            <p className="hero-trust-tag">
              <CheckCircle2 size={14} /> Setup em 5 minutos. Sem taxa sobre vendas.
            </p>
          </div>

          <div className={`mockup-composition fade-up delay-1 ${isVisible ? '' : 'hidden'}`}>
            <div className="hero-3d-image-container">
              <img src="/assets/LP IMG 1.png" alt="Painel Administrativo Anotô" className="hero-3d-image" />
            </div>
          </div>
        </div>
      </section>

      {/* ROI / Comparison Section */}
      <section className="lp-roi">
        <div className="landing-container">
          <div className="roi-grid">
            <div className="roi-content">
              <div className="roi-tag">POR QUE A ANOTÔ?</div>
              <h2 className="lp-section-title" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                No delivery, <span className="text-primary">cada centavo</span> conta na sua operação.
              </h2>
              <p className="subheadline" style={{ textAlign: 'left', fontSize: '1.1rem', lineHeight: '1.6' }}>
                Você acorda cedo, escolhe os melhores ingredientes e cuida de cada detalhe. Por que deixar 27% do seu faturamento nas mãos de grandes aplicativos? 
                <br /><br />
                Nós valorizamos o seu trabalho. Criamos o ANOTÔ para ser o seu <strong>Escudo de Lucro</strong>. Aqui você paga um valor fixo justo e o restante do dinheiro fica onde deveria estar: <strong>no seu bolso.</strong>
              </p>
              
              <div className="roi-stats-mini">
                <div className="roi-stat-item">
                  <span className="roi-stat-value">ZERO</span>
                  <span className="roi-stat-label">Taxas sobre vendas</span>
                </div>
                <div className="roi-stat-item">
                  <span className="roi-stat-value">100%</span>
                  <span className="roi-stat-label">Lucro é seu</span>
                </div>
              </div>
            </div>

            <div className="roi-card-comparison">
              <div className="comparison-header">Comparativo Mensal (Ex: R$ 10k em vendas)</div>
              
              <div className="comparison-item item-bad">
                <div className="comp-info">
                  <span className="comp-name">Marketplaces (iFood/Outros)</span>
                  <span className="comp-tax">27% de comissão</span>
                </div>
                <div className="comp-cost">- R$ 2.700,00</div>
              </div>

              <div className="comparison-divider">VS</div>

              <div className="comparison-item item-good">
                <div className="comp-info">
                  <span className="comp-name">ANOTÔ Premium</span>
                  <span className="comp-tax">Mensalidade fixa</span>
                </div>
                <div className="comp-cost">+ R$ 39,90</div>
              </div>

              <div className="comparison-footer">
                <div className="savings-label">Economia real de:</div>
                <div className="savings-value">R$ 2.660,10 /mês</div>
                <p>Dinheiro que você poderia usar para reformar sua cozinha ou contratar mais um motoboy.</p>
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
                <li><XCircle size={20} className="icon-bad" /> 38 mensagens acumuladas</li>
                <li><XCircle size={20} className="icon-bad" /> Cliente perguntando "qual o cardápio?"</li>
                <li><XCircle size={20} className="icon-bad" /> Áudios longos e confusos</li>
                <li><XCircle size={20} className="icon-bad" /> Pedido anotado errado ou esquecido</li>
                <li><XCircle size={20} className="icon-bad" /> Print de PIX falso ou perdido</li>
                <li><XCircle size={20} className="icon-bad" /> Atendente sobrecarregado</li>
              </ul>
            </div>
            <div className="split-side split-good">
              <h3 className="split-title"><Zap size={24} /> O Profissionalismo ANOTÔ</h3>
              <ul className="split-list">
                <li><CheckCircle2 size={20} className="icon-good" /> Pedido cai pronto e pago</li>
                <li><CheckCircle2 size={20} className="icon-good" /> Cliente escolhe sozinho em segundos</li>
                <li><CheckCircle2 size={20} className="icon-good" /> Cardápio sempre atualizado</li>
                <li><CheckCircle2 size={20} className="icon-good" /> Impressão direta para a cozinha</li>
                <li><CheckCircle2 size={20} className="icon-good" /> Histórico de clientes (Remarketing)</li>
                <li><CheckCircle2 size={20} className="icon-good" /> Atendimento instantâneo 24h</li>
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
                <div className="demo-cover" style={{ background: activeTab === 'burger' ? 'url(https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=400) center/cover' : activeTab === 'pizza' ? 'url(https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400) center/cover' : 'url(https://images.unsplash.com/photo-1590005354167-6da97ce23155?auto=format&fit=crop&q=80&w=400) center/cover' }}>
                  <div className="demo-overlay"></div>
                </div>
                
                <div className="demo-details" key={activeTab} style={{ animation: 'fadeInUpDemo 0.4s ease' }}>
                  <div className="demo-logo-float">
                    {activeTab === 'burger' ? '🍔' : activeTab === 'pizza' ? '🍕' : '🍧'}
                  </div>
                  
                  <h3 className="demo-title">
                    {activeTab === 'burger' ? 'Smash Premium' : activeTab === 'pizza' ? 'Pizzaria Napoli' : 'Açaí Tropical'}
                  </h3>
                  <div className="demo-meta-tags">
                    <span className="demo-tag"><CheckCircle2 size={12} color="#10b981"/> Aberto</span>
                    <span className="demo-tag"><Clock size={12}/> 30-45 min</span>
                    <span className="demo-tag"><Star size={12} fill="#eab308" color="#eab308"/> 4.9</span>
                  </div>
                  
                  <div className="demo-cats-scroll">
                    <div className="cat-badge active">Destaques</div>
                    <div className="cat-badge">Combos</div>
                    <div className="cat-badge">Bebidas</div>
                    <div className="cat-badge">Sobremesas</div>
                  </div>

                  <div className="demo-product-card">
                     <div className="product-info">
                        <h4 className="product-title">
                          {activeTab === 'burger' ? 'Smash Bacon Duplo' : activeTab === 'pizza' ? 'Pizza Calabresa (G)' : 'Barca de Açaí 1L'}
                        </h4>
                        <p className="product-desc">
                          {activeTab === 'burger' ? 'Pão brioche, 2 blends 90g, cheddar inglês e bacon artesanal.' : activeTab === 'pizza' ? 'Massa de longa fermentação, calabresa defumada e cebola.' : 'Açaí puro batido com xarope de guaraná e muito leite em pó.'}
                        </p>
                        <div className="product-price">
                          R$ {activeTab === 'burger' ? '34,90' : activeTab === 'pizza' ? '55,00' : '45,90'}
                        </div>
                     </div>
                     <div className="product-img-rich">
                        {activeTab === 'burger' ? '🍔' : activeTab === 'pizza' ? '🍕' : '🍧'}
                     </div>
                  </div>

                  <div className="demo-options-section">
                    <div className="demo-options-title">
                       Adicionais <span className="demo-required">Opcional</span>
                    </div>
                    <div className="demo-option-item">
                      <div className="opt-left">
                        <span className="opt-name">{activeTab === 'burger' ? '+ Bacon Extra' : activeTab === 'pizza' ? '+ Borda Recheada' : '+ Leite Ninho'}</span>
                        <span className="opt-price">+ R$ {activeTab === 'burger' ? '4,50' : activeTab === 'pizza' ? '12,00' : '3,00'}</span>
                      </div>
                      <div className="opt-checkbox"></div>
                    </div>
                    <div className="demo-option-item">
                      <div className="opt-left">
                        <span className="opt-name">{activeTab === 'burger' ? '+ Hambúrguer' : activeTab === 'pizza' ? '+ Queijo Extra' : '+ Nutella'}</span>
                        <span className="opt-price">+ R$ {activeTab === 'burger' ? '8,00' : activeTab === 'pizza' ? '8,00' : '6,00'}</span>
                      </div>
                      <div className="opt-checkbox active"><CheckCircle2 size={12} color="white" /></div>
                    </div>
                  </div>
                </div>

                <div className="demo-bottom-bar">
                  <div className="demo-qty">
                    <span>-</span> 1 <span>+</span>
                  </div>
                  <div className="demo-add-btn">
                    Adicionar <span>R$ {activeTab === 'burger' ? '42,90' : activeTab === 'pizza' ? '63,00' : '51,90'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CRM Section */}
      <section className="lp-crm">
        <div className="landing-container">
          <div className="crm-grid">
            <div className="crm-content">
              <div className="crm-tag">CRM & MÁQUINA DE VENDAS</div>
              <h2 className="crm-headline">
                Conheça seu cliente. <br /><span className="text-primary">Venda o dobro.</span>
              </h2>
              <p className="crm-desc">
                Você sabe quem comprou de você na semana passada e não voltou mais? O <strong>ANOTÔ</strong> possui um CRM integrado que mapeia o comportamento de compra de cada cliente.
                <br /><br />
                Saiba exatamente o que eles gostam, quando costumam pedir e dispare mensagens automáticas no WhatsApp com cupons focados para resgatar clientes ausentes.
              </p>
              
              <ul className="crm-features">
                <li><UserCheck size={20} className="icon-primary" /> Histórico completo de pedidos por cliente</li>
                <li><MessageSquare size={20} className="icon-primary" /> Remarketing no WhatsApp com 1 clique</li>
                <li><Star size={20} className="icon-primary" /> Pesquisa de satisfação (NPS) no rastreio</li>
                <li><TrendingUp size={20} className="icon-primary" /> Filtro de clientes inativos (+30 dias)</li>
              </ul>
            </div>

            <div className="crm-visual">
              <div className="crm-dashboard-card">
                <div className="crm-card-header">
                  <div className="crm-user-info">
                    <div className="crm-avatar">JS</div>
                    <div>
                      <h4 className="crm-user-name">João Silva</h4>
                      <p className="crm-user-meta">Cliente VIP • 12 pedidos</p>
                    </div>
                  </div>
                  <div className="crm-status-badge">Ausente (+35 dias)</div>
                </div>
                
                <div className="crm-stats-row">
                  <div className="crm-mini-stat">
                    <span>Ticket Médio</span>
                    <strong>R$ 85,50</strong>
                  </div>
                  <div className="crm-mini-stat">
                    <span>Favorito</span>
                    <strong>Smash Bacon</strong>
                  </div>
                </div>

                <div className="crm-action-box">
                  <p>Recupere este cliente agora mesmo:</p>
                  <button className="crm-btn-recover">
                    <MessageSquare size={16} /> Enviar Cupom "VOLTA10"
                  </button>
                </div>
              </div>
              
              <div className="crm-float-card fade-up delay-2">
                <div className="float-stars">
                  <Star size={16} fill="#eab308" color="#eab308" />
                  <Star size={16} fill="#eab308" color="#eab308" />
                  <Star size={16} fill="#eab308" color="#eab308" />
                  <Star size={16} fill="#eab308" color="#eab308" />
                  <Star size={16} fill="#eab308" color="#eab308" />
                </div>
                <p className="float-nps-text">"Melhor lanche da região! Chegou quentinho e no prazo."</p>
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
          <div className="center-content" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/admin/register" className="btn-lp btn-lp-white">
              Criar Conta Grátis
            </Link>
            <a href="https://pay.kiwify.com.br/8cR0dlH" target="_blank" rel="noopener noreferrer" className="btn-lp btn-lp-primary" style={{ background: 'transparent', border: '2px solid rgba(255,255,255,0.3)', color: 'white' }}>
              Assinar Premium
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
