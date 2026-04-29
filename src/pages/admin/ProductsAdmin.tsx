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

      <div className="orders-grid">
            {products.length === 0 ? (
              <div className="no-orders" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '16px', color: '#666' }}>
                {!storeId ? 'Erro ao carregar dados da loja. Tente atualizar a página.' : 'Nenhum produto cadastrado.'}
              </div>
            ) : (
          products.map(product => {
            const category = categories.find(c => c.id === product.category_id);
            return (
              <div key={product.id} className="order-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ height: '160px', width: '100%', backgroundColor: '#eee', backgroundImage: `url(${product.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: product.is_available ? 'inherit' : '#888' }}>
                      {product.name} {!product.is_available && <span style={{ fontSize: '0.75rem', background: '#eee', padding: '2px 6px', borderRadius: '4px', verticalAlign: 'middle' }}>ESGOTADO</span>}
                    </h3>
                    <span style={{ fontWeight: 'bold', color: product.is_available ? '#2962ff' : '#888' }}>R$ {product.price.toFixed(2)}</span>
                  </div>
                  
                  <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 12px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.description}
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', color: '#888', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Tag size={14} /> {category?.name || 'Sem categoria'}
                    </div>
                    
                    <div 
                      onClick={() => toggleAvailability(product.id, product.is_available ?? true)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '20px',
                        background: product.is_available ? '#e8f5e9' : '#fafafa',
                        color: product.is_available ? '#2e7d32' : '#999',
                        fontWeight: '600',
                        fontSize: '0.75rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      {product.is_available ? '🟢 Disponível' : '🔴 Esgotado'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                    <button onClick={() => openEditModal(product)} style={{ flex: 1, padding: '8px', background: '#f0f4ff', color: '#2962ff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Edit2 size={16} /> Editar
                    </button>
                    <button onClick={() => handleDelete(product.id)} style={{ padding: '8px', background: '#ffebee', color: '#d32f2f', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

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
