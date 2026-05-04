import React from 'react';
import { Home, Tag, ShoppingBag, User } from 'lucide-react';
import './BottomNav.css';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  cartCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, cartCount }) => {
  return (
    <nav className="bottom-nav">
      <button 
        className={`bottom-nav-btn ${activeTab === 'inicio' ? 'active' : ''}`}
        onClick={() => onTabChange('inicio')}
      >
        <Home size={22} />
        <span>Início</span>
      </button>
      
      <button 
        className={`bottom-nav-btn ${activeTab === 'promocoes' ? 'active' : ''}`}
        onClick={() => onTabChange('promocoes')}
      >
        <Tag size={22} />
        <span>Promoções</span>
      </button>
      
      <button 
        className={`bottom-nav-btn ${activeTab === 'pedidos' ? 'active' : ''}`}
        onClick={() => onTabChange('pedidos')}
      >
        <div className="icon-wrapper">
          <ShoppingBag size={22} />
          {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
        </div>
        <span>Pedidos</span>
      </button>
      
      <button 
        className={`bottom-nav-btn ${activeTab === 'perfil' ? 'active' : ''}`}
        onClick={() => onTabChange('perfil')}
      >
        <User size={22} />
        <span>Perfil</span>
      </button>
    </nav>
  );
};
