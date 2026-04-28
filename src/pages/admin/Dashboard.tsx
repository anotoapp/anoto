import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';
import './Admin.css';

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    async function initialize() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: storeData } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', session.user.id)
        .single();

      if (storeData) {
        setStoreId(storeData.id);
        fetchOrders(storeData.id);
      } else {
        setLoading(false);
      }
    }

    initialize();
  }, []);

  async function fetchOrders(storeId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, total, status, created_at')
        .eq('store_id', storeId);

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders for metrics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-4">Carregando métricas...</div>;
  if (!storeId) return <div className="p-4">Por favor, configure sua loja antes de ver as métricas.</div>;

  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today);
  
  const todayRevenue = todayOrders
    .filter(o => o.status === 'delivered')
    .reduce((acc, curr) => acc + curr.total, 0);

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const preparingCount = orders.filter(o => o.status === 'preparing').length;

  return (
    <div className="dashboard-container fade-in">
      <header className="dashboard-header" style={{ marginBottom: '32px' }}>
        <h1>Dashboard</h1>
        <p>Resumo de desempenho da sua loja hoje</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1976d2' }}>
            <DollarSign size={28} />
          </div>
          <div>
            <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>Faturamento Hoje</p>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '2rem', color: '#212121' }}>R$ {todayRevenue.toFixed(2)}</h2>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#388e3c' }}>
            <ShoppingBag size={28} />
          </div>
          <div>
            <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>Vendas Concluídas</p>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '2rem', color: '#212121' }}>{todayOrders.filter(o => o.status === 'delivered').length}</h2>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f57c00' }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>Pendentes/Preparando</p>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '2rem', color: '#212121' }}>{pendingCount + preparingCount}</h2>
          </div>
        </div>

      </div>

      <div style={{ marginTop: '40px', background: '#fff', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '12px' }}>Dica do Dia 💡</h3>
        <p style={{ color: '#666', maxWidth: '500px', margin: '0 auto' }}>
          Mantenha seu cardápio atualizado e as fotos dos produtos atrativas para aumentar sua taxa de conversão!
        </p>
      </div>
    </div>
  );
}
