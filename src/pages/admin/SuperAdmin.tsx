import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Store, Users, DollarSign, ExternalLink, TrendingUp, BarChart2 } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import './Admin.css';

interface StoreData {
  id: string;
  name: string;
  slug: string;
  whatsapp_number: string;
  created_at: string;
  subscription_status?: string;
  plan_type?: string;
}

interface AuthorizedEmail {
  email: string;
  plan_type: string;
  authorized_at: string;
}

interface MonthlyData {
  month: string;
  mrr: number;
  subscribers: number;
  newSubscribers: number;
}

const PLAN_PRICES: Record<string, number> = {
  'Starter': 39.90,
  'Growth': 79.90,
  'Diamond': 149.90,
};

function formatCurrency(value: number) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function SuperAdmin() {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [stats, setStats] = useState({
    totalStores: 0,
    activeSubscribers: 0,
    mrr: 0,
    arr: 0,
    churnThisMonth: 0,
    newThisMonth: 0,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch stores and authorized_emails in parallel
        const [storesRes, emailsRes] = await Promise.all([
          supabase.from('stores').select('*').order('created_at', { ascending: false }),
          supabase.from('authorized_emails').select('email, plan_type, authorized_at').order('authorized_at', { ascending: true }),
        ]);

        const storesData: StoreData[] = storesRes.data || [];
        const emailsData: AuthorizedEmail[] = emailsRes.data || [];

        setStores(storesData);

        // Current MRR from active stores
        const activeMRR = storesData.reduce((acc, store) => {
          if (store.subscription_status !== 'active') return acc;
          return acc + (PLAN_PRICES[store.plan_type || 'Starter'] || 39.90);
        }, 0);

        const activeCount = storesData.filter(s => s.subscription_status === 'active').length;

        // New subscribers this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newThisMonth = emailsData.filter(e => new Date(e.authorized_at) >= startOfMonth).length;

        // Build monthly chart data from authorized_emails (last 6 months)
        const monthlyMap: Record<string, { mrr: number; subscribers: number; newSubscribers: number }> = {};

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${MONTH_NAMES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
          monthlyMap[key] = { mrr: 0, subscribers: 0, newSubscribers: 0 };
        }

        // Count subscribers and MRR per month (cumulative)
        emailsData.forEach(email => {
          const d = new Date(email.authorized_at);
          const key = `${MONTH_NAMES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
          if (monthlyMap[key] !== undefined) {
            monthlyMap[key].newSubscribers += 1;
            monthlyMap[key].mrr += PLAN_PRICES[email.plan_type || 'Starter'] || 39.90;
          }
        });

        // Make cumulative subscriber count
        let cumulative = Math.max(0, activeCount - newThisMonth);
        const chartData: MonthlyData[] = Object.entries(monthlyMap).map(([month, data]) => {
          cumulative += data.newSubscribers;
          return { month, mrr: data.mrr, subscribers: cumulative, newSubscribers: data.newSubscribers };
        });
        // Fix: last month should show current actual count
        if (chartData.length > 0) chartData[chartData.length - 1].subscribers = activeCount;

        setMonthlyData(chartData);
        setStats({
          totalStores: storesData.length,
          activeSubscribers: activeCount,
          mrr: activeMRR,
          arr: activeMRR * 12,
          churnThisMonth: 0, // Would need a churn log table for real data
          newThisMonth,
        });
      } catch (error) {
        console.error('Error fetching master data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #f1f5f9', borderTop: '3px solid #dc2626', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#64748b' }}>Carregando dados da plataforma...</p>
    </div>
  );

  const getStatusStyle = (status: string | undefined) => {
    switch (status) {
      case 'active':  return { background: '#e8f5e9', color: '#2e7d32' };
      case 'expired': return { background: '#ffebee', color: '#c62828' };
      case 'trial':   return { background: '#fffde7', color: '#fbc02d' };
      default:        return { background: '#f5f5f5', color: '#757575' };
    }
  };

  const conversionRate = stats.totalStores > 0
    ? Math.round((stats.activeSubscribers / stats.totalStores) * 100)
    : 0;

  return (
    <div className="dashboard-container fade-in" style={{ maxWidth: '1300px', margin: '0 auto' }}>
      <header className="dashboard-header" style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#d32f2f', display: 'flex', alignItems: 'center', gap: '12px' }}>
          Gestão Geral (Master)
        </h1>
        <p>Controle global e métricas SaaS do ANOTÔ</p>
      </header>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>

        <div style={{ background: '#fff', padding: '20px 24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderTop: '3px solid #2563eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total de Lojas</p>
              <h2 style={{ margin: '8px 0 0', fontSize: '2rem', fontWeight: '900', color: '#0f172a' }}>{stats.totalStores}</h2>
            </div>
            <div style={{ padding: '10px', background: '#eff6ff', color: '#2563eb', borderRadius: '10px' }}><Store size={20} /></div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '20px 24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderTop: '3px solid #16a34a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assinantes Ativos</p>
              <h2 style={{ margin: '8px 0 4px', fontSize: '2rem', fontWeight: '900', color: '#0f172a' }}>{stats.activeSubscribers}</h2>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#16a34a', fontWeight: '600' }}>+{stats.newThisMonth} este mês</p>
            </div>
            <div style={{ padding: '10px', background: '#f0fdf4', color: '#16a34a', borderRadius: '10px' }}><Users size={20} /></div>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', padding: '20px 24px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(220,38,38,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>MRR</p>
              <h2 style={{ margin: '8px 0 4px', fontSize: '1.7rem', fontWeight: '900', color: '#fff' }}>{formatCurrency(stats.mrr)}</h2>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>Receita mensal recorrente</p>
            </div>
            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: '10px' }}><DollarSign size={20} /></div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '20px 24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderTop: '3px solid #7c3aed' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ARR (Projeção)</p>
              <h2 style={{ margin: '8px 0 4px', fontSize: '1.7rem', fontWeight: '900', color: '#0f172a' }}>{formatCurrency(stats.arr)}</h2>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>MRR × 12 meses</p>
            </div>
            <div style={{ padding: '10px', background: '#f5f3ff', color: '#7c3aed', borderRadius: '10px' }}><TrendingUp size={20} /></div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '20px 24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderTop: '3px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Taxa de Conversão</p>
              <h2 style={{ margin: '8px 0 4px', fontSize: '2rem', fontWeight: '900', color: '#0f172a' }}>{conversionRate}%</h2>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Lojas que assinaram</p>
            </div>
            <div style={{ padding: '10px', background: '#fffbeb', color: '#f59e0b', borderRadius: '10px' }}><BarChart2 size={20} /></div>
          </div>
        </div>

      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>

        {/* MRR Line Chart */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Crescimento do MRR</h3>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.82rem' }}>Receita acumulada por mês (últimos 6 meses)</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
              <Tooltip formatter={(v) => [formatCurrency(Number(v)), 'MRR']} contentStyle={{ borderRadius: '10px', border: '1px solid #f1f5f9' }} />
              <Line type="monotone" dataKey="mrr" stroke="#dc2626" strokeWidth={3} dot={{ fill: '#dc2626', r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* New Subscribers Bar Chart */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Novos Assinantes</h3>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.82rem' }}>Quantidade de novas adesões por mês</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [Number(v), 'Novos assinantes']} contentStyle={{ borderRadius: '10px', border: '1px solid #f1f5f9' }} />
              <Bar dataKey="newSubscribers" fill="#2563eb" radius={[6, 6, 0, 0]} name="Novos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Meta progress */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: '700', color: '#0f172a' }}>Meta: 250 Assinantes</h3>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              {stats.activeSubscribers} de 250 — faltam {Math.max(0, 250 - stats.activeSubscribers)} assinantes
            </p>
          </div>
          <span style={{ fontWeight: '900', fontSize: '1.5rem', color: '#dc2626' }}>
            {Math.round((stats.activeSubscribers / 250) * 100)}%
          </span>
        </div>
        <div style={{ width: '100%', height: '12px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            borderRadius: '6px',
            background: 'linear-gradient(90deg, #dc2626, #f59e0b)',
            width: `${Math.min((stats.activeSubscribers / 250) * 100, 100)}%`,
            transition: 'width 1s ease'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem', color: '#94a3b8' }}>
          <span>0</span>
          <span>Meta: MRR R$ {formatCurrency(250 * 39.90)}</span>
          <span>250</span>
        </div>
      </div>

      {/* Stores Table */}
      <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontWeight: '700' }}>Lojas Cadastradas</h3>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{stores.length} lojas</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '14px 24px', color: '#64748b', fontWeight: '600', fontSize: '0.85rem' }}>Loja</th>
                <th style={{ padding: '14px 24px', color: '#64748b', fontWeight: '600', fontSize: '0.85rem' }}>WhatsApp</th>
                <th style={{ padding: '14px 24px', color: '#64748b', fontWeight: '600', fontSize: '0.85rem' }}>Plano</th>
                <th style={{ padding: '14px 24px', color: '#64748b', fontWeight: '600', fontSize: '0.85rem' }}>MRR</th>
                <th style={{ padding: '14px 24px', color: '#64748b', fontWeight: '600', fontSize: '0.85rem' }}>Status</th>
                <th style={{ padding: '14px 24px', color: '#64748b', fontWeight: '600', fontSize: '0.85rem' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {stores.map(store => {
                const statusStyle = getStatusStyle(store.subscription_status);
                const storeMRR = store.subscription_status === 'active'
                  ? PLAN_PRICES[store.plan_type || 'Starter'] || 39.90
                  : 0;
                return (
                  <tr key={store.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 24px' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{store.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>/{store.slug}</div>
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank" rel="noreferrer"
                        style={{ color: '#16a34a', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}>
                        {store.whatsapp_number} <ExternalLink size={12} />
                      </a>
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>{store.plan_type || 'Starter'}</span>
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      <span style={{ fontWeight: '700', color: storeMRR > 0 ? '#16a34a' : '#94a3b8', fontSize: '0.9rem' }}>
                        {storeMRR > 0 ? formatCurrency(storeMRR) : '—'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', ...statusStyle }}>
                        {store.subscription_status || 'trial'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      <a href={`/${store.slug}`} target="_blank" rel="noreferrer"
                        style={{ color: '#2563eb', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>
                        Ver Cardápio
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
