import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import './AdminAuth.css';

export default function LoginAdmin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/admin');
    } catch {
      alert('Erro ao fazer login. Verifique se o e-mail e senha estão corretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-container fade-in">
      <form onSubmit={handleLogin} className="admin-auth-form">
        <div className="auth-header">
          <h2>Painel do Lojista</h2>
          <p>Entre para gerenciar seus pedidos</p>
        </div>
        
        <div className="form-group">
          <label>E-mail</label>
          <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        
        <div className="form-group">
          <label>Senha</label>
          <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>

        <button type="submit" className="primary-action" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        
        <div className="auth-footer">
          <p>Não tem uma loja? <Link to="/admin/register">Criar conta</Link></p>
        </div>
      </form>
    </div>
  );
}
