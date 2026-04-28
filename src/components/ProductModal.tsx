import React, { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import type { Product, ProductOption } from '../types';
import './ProductModal.css';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (quantity: number, selectedOptions: ProductOption[], notes: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<ProductOption[]>([]);
  const [notes, setNotes] = useState('');

  const toggleOption = (option: ProductOption) => {
    if (selectedOptions.find((o) => o.name === option.name)) {
      setSelectedOptions(selectedOptions.filter((o) => o.name !== option.name));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const totalPrice = (product.price + selectedOptions.reduce((acc, o) => acc + o.price, 0)) * quantity;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-image-wrapper">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="modal-body">
          <div className="modal-header">
            <h2>{product.name}</h2>
            <p>{product.description}</p>
          </div>

          {product.options && product.options.length > 0 && (
            <div className="options-section">
              <h3>Adicionais</h3>
              <div className="options-list">
                {product.options.map((option) => (
                  <div 
                    key={option.name} 
                    className={`option-item ${selectedOptions.find(o => o.name === option.name) ? 'selected' : ''}`}
                    onClick={() => toggleOption(option)}
                  >
                    <span>{option.name}</span>
                    <span className="option-price">+ R$ {option.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="notes-section">
            <h3>Observações</h3>
            <textarea
              placeholder="Ex: Tirar cebola, ponto da carne..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer glass">
          <div className="quantity-selector">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
              <Minus size={20} />
            </button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}>
              <Plus size={20} />
            </button>
          </div>
          <button 
            className="add-to-cart-button"
            onClick={() => onAddToCart(quantity, selectedOptions, notes)}
          >
            <span>Adicionar</span>
            <span>R$ {totalPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
