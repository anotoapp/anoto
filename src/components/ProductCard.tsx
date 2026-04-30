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

  // Placeholder image if product.image is missing or invalid
  const imageUrl = product.image && product.image.startsWith('http') 
    ? product.image 
    : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop';

  return (
    <div 
      className={`product-card fade-in ${isCardDisabled ? 'disabled' : ''}`} 
      onClick={() => !isCardDisabled && onAdd(product)}
    >
      <div className="product-info">
        <div className="product-header">
          <h3>{product.name}</h3>
          {!isAvailable && <span className="sold-out-badge">Esgotado</span>}
        </div>
        <p className="product-description">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">R$ {product.price.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="product-image-wrapper">
        <div className={`product-image-container ${!isAvailable ? 'greyscale' : ''}`}>
          <img 
            src={imageUrl} 
            alt={product.name} 
            className="product-image"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop';
            }}
          />
        </div>
        <button 
          className="add-button" 
          disabled={isCardDisabled}
          onClick={(e) => {
            e.stopPropagation();
            if (!isCardDisabled) onAdd(product);
          }}
          aria-label="Adicionar ao carrinho"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
};
