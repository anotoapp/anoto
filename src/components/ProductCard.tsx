import React from 'react';
import { Plus } from 'lucide-react';
import type { Product } from '../types';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  return (
    <div className="product-card fade-in" onClick={() => onAdd(product)}>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <span className="product-price">R$ {product.price.toFixed(2)}</span>
      </div>
      <div className="product-image-container">
        <img src={product.image} alt={product.name} className="product-image" />
        <button className="add-button" onClick={(e) => {
          e.stopPropagation();
          onAdd(product);
        }}>
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
};
