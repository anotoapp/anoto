import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import type { Product, Category } from '../../types';
import { ProductFormModal } from '../../components/admin/ProductFormModal';
import type { AdminContextType } from './AdminLayout';

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [storeId, setStoreId] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const { store } = useOutletContext<AdminContextType>();

  useEffect(() => {
    if (store) loadData();
  }, [store]);

  async function loadData() {
    if (!store) return;
    
    try {
      setLoading(true);
      setStoreId(store.id);

      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('store_id', store.id);

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
    <div className="orders-dashboard">
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Seu Cardápio</h1>
          <p>Gerencie seus produtos e preços</p>
        </div>
        <button onClick={openNewModal} className="primary-action" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white', background: '#2962ff', fontWeight: '500' }}>
          <Plus size={18} /> Novo Produto
        </button>
      </header>

      <div className="orders-grid">
        {products.length === 0 ? (
          <div className="no-orders" style={{ gridColumn: '1 / -1' }}>Nenhum produto cadastrado.</div>
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
