import React, { useState, useEffect } from 'react';
import { X, Trash2, MapPin, ShoppingBag } from 'lucide-react';
import type { CartItem, RestaurantConfig } from '../types';
import { CustomerAuth } from './CustomerAuth';
import './CartDrawer.css';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemoveItem: (index: number) => void;
  config: RestaurantConfig;
  onCheckout: (customerInfo: { name: string; address: string; payment: string; type: string }) => void;
  customer?: any;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onRemoveItem,
  config,
  onCheckout,
  customer
}) => {
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [showAuth, setShowAuth] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState('Cartão de Crédito/Débito (Máquina)');
  const [type, setType] = useState('delivery');

  useEffect(() => {
    if (customer) {
      setName(customer.full_name || '');
      setAddress(customer.address || '');
    }
  }, [customer]);

  const subtotal = cart.reduce((acc, item) => {
    const optionsPrice = item.selectedOptions.reduce((sum, o) => sum + o.price, 0);
    return acc + (item.product.price + optionsPrice) * item.quantity;
  }, 0);

  const total = subtotal + (type === 'delivery' ? config.deliveryFee : 0);

  const handleContinue = () => {
    if (!customer) {
      setShowAuth(true);
    } else {
      setStep('checkout');
    }
  };

  const handleAuthSuccess = (profile: any) => {
    setShowAuth(false);
    setName(profile.full_name || '');
    setAddress(profile.address || '');
    setStep('checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose}>
        <div className={`drawer-content ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <h2>{step === 'cart' ? 'Seu Pedido' : 'Finalizar Pedido'}</h2>
            <button onClick={onClose}><X size={24} /></button>
          </div>

          <div className="drawer-body">
            {step === 'cart' ? (
              cart.length === 0 ? (
                <div className="empty-cart">
                  <ShoppingBag size={64} />
                  <p>Seu carrinho está vazio</p>
                  <button className="back-to-menu" onClick={onClose}>Ver Cardápio</button>
                </div>
              ) : (
                <div className="cart-items">
                  {cart.map((item, index) => (
                    <div key={index} className="cart-item">
                      <div className="cart-item-info">
                        <span className="cart-item-qty">{item.quantity}x</span>
                        <div className="cart-item-details">
                          <h4>{item.product.name}</h4>
                          {item.selectedOptions.length > 0 && (
                            <p className="item-options">{item.selectedOptions.map(o => o.name).join(', ')}</p>
                          )}
                          {item.notes && <p className="item-notes">Obs: {item.notes}</p>}
                        </div>
                      </div>
                      <div className="cart-item-actions">
                        <span className="cart-item-price">R$ {((item.product.price + item.selectedOptions.reduce((a, b) => a + b.price, 0)) * item.quantity).toFixed(2)}</span>
                        <button onClick={() => onRemoveItem(index)} className="remove-item"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="cart-summary">
                    <div className="summary-line">
                      <span>Subtotal</span>
                      <span>R$ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="summary-line">
                      <span>Taxa de Entrega</span>
                      <span>{type === 'delivery' ? `R$ ${config.deliveryFee.toFixed(2)}` : 'Grátis'}</span>
                    </div>
                    <div className="summary-line total">
                      <span>Total</span>
                      <span>R$ {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="checkout-form">
                <div className="form-group">
                  <label>Seu Nome</label>
                  <input type="text" placeholder="Como te chamamos?" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="form-group">
                  <label>Tipo de Pedido</label>
                  <div className="type-selector">
                    <button className={type === 'delivery' ? 'active' : ''} onClick={() => setType('delivery')}>Entrega</button>
                    <button className={type === 'pickup' ? 'active' : ''} onClick={() => setType('pickup')}>Retirada</button>
                  </div>
                </div>

                {type === 'delivery' && (
                  <div className="form-group">
                    <label>Endereço de Entrega</label>
                    <div className="input-with-icon">
                      <MapPin size={18} />
                      <input type="text" placeholder="Rua, número, bairro..." value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Forma de Pagamento</label>
                  <select value={payment} onChange={(e) => setPayment(e.target.value)}>
                    <option>Pix</option>
                    <option>Cartão de Crédito/Débito (Máquina)</option>
                    <option>Dinheiro (Levar troco?)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="drawer-footer">
            {step === 'cart' ? (
              <button 
                className="primary-action" 
                disabled={cart.length === 0}
                onClick={handleContinue}
              >
                Continuar
              </button>
            ) : (
              <div className="checkout-actions">
                <button className="secondary-action" onClick={() => setStep('cart')}>Voltar</button>
                <button 
                  className="primary-action" 
                  disabled={!name || (type === 'delivery' && !address)}
                  onClick={() => onCheckout({ name, address: type === 'pickup' ? 'Retirada no local' : address, payment, type })}
                >
                  Enviar Pedido
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAuth && (
        <CustomerAuth 
          onSuccess={handleAuthSuccess}
          onCancel={() => setShowAuth(false)}
        />
      )}
    </>
  );
};
