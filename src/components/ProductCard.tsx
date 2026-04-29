import React from 'react';
import { Plus } from 'lucide-react';
import type { Product } from '../types';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  disabled?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd, disabled }) => {
  const isAvailable = product.is_available !== false;
  const isCardDisabled = disabled || !isAvailable;

  return (
    <div 
      className={`product-card fade-in ${isCardDisabled ? 'disabled' : ''}`} 
      onClick={() => !isCardDisabled && onAdd(product)}
    >
      <div className="product-info">
        <h3>
          {product.name}
          {!isAvailable && <span className="sold-out-badge">ESGOTADO</span>}
        </h3>
        <p className="product-description">{product.description}</p>
        <span className="product-price">R$ {product.price.toFixed(2)}</span>
      </div>
      <div className="product-image-container">
        <img src={product.image} alt={product.name} className={`product-image ${!isAvailable ? 'greyscale' : ''}`} />
        <button 
          className="add-button" 
          disabled={isCardDisabled}
          onClick={(e) => {
            e.stopPropagation();
            if (!isCardDisabled) onAdd(product);
          }}
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
};
