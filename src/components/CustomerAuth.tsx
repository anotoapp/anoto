import { useState } from 'react';
import { supabase } from '../lib/supabase';
import './CustomerAuth.css';

interface CustomerAuthProps {
  onSuccess: (profile: any) => void;
  onCancel: () => void;
}

export function CustomerAuth({ onSuccess, onCancel }: CustomerAuthProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('phone', phone)
          .eq('password', password)
          .single();

        if (error || !data) throw new Error('WhatsApp ou senha incorretos.');
        
        localStorage.setItem('anoto_customer', JSON.stringify(data));
        onSuccess(data);
      } else {
        const newCustomer = {
          phone,
          password,
          full_name: fullName,
          address
        };

        const { data, error } = await supabase
          .from('customers')
          .insert(newCustomer)
          .select()
          .single();

        if (error) {
          if (error.code === '23505') throw new Error('Este WhatsApp já possui cadastro. Faça login.');
          throw error;
        }

        localStorage.setItem('anoto_customer', JSON.stringify(data));
        onSuccess(data);
      }
    } catch (error: any) {
      alert(error.message || 'Erro ao autenticar. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-auth-modal fade-in">
      <div className="customer-auth-content">
        <h2>{isLogin ? 'Acessar Conta' : 'Cadastre-se para pedir'}</h2>
        <p className="auth-subtitle">
          {isLogin ? 'Que bom te ver novamente!' : 'Seus dados ficam salvos para os próximos pedidos.'}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Nome Completo</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Endereço de Entrega Completo</label>
                <input type="text" placeholder="Rua, número, bairro..." value={address} onChange={e => setAddress(e.target.value)} required />
              </div>
            </>
          )}
          
          <div className="form-group">
            <label>WhatsApp</label>
            <input type="text" placeholder="Ex: 11999999999" value={phone} onChange={e => setPhone(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Crie uma Senha (ou PIN)</label>
            <input type="password" placeholder="Mínimo 4 caracteres" value={password} onChange={e => setPassword(e.target.value)} required minLength={4}/>
          </div>

          <div className="auth-buttons">
            <button type="button" className="secondary-action" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="primary-action" disabled={loading}>
              {loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Criar Conta')}
            </button>
          </div>
        </form>
        
        <p className="toggle-auth" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar com WhatsApp'}
        </p>
      </div>
    </div>
  );
}
