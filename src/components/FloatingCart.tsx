import React, { useEffect, useRef } from 'react';
import { ShoppingBag } from 'lucide-react';
import './FloatingCart.css';
import type { CartItem } from '../types';

interface FloatingCartProps {
  cart: CartItem[];
  onOpen: () => void;
  visible: boolean;
}

export const FloatingCart: React.FC<FloatingCartProps> = ({ cart, onOpen, visible }) => {
  const prevCountRef = useRef(0);
  const btnRef = useRef<HTMLButtonElement>(null);

  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const total = cart.reduce((acc, item) => {
    const optionsTotal = item.selectedOptions.reduce((s, o) => s + o.price, 0);
    return acc + (item.product.price + optionsTotal) * item.quantity;
  }, 0);

  // Pulse animation when item is added
  useEffect(() => {
    if (itemCount > prevCountRef.current && btnRef.current) {
      btnRef.current.classList.remove('pop');
      // Trigger reflow to restart animation
      void btnRef.current.offsetWidth;
      btnRef.current.classList.add('pop');
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  if (!visible || itemCount === 0) return null;

  // Show only the first product name, or "X itens" if multiple
  const previewLabel =
    cart.length === 1
      ? cart[0].product.name.length > 22
        ? cart[0].product.name.slice(0, 22) + '…'
        : cart[0].product.name
      : `${itemCount} itens no carrinho`;

  return (
    <button
      id="floating-cart-btn"
      ref={btnRef}
      className="floating-cart"
      onClick={onOpen}
      aria-label="Abrir carrinho"
    >
      <div className="fc-left">
        <div className="fc-icon-wrapper">
          <ShoppingBag size={20} />
          <span className="fc-badge">{itemCount}</span>
        </div>
        <span className="fc-label">{previewLabel}</span>
      </div>
      <span className="fc-total">R$ {total.toFixed(2)}</span>
    </button>
  );
};
