import React from 'react';
import { ShoppingCart, MapPin } from 'lucide-react';
import type { RestaurantConfig } from '../types';

import './Header.css';

interface HeaderProps {
  config: RestaurantConfig;
  cartCount: number;
  onCartClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ config, cartCount, onCartClick }) => {
  return (
    <header className="header fade-in">
      <div className="header-content">
        <div className="brand">
          <img src={config.logo} alt={config.name} className="logo" />
          <div className="brand-info">
            <h1>{config.name}</h1>
            <p className="address">
              <MapPin size={12} /> {config.address}
            </p>
          </div>
        </div>
        
        <button className="cart-button" onClick={onCartClick}>
          <div className="cart-icon-wrapper">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>
        </button>
      </div>
    </header>
  );
};
