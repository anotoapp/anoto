import React from 'react';
import type { Product } from '../types';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  disabled?: boolean;
  layout?: 'list' | 'grid';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd, disabled, layout = 'list' }) => {
  const isAvailable = product.is_available !== false;
  const isCardDisabled = disabled || !isAvailable;

  const imageUrl = product.image && product.image.startsWith('http') 
    ? product.image 
    : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop';

  return (
    <div 
      className={`product-card fade-in ${layout} ${isCardDisabled ? 'disabled' : ''}`} 
      onClick={() => !isCardDisabled && onAdd(product)}
    >
      <div className="product-image-wrapper">
        <div className={`product-image-container ${!isAvailable ? 'greyscale' : ''}`}>
          <img 
            src={imageUrl} 
            alt={product.name} 
            className="product-image"
          />
        </div>
      </div>

      <div className="product-info">
        <div className="product-header">
          <h3>{product.name}</h3>
          {!isAvailable && <span className="sold-out-badge">Esgotado</span>}
        </div>
        {layout === 'list' && <p className="product-description">{product.description}</p>}
        <div className="product-footer">
          <span className="product-price">R$ {product.price.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
