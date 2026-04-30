import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { optimizeImage } from '../../lib/image-optimizer';
import type { Product, Category, ProductOptionGroup, ProductOption } from '../../types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productToEdit?: Product | null;
  categories: Category[];
  products?: Product[];
  storeId: string;
}

export function ProductFormModal({ isOpen, onClose, onSuccess, productToEdit, categories, products = [], storeId }: ProductFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState('');
  const [upsellProductId, setUpsellProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Modifiers State
  const [optionGroups, setOptionGroups] = useState<Partial<ProductOptionGroup>[]>([]);

  const loadOptionGroups = async (productId: string) => {
    const { data } = await supabase
      .from('product_option_groups')
      .select('*, options:product_options(*)')
      .eq('product_id', productId);
    
    if (data) setOptionGroups(data);
  };

  useEffect(() => {
    if (productToEdit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(productToEdit.name);
      setDescription(productToEdit.description);
      setPrice(productToEdit.price);
      setCategoryId(productToEdit.category_id);
      setImage(productToEdit.image);
      setUpsellProductId(productToEdit.upsell_product_id || '');
      loadOptionGroups(productToEdit.id);
    } else {
      setName('');
      setDescription('');
      setPrice(0);
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setImage('');
      setUpsellProductId('');
      setOptionGroups([]);
    }
  }, [productToEdit, categories]);

  if (!isOpen) return null;

  const addGroup = () => {
    setOptionGroups([...optionGroups, { 
      name: '', 
      min_options: 0, 
      max_options: 1, 
      required: false, 
      options: [] 
    }]);
  };

  const removeGroup = (index: number) => {
    setOptionGroups(optionGroups.filter((_, i) => i !== index));
  };

  const updateGroup = (index: number, data: Partial<ProductOptionGroup>) => {
    const newGroups = [...optionGroups];
    newGroups[index] = { ...newGroups[index], ...data };
    setOptionGroups(newGroups);
  };

  const addOption = (groupIndex: number) => {
    const newGroups = [...optionGroups];
    const group = newGroups[groupIndex];
    if (!group.options) group.options = [];
    group.options.push({ 
      id: Math.random().toString(),
      group_id: group.id || '',
      name: '', 
      price: 0, 
      available: true 
    });
    setOptionGroups(newGroups);
  };

  const updateOption = (groupIndex: number, optionIndex: number, data: Partial<ProductOption>) => {
    const newGroups = [...optionGroups];
    const group = newGroups[groupIndex];
    if (group.options) {
      group.options[optionIndex] = { ...group.options[optionIndex], ...data };
    }
    setOptionGroups(newGroups);
  };

  const removeOption = (groupIndex: number, optionIndex: number) => {
    const newGroups = [...optionGroups];
    const group = newGroups[groupIndex];
    if (group.options) {
      group.options = group.options.filter((_, i) => i !== optionIndex);
    }
    setOptionGroups(newGroups);
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;

      const originalFile = e.target.files[0];
      
      // Otimizar a imagem antes de enviar
      const optimizedBlob = await optimizeImage(originalFile);
      
      // Criar um nome de arquivo único com extensão .webp
      const fileName = `${Math.random()}.webp`;
      const filePath = `${storeId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('store-assets')
        .upload(filePath, optimizedBlob, {
          contentType: 'image/webp',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('store-assets').getPublicUrl(filePath);
      setImage(data.publicUrl);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro no upload.';
      alert(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = { 
        name, 
        description, 
        price, 
        category_id: categoryId, 
        image,
        upsell_product_id: upsellProductId || null
      };
      let productId = productToEdit?.id;

      if (productToEdit) {
        await supabase.from('products').update(productData).eq('id', productToEdit.id);
      } else {
        const { data, error } = await supabase.from('products').insert(productData).select().single();
        if (error) throw error;
        productId = data.id;
      }

      // Handle Modifiers (Clear and Re-insert for simplicity in this version)
      if (productId) {
        await supabase.from('product_option_groups').delete().eq('product_id', productId);
        
        for (const group of optionGroups) {
          const { data: gData, error: gError } = await supabase
            .from('product_option_groups')
            .insert({
              product_id: productId,
              name: group.name,
              min_options: group.min_options,
              max_options: group.max_options,
              required: group.required
            })
            .select()
            .single();

          if (gError) throw gError;

          if (group.options && group.options.length > 0) {
            const optionsToInsert = group.options.map(opt => ({
              group_id: gData.id,
              name: opt.name,
              price: opt.price,
              available: opt.available
            }));
            await supabase.from('product_options').insert(optionsToInsert);
          }
        }
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao salvar.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="drawer-overlay" onClick={onClose} style={{ zIndex: 1100, background: 'rgba(45, 10, 10, 0.4)', backdropFilter: 'blur(4px)' }}>
      <div className="drawer-content open" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px', margin: 'auto', borderRadius: '32px', height: 'auto', maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(200, 29, 37, 0.1)', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
        <div className="drawer-header" style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10, padding: '32px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--lp-text-dark)', margin: 0 }}>{productToEdit ? 'Editar Produto' : 'Novo Produto'}</h2>
          <button onClick={onClose} style={{ background: '#f5f5f5', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="drawer-body" style={{ padding: '32px' }}>
          
          {/* Basic Info */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Imagem</label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '8px', backgroundColor: '#f0f0f0', overflow: 'hidden' }}>
                {image ? <img src={image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={32} color="#ccc" style={{ margin: '24px' }} />}
              </div>
              <label className="primary-action" style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: '6px' }}>
                {uploading ? 'Enviando...' : 'Escolher Imagem'}
                <input type="file" accept="image/*" onChange={uploadImage} disabled={uploading} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Nome</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Preço Base</label>
              <input type="number" step="0.01" value={price} onChange={e => setPrice(parseFloat(e.target.value))} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Categoria</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'white' }}>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px', background: '#eef2ff', padding: '16px', borderRadius: '12px', border: '1px solid #c7d2fe' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#3730a3' }}>🎁 Upsell ("Compre Junto")</label>
            <p style={{ fontSize: '0.85rem', color: '#4f46e5', marginBottom: '12px' }}>
              Sugira um produto complementar para o cliente levar junto antes de fechar o pedido.
            </p>
            <select value={upsellProductId} onChange={e => setUpsellProductId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #a5b4fc', backgroundColor: 'white', color: '#312e81', fontWeight: '500' }}>
              <option value="">Nenhuma sugestão</option>
              {products.filter(p => p.id !== productToEdit?.id).map(p => (
                <option key={p.id} value={p.id}>Sugira: {p.name} (+R$ {p.price.toFixed(2)})</option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: '32px', borderTop: '2px solid #f0f0f0', paddingTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontWeight: '800', color: 'var(--lp-text-dark)' }}>Grupos de Opcionais</h3>
              <button type="button" onClick={addGroup} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--brand-red)', background: 'none', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
                <Plus size={18} /> Adicionar Grupo
              </button>
            </div>

            {optionGroups.map((group, gIndex) => (
              <div key={gIndex} style={{ backgroundColor: '#FFFBF2', padding: '20px', borderRadius: '16px', marginBottom: '16px', border: '1px solid rgba(200, 29, 37, 0.1)' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '15px' }}>
                  <input placeholder="Ex: Escolha o Molho" value={group.name} onChange={e => updateGroup(gIndex, { name: e.target.value })} style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #ddd', fontWeight: '600' }} />
                  <button type="button" onClick={() => removeGroup(gIndex)} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={20} /></button>
                </div>
                
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: '500' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={group.required} onChange={e => updateGroup(gIndex, { required: e.target.checked, min_options: e.target.checked ? 1 : 0 })} /> 
                    Obrigatório
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Máx. Opções: 
                    <input type="number" value={group.max_options} onChange={e => updateGroup(gIndex, { max_options: parseInt(e.target.value) })} style={{ width: '50px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #ddd' }} />
                  </div>
                </div>

                <div style={{ paddingLeft: '20px', borderLeft: '3px solid rgba(200, 29, 37, 0.1)' }}>
                  {group.options?.map((opt, oIndex) => (
                    <div key={oIndex} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <input placeholder="Nome (Ex: Maionese)" value={opt.name} onChange={e => updateOption(gIndex, oIndex, { name: e.target.value })} style={{ flex: 2, padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd' }} />
                      <input type="number" placeholder="Preço" value={opt.price} onChange={e => updateOption(gIndex, oIndex, { price: parseFloat(e.target.value) })} style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd' }} />
                      <button type="button" onClick={() => removeOption(gIndex, oIndex)} style={{ color: '#999', background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addOption(gIndex)} style={{ fontSize: '0.9rem', color: 'var(--brand-red)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', fontWeight: '700' }}>+ Adicionar Item</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '32px', display: 'flex', gap: '15px', position: 'sticky', bottom: '-24px', background: 'white', padding: '20px 0' }}>
            <button type="button" onClick={onClose} className="secondary-action" style={{ flex: 1, padding: '14px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', border: '1px solid #ddd' }}>Cancelar</button>
            <button 
              type="submit" 
              disabled={loading || uploading} 
              className="primary-action" 
              style={{ flex: 1, padding: '14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', background: 'var(--brand-red)', color: 'white', border: 'none', boxShadow: '0 8px 20px rgba(200, 29, 37, 0.2)' }}
            >
              {loading ? 'Salvando...' : 'Salvar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
