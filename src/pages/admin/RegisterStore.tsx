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
  const navigate = useNavigate();

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
      // 0. Verificar se o email está na whitelist da Kiwify
      const { data: isAuthorized, error: authCheckError } = await supabase
        .rpc('is_email_authorized', { check_email: email });

      if (authCheckError) throw authCheckError;

      if (!isAuthorized) {
        alert(
          `❌ Este e-mail (${email}) não possui uma assinatura ativa no ANOTÔ.\n\n` +
          `Para criar sua loja, adquira uma assinatura em:\nhttps://pay.kiwify.com.br/8cR0dlH\n\n` +
          `Após a compra, volte aqui e cadastre-se com o mesmo e-mail usado na Kiwify.`
        );
        setLoading(false);
        return;
      }

      // 1. Create User

      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;
      if (!authData.user) throw new Error('Falha ao criar usuário');

      // 2. Create Profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        role: 'admin',
        full_name: fullName,
        email: email
      });
      if (profileError) throw profileError;

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
        owner_id: authData.user.id,
        name: storeName,
        slug: slug,
        whatsapp_number: whatsapp,
        logo: '/assets/logo-anoto.png', // default
        banner: '/assets/banner.png', // default
        address: address || 'Endereço da loja',
        delivery_fee: 5.00,
        min_order: 20.00,
        opening_hours: JSON.stringify(defaultOpeningHours)
      });
      if (storeError) throw storeError;

      alert('Sua loja foi criada com sucesso! Faça login para continuar.');
      navigate('/admin/login');
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
          <h2>Crie sua Loja Virtual</h2>
          <p>Configure seu cardápio digital em minutos</p>
        </div>

        {/* Notice: requires purchase */}
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '12px',
          padding: '14px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          fontSize: '0.85rem'
        }}>
          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🔑</span>
          <div>
            <strong style={{ color: '#92400e', display: 'block', marginBottom: '4px' }}>
              Assinatura necessária
            </strong>
            <span style={{ color: '#78350f', lineHeight: '1.5' }}>
              Use o <strong>mesmo e-mail</strong> da sua compra na Kiwify.
              Ainda não assinou?{' '}
              <a
                href="https://pay.kiwify.com.br/8cR0dlH"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#d97706', fontWeight: '700', textDecoration: 'underline' }}
              >
                Clique aqui para assinar →
              </a>
            </span>
          </div>
        </div>

        <div className="form-group">
          <label>Seu Nome Completo</label>
          <input type="text" placeholder="João da Silva" value={fullName} onChange={e => setFullName(e.target.value)} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>E-mail (o mesmo da compra)</label>
            <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Crie uma Senha</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
          </div>
        </div>

        <div className="form-divider"></div>

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
          {loading ? 'Verificando assinatura...' : 'Criar Minha Loja'}
        </button>

        <div className="auth-footer">
          <p>Já tem uma loja? <Link to="/admin/login">Fazer login</Link></p>
        </div>
      </form>
    </div>
  );
}
