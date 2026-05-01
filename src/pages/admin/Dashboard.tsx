import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ShoppingBag, DollarSign, TrendingUp, Package, Calendar, Award, Download, ChevronDown } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, AreaChart, Area
} from 'recharts';
import type { AdminContextType } from './AdminLayout';
import './Admin.css';

interface OrderItem {
  quantity: number;
  price: number;
  product?: { name: string };
}

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  order_items?: OrderItem[];
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number>(30);
  const [checklist, setChecklist] = useState({
    categories: false,
    products: false,
    openingHours: false,
    logo: false
  });

  async function fetchOrders(sid: string, days: number) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, total, status, created_at,
          order_items (
            quantity,
            price,
            product:products(name)
          )
        `)
        .eq('store_id', sid)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders for metrics:', error);
    }
  }

  const { store } = useOutletContext<AdminContextType>();

  useEffect(() => {
    async function initialize() {
      if (!store) {
        setLoading(false);
        return;
      }
      
      try {
        setStoreId(store.id);
        await fetchOrders(store.id, timeRange);
        
        // Fetch checklist data only once
        const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true }).eq('store_id', store.id);
        const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('store_id', store.id);
        
        setChecklist({
          categories: (catCount || 0) > 0,
          products: (prodCount || 0) > 0,
          openingHours: !!store.opening_hours,
          logo: store.logo !== '/assets/logo.png' && !!store.logo
        });
      } catch (error) {
        console.error('Error initializing dashboard metrics:', error);
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, [store, timeRange]);

  const exportToCSV = () => {
    if (orders.length === 0) return;
    
    const headers = ['ID', 'Data', 'Status', 'Total (R$)', 'Produtos'];
    const rows = orders.map(o => [
      o.id.slice(0, 8),
      new Date(o.created_at).toLocaleString('pt-BR'),
      o.status,
      o.total.toFixed(2),
      o.order_items?.map(i => `${i.quantity}x ${i.product?.name}`).join(' | ') || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_vendas_${timeRange}dias.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  // Process data for charts
  const salesByDay = orders.reduce((acc: any[], order) => {
    if (order.status !== 'delivered') return acc;
    const date = new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.revenue += order.total;
      existing.orders += 1;
    } else {
      acc.push({ date, revenue: order.total, orders: 1 });
    }
    return acc;
  }, []);

  const topProductsMap = new Map<string, number>();
  orders.forEach(order => {
    if (order.status !== 'delivered') return;
    order.order_items?.forEach(item => {
      const name = item.product?.name || 'Produto';
      topProductsMap.set(name, (topProductsMap.get(name) || 0) + item.quantity);
    });
  });

  const topProducts = Array.from(topProductsMap.entries())
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const totalRevenuePeriod = orders
    .filter(o => o.status === 'delivered')
    .reduce((acc, o) => acc + o.total, 0);
  
  const totalOrdersPeriod = orders.filter(o => o.status === 'delivered').length;
  
  const avgTicketPeriod = totalOrdersPeriod > 0 
    ? totalRevenuePeriod / totalOrdersPeriod 
    : 0;

  return (
    <div className="dashboard-container fade-in">
      <header className="dashboard-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Resumo de desempenho da sua operação</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: '#fff', padding: '4px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
            {[7, 15, 30].map(d => (
              <button 
                key={d}
                onClick={() => setTimeRange(d)}
                style={{ 
                  padding: '8px 16px', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontSize: '0.85rem', 
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: timeRange === d ? '#1e293b' : 'transparent',
                  color: timeRange === d ? '#fff' : '#64748b'
                }}
              >
                {d} dias
              </button>
            ))}
          </div>
          
          <button 
            onClick={exportToCSV}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '12px 20px', 
              background: '#fff', 
              border: '1px solid #e2e8f0', 
              borderRadius: '12px', 
              color: '#0f172a', 
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseOut={e => e.currentTarget.style.background = '#fff'}
          >
            <Download size={18} /> Exportar
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        {/* Stats Card: Hoje */}
        <div style={{ 
          background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)', 
          padding: '24px', 
          borderRadius: '20px', 
          boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.2)', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
             <DollarSign size={100} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <DollarSign size={20} />
            </div>
            <span style={{ fontSize: '0.95rem', fontWeight: '500', opacity: 0.9 }}>Faturamento Hoje</span>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '2.2rem', fontWeight: '800' }}>R$ {todayRevenue.toFixed(2)}</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>{todayOrders.filter(o => o.status === 'delivered').length} pedidos entregues hoje</p>
          </div>
        </div>

        {/* Stats Card: Pedidos Ativos */}
        <div style={{ 
          background: '#fff', 
          padding: '24px', 
          borderRadius: '20px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <ShoppingBag size={20} />
            </div>
            <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#475569' }}>Pedidos Ativos</span>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '2.2rem', fontWeight: '800', color: '#1e293b' }}>{pendingCount + preparingCount}</h2>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>● {pendingCount} pendentes</span>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>● {preparingCount} em preparo</span>
            </div>
          </div>
        </div>

        {/* Stats Card: Ticket Médio */}
        <div style={{ 
          background: '#fff', 
          padding: '24px', 
          borderRadius: '20px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <TrendingUp size={20} />
            </div>
            <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#475569' }}>Ticket Médio ({timeRange}d)</span>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '2.2rem', fontWeight: '800', color: '#1e293b' }}>R$ {avgTicketPeriod.toFixed(2)}</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Média de gasto por pedido entregue</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '40px' }}>
        
        {/* Sales Chart */}
        <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 25px rgba(0,0,0,0.02)', gridColumn: '1 / -1', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: '700' }}>
              <TrendingUp size={22} color="#2563eb" /> Histórico de Faturamento
            </h3>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>Total no Período</span>
              <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>R$ {totalRevenuePeriod.toFixed(2)}</strong>
            </div>
          </div>
          
          <div style={{ height: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesByDay}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Faturamento']}
                  labelStyle={{ fontWeight: '700', marginBottom: '4px', color: '#1e293b' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)"
                  dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Chart */}
        <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 25px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
          <h3 style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: '700' }}>
            <Award size={22} color="#f59e0b" /> Top 5 Produtos
          </h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#475569', fontSize: 12, fontWeight: '500' }}
                  width={110}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="quantity" radius={[0, 8, 8, 0]} barSize={24}>
                  {topProducts.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operations Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 25px rgba(0,0,0,0.02)', flex: 1, border: '1px solid #f1f5f9' }}>
            <h3 style={{ marginBottom: '24px', fontSize: '1.1rem', color: '#1e293b', fontWeight: '700' }}>Resumo da Operação</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Volume de Vendas</p>
                  <p style={{ margin: '4px 0 0 0', fontWeight: '800', fontSize: '1.4rem', color: '#1e293b' }}>{totalOrdersPeriod}</p>
                </div>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                  <Package size={22} color="#3b82f6" />
                </div>
              </div>
              
              <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Ticket Médio</p>
                  <p style={{ margin: '4px 0 0 0', fontWeight: '800', fontSize: '1.4rem', color: '#1e293b' }}>R$ {avgTicketPeriod.toFixed(2)}</p>
                </div>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                  <TrendingUp size={22} color="#10b981" />
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '28px', borderRadius: '24px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', opacity: 0.1 }}>
               <ShoppingBag size={120} />
            </div>
            <h3 style={{ marginBottom: '12px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
              <Package size={20} /> Status do Momento
            </h3>
            <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.9, lineHeight: '1.6' }}>
              Atualmente existem <strong>{pendingCount}</strong> pedidos novos e <strong>{preparingCount}</strong> em produção.
            </p>
            <button 
              onClick={() => window.location.href = '/admin/orders'}
              style={{ marginTop: '20px', width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: '#fff', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              Ver Fila de Pedidos
            </button>
          </div>
        </div>

      </div>

      {/* Steps to success */}
      <div style={{ marginTop: '40px', background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 25px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: '800' }}>
               🚀 Próximos Passos
            </h3>
            <p style={{ color: '#64748b', marginTop: '4px' }}>Complete as etapas para profissionalizar sua loja</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {checklistItems.map((item, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                padding: '16px', 
                background: item.completed ? '#f0fdf4' : '#f8fafc', 
                borderRadius: '16px',
                border: `1px solid ${item.completed ? '#dcfce7' : '#f1f5f9'}`,
                transition: 'all 0.2s'
              }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: item.completed ? '#10b981' : '#fff', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  color: item.completed ? '#fff' : '#cbd5e1'
                }}>
                  {item.completed ? <TrendingUp size={16} /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#cbd5e1' }} />}
                </div>
                <span style={{ fontSize: '0.95rem', fontWeight: '600', color: item.completed ? '#166534' : '#64748b' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
}

