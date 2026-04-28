import { Link } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="landing-nav landing-container">
        <Link to="/" className="logo" style={{ fontSize: '2rem', letterSpacing: '-1px' }}>ANOTÔ</Link>
        <div className="nav-links">
          <a href="#features" className="nav-link">Recursos</a>
          <a href="#about" className="nav-link">Planos</a>
          <Link to="/admin/login" className="btn-login">Área do Lojista</Link>
        </div>
      </nav>

      <main className="landing-container">
        <section className="hero">
          <h1 className="fade-up">
            <span style={{ color: 'var(--landing-secondary)' }}>Anota aí:</span> <br />
            Seu restaurante pronto para vender online.
          </h1>
          <p className="fade-up delay-1">
            Com o <strong>ANOTÔ</strong>, você cria seu cardápio digital em minutos, recebe pedidos direto no WhatsApp e tem o controle total do seu negócio. Simples, rápido e eficiente.
          </p>
          <div className="hero-actions fade-up delay-2">
            <Link to="/admin/register" className="btn-primary">Começar agora gratuitamente</Link>
            <Link to="/admin/login" className="btn-login">Acessar meu painel</Link>
          </div>
        </section>

        <section id="features" className="features">
          <div className="feature-card fade-up delay-1">
            <div className="feature-icon" style={{ background: 'rgba(255, 183, 3, 0.1)', color: 'var(--landing-secondary)' }}>📝</div>
            <h3>Cardápio Inteligente</h3>
            <p>Organize seus produtos por categorias, adicione adicionais e fotos incríveis que dão fome.</p>
          </div>

          <div className="feature-card fade-up delay-2">
            <div className="feature-icon" style={{ background: 'rgba(230, 57, 70, 0.1)', color: 'var(--landing-primary)' }}>🟢</div>
            <h3>Direto no WhatsApp</h3>
            <p>Nada de taxas abusivas de aplicativos. O pedido chega limpo e organizado no seu WhatsApp.</p>
          </div>

          <div className="feature-card fade-up delay-3">
            <div className="feature-icon" style={{ background: 'rgba(255, 183, 3, 0.1)', color: 'var(--landing-secondary)' }}>🎨</div>
            <h3>Sua Identidade</h3>
            <p>Personalize cores, logo e banners para deixar o cardápio com a cara da sua marca.</p>
          </div>
        </section>

        <section className="hero" style={{ padding: '5rem 0' }}>
          <h2 className="fade-up">O sistema que <span style={{ color: 'var(--landing-primary)' }}>anota</span> e você lucra.</h2>
          <p className="fade-up delay-1">Pare de perder pedidos por demora no atendimento humano. Automatize com o ANOTÔ.</p>
          <div className="hero-actions fade-up delay-2" style={{ marginTop: '2rem' }}>
            <Link to="/admin/register" className="btn-primary" style={{ padding: '1.2rem 3rem', fontSize: '1.2rem' }}>
              Quero o ANOTÔ no meu negócio
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-container" style={{ padding: '3rem 0', textAlign: 'center', borderTop: '1px solid var(--glass-border)', marginTop: '4rem' }}>
        <p style={{ color: 'var(--landing-text)', fontWeight: '700', marginBottom: '1rem', fontSize: '1.2rem' }}>ANOTÔ</p>
        <p style={{ color: 'var(--landing-text-muted)' }}>&copy; 2024 ANOTÔ White Label. A tecnologia que seu restaurante precisa.</p>
      </footer>
    </div>
  );
}
