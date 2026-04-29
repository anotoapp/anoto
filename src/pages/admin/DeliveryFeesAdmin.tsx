import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Trash2, MapPin } from 'lucide-react';
import type { AdminContextType } from './AdminLayout';
import './Admin.css';

interface DeliveryFee {
  id: string;
  neighborhood: string;
  fee: number;
}

export default function DeliveryFeesAdmin() {
  const [fees, setFees] = useState<DeliveryFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState('');
  const [newNeighborhood, setNewNeighborhood] = useState('');
  const [newFee, setNewFee] = useState('');

  const { store } = useOutletContext<AdminContextType>();

  useEffect(() => {
    if (store) loadData();
    else if (store === null) setLoading(false);

    const timeout = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timeout);
  }, [store]);

  async function loadData() {
    if (!store) return;
    
    try {
      setLoading(true);
      setStoreId(store.id);
      
      const { data } = await supabase
        .from('delivery_fees')
        .select('*')
        .eq('store_id', store.id)
        .order('neighborhood');
      
      setFees(data || []);
    } catch (error) {
      console.error('Error loading delivery fees:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!newNeighborhood || !newFee) return;

    try {
      const { error } = await supabase
        .from('delivery_fees')
        .insert({
          store_id: storeId,
          neighborhood: newNeighborhood,
          fee: parseFloat(newFee)
        });

      if (error) throw error;
      
      setNewNeighborhood('');
      setNewFee('');
      loadData();
    } catch {
      alert('Erro ao adicionar taxa.');
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Excluir esta taxa?')) return;
    try {
      const { error } = await supabase.from('delivery_fees').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch {
      alert('Erro ao excluir taxa.');
    }
  }

  if (loading) return <div className="p-4">Carregando taxas...</div>;

  return (
    <div className="dashboard-container fade-in">
      <header className="dashboard-header" style={{ marginBottom: '32px' }}>
        <h1>Taxas de Entrega</h1>
        <p>Cadastre os bairros e seus respectivos valores de entrega</p>
      </header>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '16px' }}>Adicionar Novo Bairro</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px auto', gap: '12px' }}>
          <input 
            type="text" 
            placeholder="Nome do Bairro" 
            value={newNeighborhood}
            onChange={e => setNewNeighborhood(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          <input 
            type="number" 
            placeholder="Taxa (R$)" 
            value={newFee}
            onChange={e => setNewFee(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          <button 
            onClick={handleAdd}
            style={{ padding: '10px 24px', background: '#2962ff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
          >
            Adicionar
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
              <th style={{ padding: '16px 24px' }}>Bairro</th>
              <th style={{ padding: '16px 24px' }}>Taxa</th>
              <th style={{ padding: '16px 24px', textAlign: 'right' }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {fees.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Nenhum bairro cadastrado.</td>
              </tr>
            ) : (
              fees.map(fee => (
                <tr key={fee.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={18} color="#2962ff" /> {fee.neighborhood}
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: '600' }}>R$ {fee.fee.toFixed(2)}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(fee.id)}
                      style={{ padding: '8px', background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
