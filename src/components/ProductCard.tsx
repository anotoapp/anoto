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
  return (
    <div 
      className={`product-card fade-in ${disabled ? 'disabled' : ''}`} 
      onClick={() => !disabled && onAdd(product)}
    >
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <span className="product-price">R$ {product.price.toFixed(2)}</span>
      </div>
      <div className="product-image-container">
        <img src={product.image} alt={product.name} className="product-image" />
        <button 
          className="add-button" 
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onAdd(product);
          }}
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
};
