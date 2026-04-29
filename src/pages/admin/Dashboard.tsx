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
  const [checklist, setChecklist] = useState({
    categories: false,
    products: false,
    openingHours: false,
    logo: false
  });

  async function fetchOrders(sid: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, total, status, created_at')
        .eq('store_id', sid);

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders for metrics:', error);
    }
  }

  useEffect(() => {
    async function initialize() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .eq('owner_id', session.user.id)
          .single();

        if (storeError) throw storeError;

        if (storeData) {
          setStoreId(storeData.id);
          await fetchOrders(storeData.id);
          
          // Fetch checklist data
          const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true }).eq('store_id', storeData.id);
          const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('store_id', storeData.id);
          
          setChecklist({
            categories: (catCount || 0) > 0,
            products: (prodCount || 0) > 0,
            openingHours: !!storeData.opening_hours,
            logo: storeData.logo !== '/assets/logo.png' && !!storeData.logo
          });
        }
      } catch (error) {
        console.error('Error initializing dashboard metrics:', error);
      } finally {
        setLoading(false);
      }
    }

    initialize();

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);


  if (loading) return <div className="p-4">Carregando métricas...</div>;
  if (!storeId) return <div className="p-4">Por favor, configure sua loja antes de ver as métricas.</div>;

  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today);
  
  const todayRevenue = todayOrders
    .filter(o => o.status === 'delivered')
    .reduce((acc, curr) => acc + curr.total, 0);

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const preparingCount = orders.filter(o => o.status === 'preparing').length;

  const checklistItems = [
    { label: 'Cadastrar categorias', completed: checklist.categories },
    { label: 'Adicionar produtos', completed: checklist.products },
    { label: 'Configurar horário de funcionamento', completed: checklist.openingHours },
    { label: 'Subir logo da loja', completed: checklist.logo }
  ];

  return (
    <div className="dashboard-container fade-in">
      <header className="dashboard-header" style={{ marginBottom: '32px' }}>
        <h1>Dashboard</h1>
        <p>Resumo de desempenho da sua loja hoje</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {/* ... stats cards ... */}
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '40px' }}>
        
        {/* Onboarding Checklist */}
        <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
             🚀 Passos para o Sucesso
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {checklistItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: item.completed ? '#4caf50' : '#888' }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  border: `2px solid ${item.completed ? '#4caf50' : '#ddd'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: item.completed ? '#e8f5e9' : 'transparent'
                }}>
                  {item.completed && <TrendingUp size={14} />}
                </div>
                <span style={{ fontSize: '1rem', fontWeight: item.completed ? '600' : '400', textDecoration: item.completed ? 'line-through' : 'none' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #FFC107 0%, #FF9800 100%)', padding: '32px', borderRadius: '16px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ marginBottom: '12px', fontSize: '1.5rem' }}>Dica do Dia 💡</h3>
          <p style={{ margin: 0, opacity: 0.9, lineHeight: '1.6' }}>
            Mantenha seu cardápio atualizado e as fotos dos produtos atrativas para aumentar sua taxa de conversão em até 40%!
          </p>
        </div>

      </div>
    </div>
  );
}
