import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import './AdminAuth.css';

export default function RegisterStore() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const navigate = useNavigate();

  useState(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setSessionUser(data.user);
        setEmail(data.user.email || '');
      }
    });
  });

  const handleStoreNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setStoreName(newName);
    setSlug(
      newName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Removido check de whitelist para permitir cadastro aberto
      const plan = 'Mensal'; // Plano padrão após trial

      // 1. Create/Identify User
      let userId = sessionUser?.id;

      if (!sessionUser) {
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;
        if (!authData.user) throw new Error('Falha ao criar usuário');
        userId = authData.user.id;
      }

      // 2. Create Profile (if not exists)
      const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', userId).single();
      
      if (!existingProfile) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: userId,
          role: 'admin',
          full_name: fullName || email.split('@')[0],
          email: email
        });
        if (profileError) throw profileError;
      }

      const defaultOpeningHours = {
        monday: { isOpen: true, open: '18:00', close: '23:00' },
        tuesday: { isOpen: true, open: '18:00', close: '23:00' },
        wednesday: { isOpen: true, open: '18:00', close: '23:00' },
        thursday: { isOpen: true, open: '18:00', close: '23:00' },
        friday: { isOpen: true, open: '18:00', close: '23:00' },
        saturday: { isOpen: true, open: '18:00', close: '23:00' },
        sunday: { isOpen: true, open: '18:00', close: '23:00' }
      };

      // 3. Create Store
      const { error: storeError } = await supabase.from('stores').insert({
        owner_id: userId,
        name: storeName,
        slug: slug,
        whatsapp_number: whatsapp,
        logo: '/assets/logo-anoto.png', // default
        banner: '/assets/banner.png', // default
        address: address || 'Endereço da loja',
        delivery_fee: 5.00,
        min_order: 20.00,
        opening_hours: JSON.stringify(defaultOpeningHours),
        plan_type: plan || 'Mensal'
      });
      if (storeError) throw storeError;

      alert('Sua loja foi criada com sucesso!');
      if (!sessionUser) {
        navigate('/admin/login');
      } else {
        window.location.href = '/admin'; // Force reload to refresh context
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao criar loja. Tente novamente.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-container fade-in">
      <form onSubmit={handleRegister} className="admin-auth-form">
        <div className="auth-logo-wrapper">
          <img src="/assets/logo-anoto.png" alt="ANOTÔ Logo" />
        </div>
        <div className="auth-header">
          <h2>{sessionUser ? 'Configure sua Loja' : 'Crie sua Loja Virtual'}</h2>
          <p>{sessionUser ? 'Complete os dados da sua nova loja' : 'Configure seu cardápio digital em minutos'}</p>
        </div>

        {/* Informação sobre o Teste Grátis */}
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '12px',
          padding: '14px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          fontSize: '0.85rem'
        }}>
          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🚀</span>
          <div>
            <strong style={{ color: '#166534', display: 'block', marginBottom: '4px' }}>
              30 Dias de Teste Grátis
            </strong>
            <span style={{ color: '#15803d', lineHeight: '1.5' }}>
              Crie sua loja agora e aproveite todos os recursos por 30 dias sem compromisso.
            </span>
          </div>
        </div>

        {!sessionUser && (
          <>
            <div className="form-group">
              <label>Seu Nome Completo</label>
              <input type="text" placeholder="João da Silva" value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Seu melhor E-mail</label>
              <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Crie uma Senha</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', fontStyle: 'italic' }}>
                * Você precisará confirmar seu e-mail clicando no link que enviaremos.
              </p>
            </div>

            <div className="form-divider"></div>
          </>
        )}

        <div className="form-group">
          <label>Nome da sua Loja</label>
          <input type="text" placeholder="Ex: A Melhor Hamburgueria" value={storeName} onChange={handleStoreNameChange} required />
          {slug && <p className="slug-preview">Seu link será: <strong>app.com/{slug}</strong></p>}
        </div>

        <div className="form-group">
          <label>Endereço Completo</label>
          <input type="text" placeholder="Rua, Número, Bairro, Cidade - UF" value={address} onChange={e => setAddress(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>WhatsApp da Loja (Somente números)</label>
          <input type="text" placeholder="5511999999999" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} required />
        </div>

        <button type="submit" className="primary-action" disabled={loading}>
          {loading ? 'Criando loja...' : 'Criar Minha Loja (30 dias grátis)'}
        </button>

        <div className="auth-footer">
          <p>Já tem uma loja? <Link to="/admin/login">Fazer login</Link></p>
        </div>
      </form>
    </div>
  );
}
