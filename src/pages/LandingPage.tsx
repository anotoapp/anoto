import { Link } from 'react-router-dom';
import { Smartphone, Zap, Heart, CheckCircle } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="landing-nav landing-container">
        <Link to="/" className="logo-text">ANOTÔ</Link>
        <div className="nav-links">
          <a href="#features" className="nav-link">Recursos</a>
          <Link to="/admin/login" className="btn-login-outline">Área do Lojista</Link>
          <Link to="/admin/register" className="btn-primary-small">Criar Minha Loja</Link>
        </div>
      </nav>

      <main>
        <section className="hero landing-container">
          <div className="hero-badge fade-up">✨ O Cardápio Digital que Vende por Você</div>
          <h1 className="fade-up">
            Transforme seu WhatsApp em uma <span className="text-gradient">Máquina de Vendas</span>.
          </h1>
          <p className="hero-subtitle fade-up delay-1">
            Chega de anotar pedidos manualmente. Com o <strong>ANOTÔ</strong>, seus clientes fazem o pedido sozinhos e você recebe tudo organizado no seu WhatsApp.
          </p>
          <div className="hero-actions fade-up delay-2">
            <Link to="/admin/register" className="btn-primary-main">Começar Agora — É Grátis</Link>
            <p className="hero-caption">Sem taxas por pedido. Sem fidelidade.</p>
          </div>
        </section>

        <section id="features" className="features-grid landing-container">
          <div className="feature-card-new fade-up delay-1">
            <div className="feature-icon-wrapper"><Smartphone size={32} /></div>
            <h3>Cardápio Mobile-First</h3>
            <p>Seu cardápio abre instantaneamente no celular do cliente, sem precisar baixar nada.</p>
          </div>
          <div className="feature-card-new fade-up delay-2">
            <div className="feature-icon-wrapper"><Zap size={32} /></div>
            <h3>Rapidez no WhatsApp</h3>
            <p>O cliente seleciona os adicionais e o pedido chega pronto para você imprimir ou produzir.</p>
          </div>
          <div className="feature-card-new fade-up delay-3">
            <div className="feature-icon-wrapper"><Heart size={32} /></div>
            <h3>Fidelize Clientes</h3>
            <p>Crie um banco de dados dos seus clientes e mande promoções direto no WhatsApp deles.</p>
          </div>
        </section>

        <section className="cta-section landing-container">
          <div className="cta-card fade-up">
            <h2>Pronto para profissionalizar seu delivery?</h2>
            <p>Junte-se a centenas de estabelecimentos que já usam o ANOTÔ.</p>
            <Link to="/admin/register" className="btn-secondary">Criar meu cardápio agora</Link>
            
            <div className="cta-benefits">
              <span><CheckCircle size={16} /> Domínio próprio</span>
              <span><CheckCircle size={16} /> Suporte humanizado</span>
              <span><CheckCircle size={16} /> Painel administrativo</span>
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
    </div>
  );
}
