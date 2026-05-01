import React from 'react';
import { ShoppingCart, MapPin, Clock } from 'lucide-react';
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

      <div className="store-info-section">
        <div className="store-logo-floating">
          <img src={config.logo} alt={config.name} />
        </div>

        <div className="store-text-info">
          <h1>{config.name}</h1>
          <p className="store-address">
            <MapPin size={14} style={{ marginRight: '4px' }} />
            {config.address}
          </p>

          <div className="store-meta-badges">
            <span className={`meta-badge ${isOpen ? 'status-open' : 'status-closed'}`}>
              {isOpen ? 'Aberto agora' : 'Fechado agora'}
            </span>
            <span className="meta-badge status-time">
              <Clock size={14} style={{ marginRight: '4px' }} />
              30-45 min
            </span>
          </div>

        </div>
      </div>
    </header>
  );
};
