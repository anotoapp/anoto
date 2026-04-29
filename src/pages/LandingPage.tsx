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
  useEffect(() => {
    const handleScroll = () => {
      const nav = document.querySelector('.lp-nav');
      if (window.scrollY > 50) {
        nav?.classList.add('scrolled');
      } else {
        nav?.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll);
    setIsVisible(true);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="lp-nav">
        <div className="landing-container" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <Link to="/" className="lp-logo">
            <img src="/assets/logo-anoto.png" alt="ANOTÔ Logo" style={{ height: '60px', width: 'auto' }} />
          </Link>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to="/admin" className="btn-lp btn-lp-secondary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>
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
              <Link to="/admin/register" className="btn-lp btn-lp-primary">
                Começar a Vender Agora <ArrowRight size={18} style={{ marginLeft: '8px' }} />
              </Link>
            </div>
            <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--lp-text-muted-dark)' }}>
              <CheckCircle2 size={14} style={{ display: 'inline', marginRight: '4px', color: '#16a34a' }}/> Setup em 5 minutos. Sem taxa sobre vendas.
            </p>
          </div>

          <div className={`mockup-composition fade-up delay-1 ${isVisible ? '' : 'hidden'}`}>
            <div className="laptop-mockup">
              <div className="laptop-header">
                <div className="laptop-dot" style={{background: '#ef4444'}}></div>
                <div className="laptop-dot" style={{background: '#f59e0b'}}></div>
                <div className="laptop-dot" style={{background: '#22c55e'}}></div>
              </div>
              <div className="laptop-body">
                <div className="laptop-sidebar">
                  <div className="laptop-skeleton-line" style={{width: '60%', marginBottom: '20px'}}></div>
                  <div className="laptop-skeleton-line" style={{width: '100%'}}></div>
                  <div className="laptop-skeleton-line" style={{width: '80%'}}></div>
                  <div className="laptop-skeleton-line" style={{width: '90%'}}></div>
                </div>
                <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '10px'}}>
                  <div style={{display: 'flex', gap: '10px'}}>
                    <div style={{flex: 1, height: '60px', background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', padding: '10px'}}>
                      <div className="laptop-skeleton-line" style={{width: '40%', marginBottom: '8px', background: '#3f3f46'}}></div>
                      <div className="laptop-skeleton-line" style={{width: '70%', height: '12px', background: '#e63946'}}></div>
                    </div>
                    <div style={{flex: 1, height: '60px', background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', padding: '10px'}}>
                       <div className="laptop-skeleton-line" style={{width: '40%', marginBottom: '8px', background: '#3f3f46'}}></div>
                       <div className="laptop-skeleton-line" style={{width: '50%', height: '12px', background: '#22c55e'}}></div>
                    </div>
                  </div>
                  <div style={{flex: 1, background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', padding: '10px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #27272a', paddingBottom: '10px'}}>
                       <div className="laptop-skeleton-line" style={{width: '20%', background: '#3f3f46'}}></div>
                       <div className="laptop-skeleton-line" style={{width: '10%', background: '#3f3f46'}}></div>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                       <div className="laptop-skeleton-line" style={{width: '30%'}}></div>
                       <div className="laptop-skeleton-line" style={{width: '15%'}}></div>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                       <div className="laptop-skeleton-line" style={{width: '40%'}}></div>
                       <div className="laptop-skeleton-line" style={{width: '10%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="phone-mockup">
              <div className="phone-notch"></div>
              <div className="phone-body">
                <div style={{width: '100%', height: '80px', background: '#e5e5e5', borderRadius: '12px', marginBottom: '15px'}}></div>
                <div style={{width: '60%', height: '16px', background: '#d4d4d8', borderRadius: '8px', marginBottom: '8px'}}></div>
                <div style={{width: '40%', height: '12px', background: '#e4e4e7', borderRadius: '6px', marginBottom: '20px'}}></div>
                
                <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
                   <div style={{width: '60px', height: '24px', background: '#e63946', borderRadius: '12px'}}></div>
                   <div style={{width: '60px', height: '24px', background: '#e4e4e7', borderRadius: '12px'}}></div>
                </div>

                <div style={{display: 'flex', gap: '10px', marginBottom: '10px', background: '#fff', padding: '10px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
                   <div style={{width: '60px', height: '60px', background: '#e5e5e5', borderRadius: '8px'}}></div>
                   <div style={{flex: 1}}>
                      <div style={{width: '80%', height: '12px', background: '#d4d4d8', borderRadius: '4px', marginBottom: '6px'}}></div>
                      <div style={{width: '100%', height: '8px', background: '#e4e4e7', borderRadius: '4px', marginBottom: '4px'}}></div>
                      <div style={{width: '40%', height: '12px', background: '#e63946', borderRadius: '4px', marginTop: '8px'}}></div>
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
            <p className="subheadline" style={{ margin: '0 auto' }}>A cada minuto que seu cliente passa esperando uma resposta, é uma chance de ele ir para o concorrente.</p>
          </header>

          <div className="split-comparison">
            <div className="split-side split-bad">
              <h3 className="split-title"><MessageSquare size={24} /> A Bagunça do WhatsApp</h3>
              <ul className="split-list">
                <li><XCircle size={20} /> 38 mensagens acumuladas não respondidas</li>
                <li><XCircle size={20} /> Cliente perguntando "qual o cardápio?" pela 10ª vez</li>
                <li><XCircle size={20} /> Áudios longos e confusos no meio do pico</li>
                <li><XCircle size={20} /> Pedido anotado errado ou esquecido</li>
                <li><XCircle size={20} /> Print de PIX falso ou perdido na galeria</li>
                <li><XCircle size={20} /> Atendente sobrecarregado (e custando caro)</li>
                <li><XCircle size={20} /> Cliente desiste pela demora e não volta mais</li>
              </ul>
            </div>
            <div className="split-side split-good">
              <h3 className="split-title"><Zap size={24} /> O Profissionalismo ANOTÔ</h3>
              <ul className="split-list">
                <li><CheckCircle2 size={20} /> Pedido cai pronto e pago no painel</li>
                <li><CheckCircle2 size={20} /> Cliente escolhe tudo sozinho em segundos</li>
                <li><CheckCircle2 size={20} /> Cardápio sempre atualizado (itens esgotados somem)</li>
                <li><CheckCircle2 size={20} /> Impressão automática direto para a cozinha</li>
                <li><CheckCircle2 size={20} /> Histórico de clientes para remarketing</li>
                <li><CheckCircle2 size={20} /> Atendimento instantâneo 24h por dia</li>
                <li><CheckCircle2 size={20} /> Operação flui, você foca em qualidade e lucro</li>
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
            <p className="subheadline" style={{ margin: '0 auto', color: '#a1a1aa' }}>Uma experiência de compra ultra-rápida que faz seu cliente sentir que está pedindo em uma rede de fast-food gigante.</p>
          </header>

          <div className="demo-tabs">
            <button className={`demo-tab ${activeTab === 'burger' ? 'active' : ''}`} onClick={() => setActiveTab('burger')}>🍔 Hamburgueria</button>
            <button className={`demo-tab ${activeTab === 'pizza' ? 'active' : ''}`} onClick={() => setActiveTab('pizza')}>🍕 Pizzaria</button>
            <button className={`demo-tab ${activeTab === 'acai' ? 'active' : ''}`} onClick={() => setActiveTab('acai')}>🍧 Açaiteria</button>
          </div>

          <div className="demo-content">
            <div className="phone-mockup" style={{ position: 'relative', transform: 'none', left: 'auto', bottom: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', width: '300px', height: '600px' }}>
              <div className="phone-notch"></div>
              <div className="phone-body" style={{ padding: '0', background: '#fff' }}>
                <div style={{ height: '140px', background: activeTab === 'burger' ? '#18181b' : activeTab === 'pizza' ? '#7f1d1d' : '#4c1d95', position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: '-30px', left: '20px', width: '60px', height: '60px', borderRadius: '50%', background: '#fff', border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    {activeTab === 'burger' ? '🍔' : activeTab === 'pizza' ? '🍕' : '🍧'}
                  </div>
                </div>
                <div style={{ padding: '40px 20px 20px' }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#09090b' }}>
                    {activeTab === 'burger' ? 'Smash Premium' : activeTab === 'pizza' ? 'Pizzaria Napoli' : 'Açaí Tropical'}
                  </h3>
                  <p style={{ margin: '0 0 20px 0', fontSize: '0.8rem', color: '#71717a' }}>Aberto agora • 30-40 min</p>
                  
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'hidden' }}>
                    <div style={{ padding: '6px 12px', background: '#e63946', color: '#fff', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '600' }}>Destaques</div>
                    <div style={{ padding: '6px 12px', background: '#f4f4f5', color: '#71717a', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '600' }}>Combos</div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginBottom: '15px', padding: '12px', border: '1px solid #f4f4f5', borderRadius: '12px' }}>
                     <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#09090b' }}>
                          {activeTab === 'burger' ? 'Duplo Smash Bacon' : activeTab === 'pizza' ? 'Pizza Calabresa (G)' : 'Barca de Açaí 1L'}
                        </h4>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: '#71717a', lineHeight: '1.4' }}>
                          {activeTab === 'burger' ? '2 blends de 90g, cheddar, bacon crocante e molho especial.' : activeTab === 'pizza' ? 'Calabresa fatiada, cebola, azeitonas e mussarela.' : 'Açaí puro com 4 acompanhamentos grátis.'}
                        </p>
                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#09090b' }}>
                          R$ {activeTab === 'burger' ? '34,90' : activeTab === 'pizza' ? '55,00' : '45,90'}
                        </div>
                     </div>
                     <div style={{ width: '80px', height: '80px', background: '#f4f4f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                        {activeTab === 'burger' ? '🍔' : activeTab === 'pizza' ? '🍕' : '🍧'}
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="lp-benefits">
        <div className="landing-container">
          <header className="lp-section-header">
            <h2 className="lp-section-title text-light">O que muda no seu negócio no primeiro mês</h2>
          </header>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon"><TrendingUp size={24} /></div>
              <h3 className="text-light">Mais lucro, menos custo</h3>
              <p>Receba dezenas de pedidos simultâneos sem precisar contratar mais atendentes. O sistema faz o trabalho por você.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon"><Printer size={24} /></div>
              <h3 className="text-light">Cozinha organizada</h3>
              <p>Chega de garrancho no papel. Os pedidos saem padronizados na impressora térmica direto para o chapeiro ou pizzaiolo.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon"><Clock size={24} /></div>
              <h3 className="text-light">Fim do estresse no pico</h3>
              <p>Sexta à noite não precisa ser um caos. Os pedidos entram em fila perfeitamente organizada no seu painel.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon"><BarChart size={24} /></div>
              <h3 className="text-light">Controle total</h3>
              <p>Saiba exatamente quanto faturou, qual o produto mais vendido e quem são seus melhores clientes. Dados para crescer.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Brutal Comparison */}
      <section className="lp-comparison">
        <div className="landing-container">
          <header className="lp-section-header">
            <h2 className="lp-section-title text-dark">A Escolha é Simples</h2>
            <p className="subheadline" style={{ margin: '0 auto', color: '#71717a' }}>Negócios grandes não dependem de WhatsApp manual.</p>
          </header>

          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Recurso</th>
                  <th>WhatsApp Tradicional</th>
                  <th className="anoto-col">ANOTÔ Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Recepção de Pedidos</td>
                  <td>Manual (Um por um)</td>
                  <td className="anoto-col">Automático (Infinitos ao mesmo tempo)</td>
                </tr>
                <tr>
                  <td>Apresentação do Cardápio</td>
                  <td>PDF pesado ou texto confuso</td>
                  <td className="anoto-col">App digital interativo e com fotos</td>
                </tr>
                <tr>
                  <td>Erros de anotação</td>
                  <td>Frequentes (gera prejuízo)</td>
                  <td className="anoto-col">Zero (cliente escolhe e revisa)</td>
                </tr>
                <tr>
                  <td>Impressão na cozinha</td>
                  <td>Não existe ou precisa copiar/colar</td>
                  <td className="anoto-col">1 Clique direto na impressora</td>
                </tr>
                <tr>
                  <td>Controle de Caixa e Vendas</td>
                  <td>No caderno ou planilha</td>
                  <td className="anoto-col">Painel de métricas em tempo real</td>
                </tr>
                <tr>
                  <td>Capacidade de Crescimento</td>
                  <td>Limitada pela velocidade do atendente</td>
                  <td className="anoto-col">Escalável. Pronto para 1.000 pedidos/dia</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="lp-testimonials">
        <div className="landing-container">
          <header className="lp-section-header">
            <h2 className="lp-section-title text-light">Negócios reais crescendo</h2>
          </header>

          <div className="testimonials-grid">
            <div className="testim-card">
              <p>"Antes eu enlouquecia no sábado à noite. O WhatsApp travava, cliente xingava. Hoje os pedidos entram organizados sozinhos e eu só me preocupo em fritar hambúrguer."</p>
              <div className="testim-author">
                <div className="testim-avatar">B</div>
                <div>
                  <strong style={{ display: 'block', color: 'white' }}>Marcos - Burger House</strong>
                  <span style={{ color: '#71717a', fontSize: '0.85rem' }}>Hamburgueria</span>
                </div>
              </div>
            </div>
            <div className="testim-card">
              <p>"Parei de perder cliente por demora no atendimento. A pessoa clica no link do Insta, monta a pizza e me manda. Reduzi os erros de borda recheada a zero."</p>
              <div className="testim-author">
                <div className="testim-avatar">P</div>
                <div>
                  <strong style={{ display: 'block', color: 'white' }}>Roberto - Pizzaria Napoli</strong>
                  <span style={{ color: '#71717a', fontSize: '0.85rem' }}>Pizzaria</span>
                </div>
              </div>
            </div>
            <div className="testim-card">
              <p>"Açaiteria é complicado porque tem muito adicional. No WhatsApp o cliente mandava um áudio de 2 minutos. Com o ANOTÔ, ele marca as caixinhas e o pedido sai perfeito."</p>
              <div className="testim-author">
                <div className="testim-avatar">A</div>
                <div>
                  <strong style={{ display: 'block', color: 'white' }}>Juliana - Açaí Tropical</strong>
                  <span style={{ color: '#71717a', fontSize: '0.85rem' }}>Açaiteria</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="lp-cta">
        <div className="landing-container">
          <h2 className="headline" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>Quantos pedidos você perdeu hoje?</h2>
          <p className="subheadline" style={{ fontSize: '1.25rem' }}>Enquanto você responde mensagem por mensagem digitando preço, seu concorrente recebe pedidos automáticos.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', margin: '3rem 0' }}>
            <Link to="/admin/register" className="btn-lp btn-lp-white" style={{ padding: '1.25rem 3rem', fontSize: '1.2rem' }}>
              Pare de depender do WhatsApp
            </Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="lp-logo" style={{ fontSize: '1.2rem' }}>
            <img src="/assets/logo-anoto.png" alt="ANOTÔ Logo" style={{ height: '50px', width: 'auto' }} />
          </div>
          <div className="footer-copy">© 2024 Anotô Platform. Todos os direitos reservados. Feito para escalar o seu delivery.</div>
        </div>
      </footer>
    </div>
  );
}
