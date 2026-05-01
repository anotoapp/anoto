import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Users, 
  TrendingUp, 
  Check, 
  ChevronDown, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  Printer,
  Globe
} from 'lucide-react';

import './LandingPage.css';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <MapPin />,
      title: "CEP Automático",
      description: "Seu cliente digita o CEP e o endereço aparece na hora. Menos cliques, mais vendas."
    },
    {
      icon: <Users />,
      title: "CRM Inteligente",
      description: "Saiba quem são seus melhores clientes, o que eles amam e quando foi a última compra."
    },
    {
      icon: <Globe />,
      title: "Subdomínios Próprios",
      description: "Sua loja com link profissional: lojateste.anoto.app. Autoridade total para sua marca."
    },
    {
      icon: <TrendingUp />,
      title: "Relatórios de Vendas",
      description: "Acompanhe faturamento, ticket médio e produtos mais vendidos em tempo real."
    },
    {
      icon: <Printer />,
      title: "Impressão Térmica",
      description: "Envie pedidos direto para a cozinha com integração total a impressoras térmicas."
    },
    {
      icon: <Zap />,
      title: "Checkout em 30s",
      description: "Processo de compra otimizado para mobile, sem logins complicados ou senhas chatas."
    }
  ];

  const faqs = [
    {
      q: "Preciso de um computador para usar?",
      a: "Não! O painel administrativo é 100% responsivo. Você pode gerenciar sua loja, cadastrar produtos e receber pedidos direto pelo seu celular."
    },
    {
      q: "Como recebo o pagamento dos pedidos?",
      a: "O ANOTÔ não retém seu dinheiro. Os pagamentos são feitos diretamente para você via Pix ou Cartão na entrega, conforme você configurar."
    },
    {
      q: "Posso usar meu próprio domínio?",
      a: "Sim! No plano Pro e Diamond, você pode conectar seu domínio .com ou .com.br para uma experiência 100% personalizada."
    },
    {
      q: "Tem taxa sobre as vendas?",
      a: "Zero! Nós cobramos apenas uma mensalidade fixa. Todo o lucro das suas vendas é 100% seu."
    }
  ];

  return (
    <div className="lp-wrapper">
      <header className={`lp-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="landing-container lp-nav">
          <img src="/assets/logo-anoto.png" alt="ANOTÔ" className="lp-logo" />
          <nav className="lp-nav-links">
            <a href="#recursos">Recursos</a>
            <a href="#precos">Preços</a>
            <a href="#faq">FAQ</a>
            <Link to="/admin/login" className="lp-btn-secondary">Login</Link>
            <Link to="/admin/register" className="lp-btn-primary">Criar Minha Loja</Link>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="lp-hero">
          <div className="landing-container fade-in">
            <div className="lp-badge">
              <Zap size={16} /> O sistema de delivery mais rápido do Brasil
            </div>
            <h1>Seu restaurante pronto para o <br /> <span>Próximo Nível.</span></h1>
            <p>
              Abandone o papel e caneta. Tenha um sistema completo de pedidos online, 
              gestão de clientes e inteligência de vendas. Tudo em um só lugar.
            </p>
            <div className="hero-actions">
              <Link to="/admin/register" className="lp-btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                Começar Teste Grátis <ArrowRight size={18} style={{ marginLeft: '8px' }} />
              </Link>
              <a href="#recursos" className="lp-btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                Ver Funcionalidades
              </a>
            </div>
            
            <div className="hero-mockup">
              <img src="/assets/anoto_dashboard_mockup_1777612676913.png" alt="Painel Administrativo ANOTÔ" />
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="recursos" className="lp-section">
          <div className="landing-container">
            <div className="section-header fade-in">
              <div className="lp-badge" style={{ color: 'var(--lp-primary)' }}>Recursos</div>
              <h2>Feito por quem entende de Delivery</h2>
              <p>Ferramentas pensadas para aumentar seu ticket médio e fidelizar seus clientes.</p>
            </div>
            
            <div className="features-grid">
              {features.map((f, i) => (
                <div key={i} className="feature-card fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="precos" className="lp-section" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="landing-container">
            <div className="section-header fade-in">
              <div className="lp-badge">Planos</div>
              <h2>O melhor custo-benefício</h2>
              <p>Escolha o plano ideal para o tamanho da sua operação.</p>
            </div>

            <div className="pricing-grid">
              {/* BASIC */}
              <div className="pricing-card fade-in">
                <h3>Starter</h3>
                <div className="price">R$ 59<span>/mês</span></div>
                <ul className="pricing-features">
                  <li><Check size={18} /> Pedidos Ilimitados</li>
                  <li><Check size={18} /> Cardápio Digital</li>
                  <li><Check size={18} /> Gestão de Bairros</li>
                  <li><Check size={18} /> Suporte via WhatsApp</li>
                </ul>
                <Link to="/admin/register" className="lp-btn-secondary">Assinar Starter</Link>
              </div>

              {/* PRO */}
              <div className="pricing-card popular fade-in">
                <div className="popular-badge">MAIS VENDIDO</div>
                <h3>Growth</h3>
                <div className="price">R$ 97<span>/mês</span></div>
                <ul className="pricing-features">
                  <li><Check size={18} /> <strong>Tudo do Starter</strong></li>
                  <li><Check size={18} /> Busca por CEP Automática</li>
                  <li><Check size={18} /> CRM de Clientes Completo</li>
                  <li><Check size={18} /> Subdomínio Personalizado</li>
                  <li><Check size={18} /> Cupons de Desconto</li>
                </ul>
                <Link to="/admin/register" className="lp-btn-primary">Assinar Growth</Link>
              </div>

              {/* ENTERPRISE */}
              <div className="pricing-card fade-in">
                <h3>Diamond</h3>
                <div className="price">R$ 147<span>/mês</span></div>
                <ul className="pricing-features">
                  <li><Check size={18} /> <strong>Tudo do Growth</strong></li>
                  <li><Check size={18} /> Domínio Próprio (.com.br)</li>
                  <li><Check size={18} /> Relatórios de BI Avançados</li>
                  <li><Check size={18} /> Gestor de Tráfego Dedicado</li>
                  <li><Check size={18} /> Suporte VIP 24h</li>
                </ul>
                <Link to="/admin/register" className="lp-btn-secondary">Assinar Diamond</Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="lp-section">
          <div className="landing-container">
            <div className="section-header fade-in">
              <h2>Dúvidas Frequentes</h2>
              <p>Tudo o que você precisa saber para começar hoje mesmo.</p>
            </div>

            <div className="faq-list">
              {faqs.map((f, i) => (
                <div key={i} className={`faq-item ${activeFaq === i ? 'active' : ''} fade-in`}>
                  <div className="faq-question" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                    {f.q}
                    <ChevronDown size={20} style={{ transform: activeFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                  </div>
                  <div className="faq-answer">{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="lp-section" style={{ textAlign: 'center' }}>
          <div className="landing-container fade-in">
            <h2 style={{ fontSize: '3.5rem', marginBottom: '2rem' }}>Pronto para faturar mais?</h2>
            <Link to="/admin/register" className="lp-btn-primary" style={{ padding: '1.5rem 4rem', fontSize: '1.25rem' }}>
              Criar Minha Loja Agora
            </Link>
            <p style={{ marginTop: '2rem', color: 'var(--lp-text-muted)' }}>
              Sem cartão de crédito. Teste grátis por 7 dias.
            </p>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="landing-container">
          <div className="footer-grid">
            <div className="footer-about">
              <img src="/assets/logo-anoto.png" alt="ANOTÔ" className="lp-logo" />
              <p>A plataforma definitiva para escala de restaurantes e delivery no Brasil.</p>
            </div>
            <div className="footer-links">
              <h4>Produto</h4>
              <ul>
                <li><a href="#recursos">Recursos</a></li>
                <li><a href="#precos">Preços</a></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>Empresa</h4>
              <ul>
                <li><a href="#">Sobre nós</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Contato</a></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacidade</a></li>
                <li><a href="#">Termos de Uso</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 ANOTÔ APP. Todos os direitos reservados.</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <ShieldCheck size={18} /> 100% Seguro
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
