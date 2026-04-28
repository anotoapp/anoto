import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, Check } from 'lucide-react';
import type { Product, ProductOption, ProductOptionGroup } from '../types';
import { supabase } from '../lib/supabase';
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
  const [optionGroups, setOptionGroups] = useState<ProductOptionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function loadOptions() {
      setLoading(true);
      const { data: groups } = await supabase
        .from('product_option_groups')
        .select(`
          *,
          options:product_options(*)
        `)
        .eq('product_id', product.id)
        .order('created_at', { ascending: true });

      if (groups) {
        setOptionGroups(groups);
      }
      setLoading(false);
    }

    loadOptions();
  }, [product.id]);

  const toggleOption = (group: ProductOptionGroup, option: ProductOption) => {
    const isSelected = selectedOptions.some(o => o.id === option.id);
    const groupSelectedCount = selectedOptions.filter(o => o.group_id === group.id).length;

    if (isSelected) {
      // Remover se já estiver selecionado
      setSelectedOptions(selectedOptions.filter(o => o.id !== option.id));
    } else {
      // Se for seleção única (max_options = 1)
      if (group.max_options === 1) {
        const otherOptionsInGroup = selectedOptions.filter(o => o.group_id !== group.id);
        setSelectedOptions([...otherOptionsInGroup, option]);
      } else {
        // Se for múltipla, verificar o limite máximo
        if (groupSelectedCount < group.max_options) {
          setSelectedOptions([...selectedOptions, option]);
        }
      }
    }
  };

  const isGroupValid = (group: ProductOptionGroup) => {
    const count = selectedOptions.filter(o => o.group_id === group.id).length;
    return count >= group.min_options;
  };

  const allGroupsValid = optionGroups.every(isGroupValid);

  const totalPrice = (product.price + selectedOptions.reduce((acc, o) => acc + Number(o.price), 0)) * quantity;

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

          {loading ? (
            <div className="loading-options">Carregando opcionais...</div>
          ) : (
            optionGroups.map((group) => (
              <div key={group.id} className="option-group">
                <div className="group-header">
                  <div>
                    <h3>{group.name}</h3>
                    <p className="group-info">
                      {group.min_options > 0 
                        ? `Obrigatório • Escolha pelo menos ${group.min_options}` 
                        : `Opcional • Escolha até ${group.max_options}`}
                    </p>
                  </div>
                  {isGroupValid(group) && <Check size={18} className="text-success" />}
                </div>

                <div className="options-list">
                  {group.options?.map((option) => {
                    const isSelected = selectedOptions.some(o => o.id === option.id);
                    return (
                      <div 
                        key={option.id} 
                        className={`option-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleOption(group, option)}
                      >
                        <div className="option-info">
                          <span className="option-name">{option.name}</span>
                          {option.price > 0 && (
                            <span className="option-price">+ R$ {Number(option.price).toFixed(2)}</span>
                          )}
                        </div>
                        <div className={`selector ${group.max_options === 1 ? 'radio' : 'checkbox'}`}>
                          {isSelected && <div className="selector-inner" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
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
            className={`add-to-cart-button ${!allGroupsValid ? 'disabled' : ''}`}
            onClick={() => allGroupsValid && onAddToCart(quantity, selectedOptions, notes)}
            disabled={!allGroupsValid}
          >
            <span>{allGroupsValid ? 'Adicionar' : 'Selecione os obrigatórios'}</span>
            <span>R$ {totalPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
