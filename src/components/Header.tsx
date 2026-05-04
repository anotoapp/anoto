import React from 'react';
import { ShoppingCart, MapPin } from 'lucide-react';
import type { RestaurantConfig } from '../types';

import './Header.css';

interface HeaderProps {
  config: RestaurantConfig;
  cartCount: number;
  onCartClick: () => void;
  isOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ config, cartCount, onCartClick, isOpen }) => {
  return (
    <header className="store-header">
      <div className="store-banner-wrapper">
        <img src={config.banner} alt="Banner" className="store-banner-img" />
        <div className="banner-overlay"></div>
        
        <button className="floating-cart-button" onClick={onCartClick}>
          <ShoppingCart size={24} />
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
      </div>

      <div className="store-info-container">
        <div className="store-info-card">
          <div className="store-logo-floating">
            <img src={config.logo} alt={config.name} />
          </div>

          <div className="store-text-info">
            <h1>{config.name}</h1>
            
            <div className="store-sub-info">
              <span className="info-item">
                <MapPin size={14} className="info-icon" />
                São Pedro - SP
              </span>
              <span className="info-dot">•</span>
              <button className="info-link">Mais informações</button>
            </div>

            <div className="store-status-row">
              <span className={`status-text ${isOpen ? 'open' : 'closed'}`}>
                {isOpen ? 'Aberto' : 'Fechado'}
              </span>
              <span className="status-dot">•</span>
              <span className="status-hours">
                {isOpen ? 'Fecha às 23h00' : 'Abrimos às 18h00'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
