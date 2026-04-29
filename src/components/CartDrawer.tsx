import React, { useState, useEffect } from 'react';
import { X, Trash2, MapPin, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { CartItem, RestaurantConfig } from '../types';
import { CustomerAuth } from './CustomerAuth';
import './CartDrawer.css';

interface CustomerProfile {
  full_name?: string;
  address?: string;
  phone?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemoveItem: (index: number) => void;
  config: RestaurantConfig;
  onCheckout: (customerInfo: { name: string; address: string; payment: string; type: string }) => void;
  customer?: CustomerProfile | null;
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
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState<{ type: 'fixed' | 'percentage', value: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [neighborhoods, setNeighborhoods] = useState<{ id: string; neighborhood: string; fee: number }[]>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<{ neighborhood: string; fee: number } | null>(null);

  async function loadNeighborhoods() {
    try {
      const { data } = await supabase
        .from('delivery_fees')
        .select('*')
        .eq('store_id', config.id)
        .order('neighborhood');
      
      setNeighborhoods(data || []);
      
      // Auto-select from localStorage if exists
      const savedNeighborhood = localStorage.getItem(`anoto_neighborhood_${config.id}`);
      if (savedNeighborhood && data) {
        const found = data.find(n => n.neighborhood === savedNeighborhood);
        if (found) setSelectedNeighborhood({ neighborhood: found.neighborhood, fee: found.fee });
      }
    } catch (error) {
      console.error('Error loading neighborhoods:', error);
    }
  }

  useEffect(() => {
    if (isOpen && config.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadNeighborhoods();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, config.id]);

  useEffect(() => {
    if (customer) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(customer.full_name || '');
      setAddress(customer.address || '');
    } else {
      // Try loading from localStorage for non-logged in users or quick fill
      const savedName = localStorage.getItem('anoto_customer_name');
      const savedAddress = localStorage.getItem('anoto_customer_address');
      if (savedName) setName(savedName || '');
      if (savedAddress) setAddress(savedAddress || '');
    }
  }, [customer]);

  const subtotal = cart.reduce((acc, item) => {
    const optionsPrice = item.selectedOptions.reduce((sum, o) => sum + o.price, 0);
    return acc + (item.product.price + optionsPrice) * item.quantity;
  }, 0);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setApplyingCoupon(true);
    setCouponError('');
    
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('store_id', config.id)
        .eq('code', couponCode.toUpperCase())
        .eq('active', true)
        .single();

      if (error || !data) {
        setCouponError('Cupom inválido ou expirado');
        setCouponDiscount(null);
        return;
      }

      if (subtotal < data.min_purchase) {
        setCouponError(`Pedido mínimo: R$ ${data.min_purchase.toFixed(2)}`);
        setCouponDiscount(null);
        return;
      }

      setCouponDiscount({ type: data.discount_type, value: data.discount_value });
      setCouponError('');
    } catch {
      setCouponError('Erro ao aplicar cupom');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const discountAmount = couponDiscount 
    ? (couponDiscount.type === 'fixed' ? couponDiscount.value : (subtotal * (couponDiscount.value / 100)))
    : 0;

  const currentDeliveryFee = type === 'delivery' 
    ? (selectedNeighborhood ? selectedNeighborhood.fee : config.deliveryFee)
    : 0;

  const total = subtotal - discountAmount + currentDeliveryFee;

  const handleContinue = () => {
    if (!customer) {
      setShowAuth(true);
    } else {
      setStep('checkout');
    }
  };

  const handleAuthSuccess = (profile: CustomerProfile) => {
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
                    
                    <div className="coupon-wrapper">
                      <div className="coupon-input">
                        <input 
                          type="text" 
                          placeholder="Cupom de desconto" 
                          value={couponCode} 
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          disabled={!!couponDiscount}
                        />
                        <button 
                          onClick={couponDiscount ? () => { setCouponDiscount(null); setCouponCode(''); } : handleApplyCoupon}
                          className={couponDiscount ? 'btn-remove' : 'btn-apply'}
                          disabled={applyingCoupon}
                        >
                          {applyingCoupon ? '...' : (couponDiscount ? 'X' : 'Aplicar')}
                        </button>
                      </div>
                      {couponError && <p className="coupon-error">{couponError}</p>}
                      {couponDiscount && <p className="coupon-success">Cupom aplicado!</p>}
                    </div>

                    {discountAmount > 0 && (
                      <div className="summary-line discount">
                        <span>Desconto</span>
                        <span>- R$ {discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="summary-line">
                      <span>Taxa de Entrega {selectedNeighborhood ? `(${selectedNeighborhood.neighborhood})` : ''}</span>
                      <span>{type === 'delivery' ? `R$ ${currentDeliveryFee.toFixed(2)}` : 'Grátis'}</span>
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
                  <input 
                    type="text" 
                    placeholder="Como te chamamos?" 
                    value={name} 
                    onChange={(e) => {
                      setName(e.target.value);
                      localStorage.setItem('anoto_customer_name', e.target.value);
                    }} 
                  />
                </div>

                <div className="form-group">
                  <label>Tipo de Pedido</label>
                  <div className="type-selector">
                    <button className={type === 'delivery' ? 'active' : ''} onClick={() => setType('delivery')}>Entrega</button>
                    <button className={type === 'pickup' ? 'active' : ''} onClick={() => setType('pickup')}>Retirada</button>
                  </div>
                </div>

                {type === 'delivery' && (
                  <>
                    <div className="form-group">
                      <label>Bairro para Entrega</label>
                      <select 

                        value={selectedNeighborhood?.neighborhood || ''} 
                        onChange={(e) => {
                          const found = neighborhoods.find(n => n.neighborhood === e.target.value);
                          if (found) {
                            setSelectedNeighborhood({ neighborhood: found.neighborhood, fee: found.fee });
                            localStorage.setItem(`anoto_neighborhood_${config.id}`, found.neighborhood);
                          } else {
                            setSelectedNeighborhood(null);
                          }
                        }}
                      >
                        <option value="">Selecione seu bairro...</option>
                        {neighborhoods.map(n => (
                          <option key={n.id} value={n.neighborhood}>
                            {n.neighborhood} - R$ {n.fee.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Endereço Completo</label>
                      <div className="input-with-icon">
                        <MapPin size={18} />
                        <input 
                          type="text" 
                          placeholder="Rua, número, complemento..." 
                          value={address} 
                          onChange={(e) => {
                            setAddress(e.target.value);
                            localStorage.setItem('anoto_customer_address', e.target.value);
                          }} 
                        />
                      </div>
                    </div>
                  </>
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
                  disabled={!name || (type === 'delivery' && (!address || !selectedNeighborhood))}
                  onClick={() => onCheckout({ 
                    name, 
                    address: type === 'pickup' ? 'Retirada no local' : `${address} - ${selectedNeighborhood?.neighborhood}`, 
                    payment, 
                    type 
                  })}
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
