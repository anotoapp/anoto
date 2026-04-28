import { Link } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="landing-nav landing-container">
        <Link to="/" className="logo">FastMenu</Link>
        <div className="nav-links">
          <a href="#features" className="nav-link">Recursos</a>
          <a href="#about" className="nav-link">Sobre</a>
          <Link to="/admin/login" className="btn-login">Entrar como Lojista</Link>
        </div>
      </nav>

      <main className="landing-container">
        <section className="hero">
          <h1 className="fade-up">
            <span>Seu restaurante digital</span> <br />
            em poucos minutos.
          </h1>
          <p className="fade-up delay-1">
            Crie seu cardápio online, receba pedidos via WhatsApp e gerencie tudo em um só lugar. A solução White Label perfeita para o seu negócio.
          </p>
          <div className="hero-actions fade-up delay-2">
            <Link to="/admin/register" className="btn-primary">Criar minha loja agora</Link>
            <Link to="/admin/login" className="btn-login">Acessar meu painel</Link>
          </div>
        </section>

        <section id="features" className="features">
          <div className="feature-card fade-up delay-1">
            <div className="feature-icon">🚀</div>
            <h3>Configuração Rápida</h3>
            <p>Cadastre seus produtos, categorias e personalize as cores da sua marca em instantes.</p>
          </div>

          <div className="feature-card fade-up delay-2">
            <div className="feature-icon">📱</div>
            <h3>Pedidos no WhatsApp</h3>
            <p>Receba os pedidos detalhados diretamente no WhatsApp do seu estabelecimento.</p>
          </div>

          <div className="feature-card fade-up delay-3">
            <div className="feature-icon">📊</div>
            <h3>Painel Completo</h3>
            <p>Acompanhe suas vendas, gerencie estoque e visualize métricas de desempenho em tempo real.</p>
          </div>
        </section>

        <section className="hero" style={{ padding: '5rem 0' }}>
          <h2 className="fade-up">Pronto para digitalizar?</h2>
          <p className="fade-up delay-1">Junte-se a centenas de restaurantes que já estão vendendo mais com o FastMenu.</p>
          <div className="hero-actions fade-up delay-2">
            <Link to="/admin/register" className="btn-primary">Começar gratuitamente</Link>
          </div>
        </section>
      </main>

      <footer className="landing-container" style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--landing-text-muted)' }}>
        <p>&copy; 2024 FastMenu White Label. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
