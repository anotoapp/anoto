import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import type { Product, Category } from '../../types';
import { ProductFormModal } from '../../components/admin/ProductFormModal';

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [storeId, setStoreId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', session.user.id)
        .single();

      if (storeError) throw storeError;
      setStoreId(storeData.id);

      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('store_id', storeData.id);

      if (catError) throw catError;
      setCategories(catData || []);

      if (catData && catData.length > 0) {
        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .in('category_id', catData.map(c => c.id))
          .order('name');
          
        if (prodError) throw prodError;
        setProducts(prodData || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch {
      alert('Erro ao excluir produto.');
    }
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      // Optimistic update
      setProducts(current => current.map(p => p.id === id ? { ...p, is_available: !currentStatus } : p));
      
      const { error } = await supabase
        .from('products')
        .update({ is_available: !currentStatus })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling availability:', error);
      // Rollback
      setProducts(current => current.map(p => p.id === id ? { ...p, is_available: currentStatus } : p));
    }
  };

  const openNewModal = () => {
    if (categories.length === 0) {
      alert('Você precisa criar uma categoria primeiro.');
      // Opcional: implementar modal de categorias depois
      return;
    }
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  if (loading) return <div className="p-4">Carregando cardápio...</div>;

  return (
    <div className="orders-dashboard fade-in">
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Seu Cardápio</h1>
          <p>Gerencie seus produtos e categorias</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setIsCategoryModalOpen(true)} 
            className="secondary-action" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}
          >
            Categorias
          </button>
          <button 
            onClick={openNewModal} 
            className="primary-action" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', border: 'none', borderRadius: '12px', cursor: 'pointer', color: 'white', background: 'var(--brand-red)', fontWeight: '600' }}
          >
            <Plus size={18} /> Novo Produto
          </button>
        </div>
      </header>

      {/* Modal de Categorias Simplificado */}
      {isCategoryModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h2 style={{ marginBottom: '8px', color: 'var(--lp-text-dark)' }}>Categorias</h2>
            <p style={{ marginBottom: '24px', color: '#666' }}>Crie grupos para seus produtos (ex: Bebidas, Pizzas)</p>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              <input 
                type="text" 
                placeholder="Nome da categoria" 
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #ddd' }}
              />
              <button 
                onClick={async () => {
                  if (!newCategoryName) return;
                  const { error } = await supabase.from('categories').insert({ name: newCategoryName, store_id: storeId });
                  if (!error) {
                    setNewCategoryName('');
                    loadData();
                  }
                }}
                style={{ padding: '0 20px', background: 'var(--brand-red)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}
              >
                +
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
              {categories.map(cat => (
                <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f9f9f9', borderRadius: '12px' }}>
                  <span>{cat.name}</span>
                  <button 
                    onClick={async () => {
                      if (window.confirm('Excluir esta categoria? Produtos nela podem ficar órfãos.')) {
                        await supabase.from('categories').delete().eq('id', cat.id);
                        loadData();
                      }
                    }}
                    style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setIsCategoryModalOpen(false)} 
              style={{ width: '100%', marginTop: '32px', padding: '14px', borderRadius: '12px', border: '1px solid #ddd', cursor: 'pointer', fontWeight: '600' }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderLeft: '4px solid #C81D25' }}>
          <span style={{ color: '#666', fontSize: '0.9rem', fontWeight: '500' }}>Total de Produtos</span>
          <h2 style={{ margin: '8px 0 0 0', fontSize: '1.8rem' }}>{products.length}</h2>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderLeft: '4px solid #4caf50' }}>
          <span style={{ color: '#666', fontSize: '0.9rem', fontWeight: '500' }}>Disponíveis</span>
          <h2 style={{ margin: '8px 0 0 0', fontSize: '1.8rem' }}>{products.filter(p => p.is_available).length}</h2>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderLeft: '4px solid #ff9800' }}>
          <span style={{ color: '#666', fontSize: '0.9rem', fontWeight: '500' }}>Categorias</span>
          <h2 style={{ margin: '8px 0 0 0', fontSize: '1.8rem' }}>{categories.length}</h2>
        </div>
      </div>

      {categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Tag size={48} color="#ccc" style={{ marginBottom: '16px' }} />
          <h2>Comece criando uma categoria</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>Para organizar seu cardápio, você precisa de categorias (ex: Lanches, Bebidas).</p>
          <button onClick={() => setIsCategoryModalOpen(true)} className="primary-action" style={{ padding: '12px 32px', borderRadius: '12px' }}>Criar Minha Primeira Categoria</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {categories.map(category => {
            const categoryProducts = products.filter(p => p.category_id === category.id);
            
            return (
              <section key={category.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--lp-text-dark)' }}>{category.name}</h2>
                  <span style={{ background: '#eee', padding: '2px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', color: '#666' }}>
                    {categoryProducts.length} {categoryProducts.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {categoryProducts.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '32px', background: '#f9f9f9', borderRadius: '16px', textAlign: 'center', border: '2px dashed #eee', color: '#888' }}>
                      Nenhum produto nesta categoria. <button onClick={() => { setProductToEdit(null); setIsModalOpen(true); }} style={{ background: 'none', border: 'none', color: 'var(--brand-red)', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}>Adicionar item</button>
                    </div>
                  ) : (
                    categoryProducts.map(product => (
                      <div key={product.id} className="order-card" style={{ padding: '0', overflow: 'hidden', position: 'relative', border: product.is_available ? 'none' : '1px solid #eee' }}>
                        {!product.is_available && (
                          <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 5, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold', backdropFilter: 'blur(4px)' }}>
                            ESGOTADO
                          </div>
                        )}
                        
                        <div style={{ height: '160px', width: '100%', backgroundColor: '#f0f0f0', backgroundImage: `url(${product.image})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: product.is_available ? 'none' : 'grayscale(100%)' }} />
                        
                        <div style={{ padding: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: product.is_available ? 'var(--lp-text-dark)' : '#999' }}>
                              {product.name}
                            </h3>
                            <span style={{ fontWeight: '800', color: 'var(--brand-red)', fontSize: '1.1rem' }}>R$ {product.price.toFixed(2)}</span>
                          </div>
                          
                          <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.8rem' }}>
                            {product.description || 'Sem descrição cadastrada.'}
                          </p>
                          
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div 
                              onClick={() => toggleAvailability(product.id, product.is_available ?? true)}
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                cursor: 'pointer',
                                padding: '6px 12px',
                                borderRadius: '12px',
                                background: product.is_available ? '#e8f5e9' : '#f5f5f5',
                                color: product.is_available ? '#2e7d32' : '#999',
                                fontWeight: '700',
                                fontSize: '0.75rem',
                                transition: 'all 0.2s',
                                border: '1px solid transparent'
                              }}
                            >
                              {product.is_available ? '🟢 Disponível' : '🔴 Esgotado'}
                            </div>
                            
                            <button 
                              onClick={async () => {
                                if (window.confirm('Deseja duplicar este produto?')) {
                                  const { id, created_at, ...cloneData } = product;
                                  const { error } = await supabase.from('products').insert({ ...cloneData, name: `${product.name} (Cópia)` });
                                  if (!error) loadData();
                                }
                              }}
                              style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '600' }}
                              title="Duplicar Produto"
                            >
                              <Plus size={14} /> Duplicar
                            </button>
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => openEditModal(product)} style={{ flex: 1, padding: '10px', background: '#f5f5f5', color: '#333', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600', transition: 'all 0.2s' }}>
                              <Edit2 size={16} /> Editar
                            </button>
                            <button onClick={() => handleDelete(product.id)} style={{ padding: '10px', background: 'rgba(200, 29, 37, 0.05)', color: '#C81D25', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <ProductFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
        productToEdit={productToEdit}
        categories={categories}
        storeId={storeId}
      />
    </div>
  );
}
