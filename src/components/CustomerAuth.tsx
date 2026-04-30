import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Check, MapPin, Phone, User, Lock, ArrowRight } from 'lucide-react';
import './CustomerAuth.css';

interface CustomerProfile {
  id?: string;
  full_name?: string;
  address?: string;
  phone?: string;
  neighborhood?: string;
  cep?: string;
}

interface CustomerAuthProps {
  onSuccess: (profile: CustomerProfile) => void;
  onCancel: () => void;
}

type AuthStep = 'identification' | 'login' | 'register-info' | 'register-address';

export function CustomerAuth({ onSuccess, onCancel }: CustomerAuthProps) {
  const [step, setStep] = useState<AuthStep>('identification');
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [lgpdAccepted, setLgpdAccepted] = useState(false);

  // Check if user exists when phone is submitted
  const handleCheckUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', phone)
        .maybeSingle();

      if (data) {
        setStep('login');
      } else {
        setStep('register-info');
      }
    } catch (error) {
      console.error('Check user error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', phone)
        .eq('password', password)
        .single();

      if (error || !data) throw new Error('WhatsApp ou senha incorretos.');
      
      localStorage.setItem('anoto_customer', JSON.stringify(data));
      onSuccess(data);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lgpdAccepted) {
      alert('Você precisa aceitar os Termos de Uso e LGPD.');
      return;
    }

    setLoading(true);
    try {
      const newCustomer = {
        phone,
        password,
        full_name: fullName,
        address,
        neighborhood,
        cep
      };

      const { data, error } = await supabase
        .from('customers')
        .insert(newCustomer)
        .select()
        .single();

      if (error) throw error;

      localStorage.setItem('anoto_customer', JSON.stringify(data));
      onSuccess(data);
    } catch (error: any) {
      alert('Erro ao criar conta: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCepLookup = async (value: string) => {
    const cleanCep = value.replace(/\D/g, '');
    setCep(cleanCep);
    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setNeighborhood(data.bairro);
          setAddress(`${data.logradouro}, `);
        }
      } catch (error) {
        console.error('CEP lookup error:', error);
      }
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'identification':
        return (
          <form onSubmit={handleCheckUser} className="auth-step-form">
            <h2>Bem-vindo!</h2>
            <p className="auth-subtitle">Para começar, informe seu WhatsApp.</p>
            <div className="form-group icon-input">
              <Phone size={18} className="input-icon" />
              <input 
                type="tel" 
                placeholder="Ex: 11999999999" 
                value={phone} 
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} 
                required 
                autoFocus
              />
            </div>
            <button type="submit" className="primary-action" disabled={loading || phone.length < 10}>
              {loading ? 'Verificando...' : 'Continuar'} <ArrowRight size={18} />
            </button>
          </form>
        );

      case 'login':
        return (
          <form onSubmit={handleLogin} className="auth-step-form">
            <button type="button" className="back-btn" onClick={() => setStep('identification')}>
              <ArrowLeft size={18} /> Voltar
            </button>
            <h2>Acessar conta</h2>
            <p className="auth-subtitle">Já encontramos seu cadastro. Digite sua senha.</p>
            <div className="form-group icon-input">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                placeholder="Sua senha" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                autoFocus
              />
            </div>
            <button type="submit" className="primary-action" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
            <p className="forgot-password">Esqueceu a senha? Chame no WhatsApp da loja.</p>
          </form>
        );

      case 'register-info':
        return (
          <form onSubmit={(e) => { e.preventDefault(); setStep('register-address'); }} className="auth-step-form">
            <button type="button" className="back-btn" onClick={() => setStep('identification')}>
              <ArrowLeft size={18} /> Voltar
            </button>
            <h2>Criar conta</h2>
            <p className="auth-subtitle">Quase lá! Como podemos te chamar?</p>
            
            <div className="form-group icon-input">
              <User size={18} className="input-icon" />
              <input 
                type="text" 
                placeholder="Nome Completo" 
                value={fullName} 
                onChange={e => setFullName(e.target.value)} 
                required 
                autoFocus
              />
            </div>

            <div className="form-group icon-input">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                placeholder="Crie uma senha" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                minLength={4}
              />
            </div>

            <button type="submit" className="primary-action">
              Próximo: Endereço <ArrowRight size={18} />
            </button>
          </form>
        );

      case 'register-address':
        return (
          <form onSubmit={handleRegister} className="auth-step-form">
            <button type="button" className="back-btn" onClick={() => setStep('register-info')}>
              <ArrowLeft size={18} /> Voltar
            </button>
            <h2>Onde entregamos?</h2>
            <p className="auth-subtitle">Informe seu endereço para calcularmos a entrega.</p>

            <div className="form-row">
              <div className="form-group">
                <label>CEP</label>
                <input 
                  type="text" 
                  placeholder="00000-000" 
                  value={cep} 
                  onChange={e => handleCepLookup(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Bairro</label>
                <input 
                  type="text" 
                  placeholder="Seu bairro" 
                  value={neighborhood} 
                  onChange={e => setNeighborhood(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Rua e Número</label>
              <input 
                type="text" 
                placeholder="Ex: Rua das Flores, 123" 
                value={address} 
                onChange={e => setAddress(e.target.value)} 
                required 
              />
            </div>

            <div className="lgpd-consent">
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  checked={lgpdAccepted} 
                  onChange={e => setLgpdAccepted(e.target.checked)} 
                  required 
                />
                <span className="checkmark"></span>
                <span className="consent-text">
                  Aceito os <a href="#">Termos de Uso</a> e autorizo o uso dos meus dados para processar este pedido (LGPD).
                </span>
              </label>
            </div>

            <button type="submit" className="primary-action" disabled={loading}>
              {loading ? 'Finalizando...' : 'Concluir Cadastro'} <Check size={18} />
            </button>
          </form>
        );
    }
  };

  return (
    <div className="customer-auth-modal fade-in">
      <div className="customer-auth-content">
        <div className="step-indicator">
          <div className={`step-dot ${step === 'identification' ? 'active' : 'completed'}`}></div>
          <div className={`step-dot ${step === 'login' || step === 'register-info' ? 'active' : step === 'register-address' ? 'completed' : ''}`}></div>
          <div className={`step-dot ${step === 'register-address' ? 'active' : ''}`}></div>
        </div>
        {renderStep()}
        {step === 'identification' && (
          <button type="button" className="cancel-auth" onClick={onCancel}>Agora não</button>
        )}
      </div>
    </div>
  );
}
