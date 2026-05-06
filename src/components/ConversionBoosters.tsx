import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Users } from 'lucide-react';

interface ConversionBoostersProps {
  primaryColor?: string;
  storeName?: string;
}

export const ConversionBoosters: React.FC<ConversionBoostersProps> = ({ 
  primaryColor = '#dc2626',
  storeName = 'ANOTÔ'
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const couponCode = 'BEMVINDO10';

  useEffect(() => {
    // Popup logic: appears after 3 seconds, once per session
    const hasSeenPopup = sessionStorage.getItem('anoto_welcome_popup');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setShowPopup(true);
        sessionStorage.setItem('anoto_welcome_popup', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Social Proof logic: appears after 8 seconds
    const messages = [
      '🔥 12 pessoas estão navegando agora',
      '🛒 Alguém acabou de fazer um pedido!',
      '✨ O item "Classic Smash" é o favorito do momento',
      '🚀 Entrega rápida confirmada para sua região'
    ];
    
    const showRandomToast = () => {
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setToastMessage(randomMsg);
      setShowToast(true);
      
      // Hide after 5 seconds
      setTimeout(() => setShowToast(false), 5000);
    };

    const timer = setTimeout(showRandomToast, 8000);
    const interval = setInterval(showRandomToast, 35000); // Repeat every 35s

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowPopup(false);
    }, 1500);
  };

  return (
    <>
      {/* Welcome Popup */}
      {showPopup && (
        <div className="booster-popup-overlay">
          <div className="booster-popup-content">
            <button className="booster-close-btn" onClick={() => setShowPopup(false)}>
              <X size={20} />
            </button>
            
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎁</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px', color: '#0f172a' }}>
              Seja bem-vindo(a) ao {storeName}!
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.5' }}>
              Ganhe 10% de desconto no seu primeiro pedido hoje. Use o cupom abaixo:
            </p>

            <div className="coupon-code-box" onClick={handleCopy}>
              <span style={{ fontWeight: '800', fontSize: '1.25rem', letterSpacing: '2px', color: primaryColor }}>
                {couponCode}
              </span>
              {copied ? <Check size={20} color="#16a34a" /> : <Copy size={20} color="#64748b" />}
            </div>

            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              {copied ? 'Código copiado! Aplicando...' : 'Toque no código para copiar'}
            </p>

            <button 
              onClick={handleCopy}
              style={{
                width: '100%',
                padding: '16px',
                background: primaryColor,
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontWeight: '700',
                fontSize: '1rem',
                marginTop: '12px',
                cursor: 'pointer',
                boxShadow: `0 10px 15px -3px ${primaryColor}4D`
              }}
            >
              {copied ? 'Copiado!' : 'Quero meu desconto'}
            </button>
          </div>
        </div>
      )}

      {/* Social Proof Toast */}
      {showToast && (
        <div className="social-proof-toast">
          <div style={{ 
            background: `${primaryColor}1A`, 
            color: primaryColor, 
            padding: '8px', 
            borderRadius: '50%',
            display: 'flex'
          }}>
            <Users size={16} />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>
            {toastMessage}
          </span>
        </div>
      )}
    </>
  );
};
