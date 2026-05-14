import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Plus, Trash2, Sparkles, Tag, DollarSign, PackagePlus } from 'lucide-react';
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
  const [isFeatured, setIsFeatured] = useState(false);
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
      setDescription(productToEdit.description || '');
      setPrice(productToEdit.price);
      setCategoryId(productToEdit.category_id);
      setImage(productToEdit.image);
      setUpsellProductId(productToEdit.upsell_product_id || '');
      setIsFeatured(productToEdit.is_featured || false);
      loadOptionGroups(productToEdit.id);
    } else {
      setName('');
      setDescription('');
      setPrice(0);
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setImage('');
      setUpsellProductId('');
      setIsFeatured(false);
      setOptionGroups([]);
    }
  }, [productToEdit, categories]);

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const generateAIDescription = async () => {
    if (!name.trim()) {
      alert('Por favor, digite o nome do produto primeiro para a IA entender o que é.');
      return;
    }

    setIsGeneratingAI(true);
    
    // Fallback Semântico Local Super Inteligente (Não requer API Key)
    const generateLocalFallback = (prodName: string) => {
      const n = prodName.toLowerCase();
      if (n.includes('burger') || n.includes('burguer') || n.includes('x-') || n.includes('hamb')) {
        return `Hambúrguer artesanal suculento, montado com ingredientes frescos e selecionados. Perfeito para matar a sua fome com muito sabor e qualidade.`;
      }
      if (n.includes('pizza')) {
        return `Pizza artesanal assada no ponto perfeito, com massa leve, molho especial e ingredientes premium. Uma explosão de sabores em cada fatia.`;
      }
      if (n.includes('açai') || n.includes('açaí') || n.includes('acai')) {
        return `Açaí premium super cremoso e refrescante, preparado na hora com os melhores complementos. A escolha perfeita para qualquer hora do dia.`;
      }
      if (n.includes('porção') || n.includes('porcao') || n.includes('batata') || n.includes('fritas')) {
        return `Porção generosa e super crocante, frita na hora. O acompanhamento ideal para dividir com os amigos ou saborear sozinho.`;
      }
      if (n.includes('bebida') || n.includes('refri') || n.includes('suco') || n.includes('coca') || n.includes('água') || n.includes('agua')) {
        return `Bebida super gelada e refrescante, perfeita para acompanhar a sua refeição.`;
      }
      if (n.includes('doce') || n.includes('sobremesa') || n.includes('bolo') || n.includes('churros') || n.includes('brownie')) {
        return `Sobremesa irresistível, feita com ingredientes selecionados para fechar sua refeição com chave de ouro. Um verdadeiro pecado de sabor!`;
      }
      if (n.includes('combo')) {
        return `A combinação perfeita para matar a sua fome! Um combo montado especialmente para entregar o máximo de sabor e custo-benefício.`;
      }
      return `Um dos nossos pratos favoritos! Preparado com ingredientes selecionados e muito carinho para oferecer o melhor sabor e qualidade para você.`;
    };

    try {
      // Tenta a API Oficial do Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-description', {
        body: { productName: name }
      });

      if (error) throw error;
      if (data?.description) {
        setDescription(data.description);
      } else {
        throw new Error("API retornou sem descrição.");
      }
    } catch (error) {
      console.warn('Fallback ativado: IA externa falhou, usando gerador local semântico.', error);
      // Se falhar (Timeout, erro 500, sem API KEY), usa o fallback local instantaneamente
      const fallbackDesc = generateLocalFallback(name);
      setDescription(fallbackDesc);
    } finally {
      setIsGeneratingAI(false);
    }
  };

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
      const optimizedBlob = await optimizeImage(originalFile);
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
        upsell_product_id: upsellProductId || null,
        is_featured: isFeatured
      };
      let productId = productToEdit?.id;

      if (productToEdit) {
        await supabase.from('products').update(productData).eq('id', productToEdit.id);
      } else {
        const { data, error } = await supabase.from('products').insert(productData).select().single();
        if (error) throw error;
        productId = data.id;
      }

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
    <div className="drawer-overlay" onClick={onClose} style={{ zIndex: 1100, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="drawer-content open" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', margin: 'auto', borderRadius: '32px', height: 'auto', maxHeight: '92vh', overflowY: 'auto', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        <div className="drawer-header" style={{ position: 'sticky', top: 0, backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', zIndex: 10, padding: '28px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>{productToEdit ? 'Editar Produto' : 'Novo Produto'}</h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Preencha os detalhes do seu produto abaixo.</p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}><X size={22} /></button>
        </div>

        <form onSubmit={handleSubmit} className="drawer-body" style={{ padding: '32px' }}>
          
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#334155' }}>Foto do Produto</label>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '12px', backgroundColor: '#e2e8f0', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                {image ? <img src={image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={32} color="#94a3b8" style={{ margin: '24px' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#64748b' }}>Imagens bonitas vendem mais! Use fotos quadradas (1:1).</p>
                <label className="primary-action" style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem', display: 'inline-block' }}>
                  {uploading ? 'Otimizando e Enviando...' : 'Escolher Imagem'}
                  <input type="file" accept="image/*" onChange={uploadImage} disabled={uploading} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>Nome do Produto</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '16px', top: '14px', color: '#94a3b8' }}>
                <Tag size={20} />
              </div>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Ex: Hambúrguer Artesanal Duplo" style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', backgroundColor: '#f8fafc', color: '#0f172a' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontWeight: '600', color: '#334155', margin: 0 }}>
                Descrição Atraente
              </label>
              <button
                type="button"
                onClick={generateAIDescription}
                disabled={isGeneratingAI}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #c084fc 0%, #db2777 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  opacity: isGeneratingAI ? 0.7 : 1,
                  boxShadow: '0 4px 12px rgba(219, 39, 119, 0.3)'
                }}
              >
                <Sparkles size={14} className={isGeneratingAI ? 'spin-slow' : ''} />
                {isGeneratingAI ? 'Gerando Mágica...' : 'Gerar com IA'}
              </button>
            </div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Pão brioche selado na manteiga, blend especial de 160g, duplo queijo cheddar derretido..."
              rows={3}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                resize: 'vertical',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                lineHeight: '1.6',
                color: '#1e293b',
                boxSizing: 'border-box',
                backgroundColor: '#f8fafc'
              }}
            />
          </div>

          <div className="responsive-flex-row" style={{ marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>Preço Base</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '14px', color: '#94a3b8' }}>
                  <DollarSign size={20} />
                </div>
                <input type="number" step="0.01" value={price} onChange={e => setPrice(parseFloat(e.target.value))} required style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', backgroundColor: '#f8fafc', color: '#0f172a' }} />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>Categoria</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '1rem', appearance: 'none' }}>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ background: '#fffbeb', padding: '20px', borderRadius: '16px', border: '1px solid #fde68a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: '#92400e', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} /> Destacar na Vitrine
              </h4>
              <p style={{ margin: 0, color: '#b45309', fontSize: '0.85rem' }}>Exibe este produto no carrossel gigante do topo da loja.</p>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '56px', height: '32px' }}>
              <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{
                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: isFeatured ? '#f59e0b' : '#cbd5e1', transition: '.4s', borderRadius: '34px'
              }}>
                <span style={{
                  position: 'absolute', content: '""', height: '24px', width: '24px',
                  left: isFeatured ? '28px' : '4px', bottom: '4px', backgroundColor: 'white',
                  transition: '.4s', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </span>
            </label>
          </div>

          <div style={{ background: '#f0fdfa', padding: '20px', borderRadius: '16px', border: '1px solid #99f6e4', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ background: '#14b8a6', padding: '8px', borderRadius: '10px', color: 'white' }}>
                <PackagePlus size={20} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 2px 0', color: '#0f766e', fontSize: '1.05rem' }}>Upsell Automático</h4>
                <p style={{ margin: 0, color: '#115e59', fontSize: '0.85rem' }}>O que oferecer de acompanhamento perfeito?</p>
              </div>
            </div>
            <select value={upsellProductId} onChange={e => setUpsellProductId(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #5eead4', backgroundColor: 'white', color: '#0f766e', fontWeight: '600', fontSize: '0.95rem' }}>
              <option value="">Não sugerir nada</option>
              {products.filter(p => p.id !== productToEdit?.id).map(p => (
                <option key={p.id} value={p.id}>Oferecer: {p.name} (+R$ {p.price.toFixed(2)})</option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontWeight: '800', color: '#0f172a', fontSize: '1.3rem' }}>Opcionais & Adicionais</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Permita que o cliente customize o pedido.</p>
              </div>
              <button type="button" onClick={addGroup} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', background: '#3b82f6', border: 'none', fontWeight: '600', cursor: 'pointer', padding: '10px 16px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
                <Plus size={18} /> Novo Grupo
              </button>
            </div>

            {optionGroups.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #cbd5e1' }}>
                <p style={{ color: '#64748b', margin: 0, fontWeight: '500' }}>Nenhum opcional cadastrado. Clique no botão acima para adicionar acompanhamentos, tamanhos ou remoção de ingredientes.</p>
              </div>
            )}

            {optionGroups.map((group, gIndex) => (
              <div key={gIndex} style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '20px', marginBottom: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                  <input placeholder="Nome do Grupo (Ex: Escolha a Borda, Adicionais...)" value={group.name} onChange={e => updateGroup(gIndex, { name: e.target.value })} style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: '700', fontSize: '1.05rem', backgroundColor: '#f8fafc' }} />
                  <button type="button" onClick={() => removeGroup(gIndex)} style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', width: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={20} /></button>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', color: '#334155' }}>
                    <input type="checkbox" checked={group.required} onChange={e => updateGroup(gIndex, { required: e.target.checked, min_options: e.target.checked ? 1 : 0 })} style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }} /> 
                    Seleção Obrigatória
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600', color: '#334155' }}>
                    Máx. de Escolhas permitidas: 
                    <input type="number" value={group.max_options} onChange={e => updateGroup(gIndex, { max_options: parseInt(e.target.value) })} style={{ width: '60px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }} />
                  </div>
                </div>

                <div>
                  <h5 style={{ margin: '0 0 12px 0', color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Itens deste grupo</h5>
                  {group.options?.map((opt, oIndex) => (
                    <div key={oIndex} className="responsive-options-item">
                      <input placeholder="Nome do Item (Ex: Bacon extra)" value={opt.name} onChange={e => updateOption(gIndex, oIndex, { name: e.target.value })} style={{ flex: 2, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }} />
                      <div style={{ flex: 1, position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }}>R$</div>
                        <input type="number" placeholder="0.00" value={opt.price} onChange={e => updateOption(gIndex, oIndex, { price: parseFloat(e.target.value) })} style={{ width: '100%', padding: '12px 12px 12px 36px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }} />
                      </div>
                      <button type="button" onClick={() => removeOption(gIndex, oIndex)} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px', alignSelf: 'center' }}><X size={20} /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addOption(gIndex)} style={{ marginTop: '8px', fontSize: '0.95rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}><Plus size={16} /> Adicionar Opção</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '40px', display: 'flex', gap: '16px', position: 'sticky', bottom: '-32px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', padding: '24px 0', borderTop: '1px solid #f1f5f9' }}>
            <button type="button" onClick={onClose} className="secondary-action" style={{ flex: 1, padding: '16px', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', border: '1px solid #cbd5e1', color: '#475569', fontSize: '1.05rem', backgroundColor: 'white' }}>Cancelar</button>
            <button 
              type="submit" 
              disabled={loading || uploading} 
              className="primary-action" 
              style={{ flex: 2, padding: '16px', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', background: 'var(--brand-red)', color: 'white', border: 'none', boxShadow: '0 10px 25px rgba(200, 29, 37, 0.3)', fontSize: '1.05rem' }}
            >
              {loading ? 'Salvando...' : 'Salvar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
