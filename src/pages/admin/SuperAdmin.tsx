import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Store, Users, BarChart2, ShieldCheck
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import './Admin.css';

interface StoreData {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  whatsapp_number: string;
  created_at: string;
  subscription_status?: string;
  plan_type?: string;
  email?: string;
  last_access_at?: string;
}



interface LeadData {
  id: string;
  email: string;
  name: string;
  created_at: string;
  last_access_at: string | null;
  status: string;
  phone?: string;
  isManual?: boolean;
}

interface MonthlyData {
  month: string;
  mrr: number;
  subscribers: number;
  newSubscribers: number;
}

const PLAN_PRICES: Record<string, number> = {
  'Mensal': 39.90,
  'Anual': 24.75, // MRR equivalente (297 / 12)
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
    newThisMonth: 0,
  });

  const [activeTab, setActiveTab] = useState<'stats' | 'lojistas' | 'leads'>('stats');
  const [consolidatedLeads, setConsolidatedLeads] = useState<LeadData[]>([]);



  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stores and Profiles
      const [storesRes, profilesRes] = await Promise.all([
        supabase.from('stores').select('*, profiles(email, last_access_at, full_name)').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false })
      ]);

      const storesData: StoreData[] = (storesRes.data || []).map((s: any) => ({
        ...s,
        email: s.profiles?.email || '',
        last_access_at: s.profiles?.last_access_at || ''
      }));
      
      setStores(storesData);
      const profiles = profilesRes.data || [];
      
      // Consolidate Leads
      const leadsMap = new Map<string, LeadData>();

      // A) Add people from Profiles who don't have a store
      profiles.forEach(p => {
        const userEmail = p.email?.toLowerCase();
        // Check if there is ANY store matching owner_id OR email
        const hasStore = storesData.some(s => 
          s.owner_id === p.id || 
          (s.email?.toLowerCase() === userEmail && userEmail)
        );

        if (!hasStore && userEmail) {
          leadsMap.set(userEmail, {
            id: p.id,
            email: p.email,
            name: p.full_name || 'Usuário do App',
            created_at: p.created_at,
            last_access_at: p.last_access_at,
            status: 'Pendente de Loja',
            phone: p.phone,
            isManual: false
          });
        }
      });

      const leadsArray = Array.from(leadsMap.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setConsolidatedLeads(leadsArray);

      // Metrics
      const activeMRR = storesData.reduce((acc, store) => {
        if (store.subscription_status !== 'active') return acc;
        return acc + (PLAN_PRICES[store.plan_type || 'Mensal'] || 39.90);
      }, 0);

      const activeCount = storesData.filter(s => s.subscription_status === 'active').length;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const newThisMonth = storesData.filter(s => new Date(s.created_at) >= startOfMonth).length;

      // Chart Data
      const monthlyMap: Record<string, { mrr: number; subscribers: number; newSubscribers: number }> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${MONTH_NAMES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
        monthlyMap[key] = { mrr: 0, subscribers: 0, newSubscribers: 0 };
      }

      storesData.forEach(store => {
        const d = new Date(store.created_at);
        const key = `${MONTH_NAMES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
        if (monthlyMap[key] !== undefined) {
          if (store.subscription_status === 'active') {
            monthlyMap[key].mrr += PLAN_PRICES[store.plan_type || 'Mensal'] || 39.90;
            monthlyMap[key].subscribers += 1;
          }
          monthlyMap[key].newSubscribers += 1;
        }
      });

      setMonthlyData(Object.entries(monthlyMap).map(([month, data]) => ({ month, ...data })));
      setStats({
        totalStores: storesData.length,
        activeSubscribers: activeCount,
        mrr: activeMRR,
        arr: activeMRR * 12,
        newThisMonth,
      });
    } catch (error) {
      console.error('Error fetching master data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleActivateStore = async (storeId: string, email: string, type: 'active' | 'trial' = 'active') => {
    const actionName = type === 'active' ? 'ativar' : 'liberar teste para';
    if (!confirm(`Deseja ${actionName} a loja do e-mail ${email}?`)) return;
    try {
      const { error: storeError } = await supabase.from('stores').update({
        subscription_status: type,
        plan_type: 'Mensal',
        last_payment_at: new Date().toISOString()
      }).eq('id', storeId);
      if (storeError) throw storeError;
      
      if (email) {
        await supabase.from('authorized_emails').upsert({
          email: email.toLowerCase().trim(),
          plan_type: 'Mensal',
          authorized_at: new Date().toISOString()
        }, { onConflict: 'email' });
      }
      alert('Loja atualizada com sucesso!');
      fetchData();
    } catch (error: any) {
      alert('Erro ao atualizar: ' + error.message);
    }
  };

  const handleChangePlan = async (storeId: string, newPlan: string) => {
    try {
      const { error } = await supabase.from('stores').update({ plan_type: newPlan }).eq('id', storeId);
      if (error) throw error;
      setStores(prev => prev.map(s => s.id === storeId ? { ...s, plan_type: newPlan } : s));
    } catch (error: any) {
      alert('Erro ao mudar plano: ' + error.message);
    }
  };

  const calculateDaysRemaining = (dateStr: string) => {
    const created = new Date(dateStr);
    const expires = new Date(created);
    expires.setDate(expires.getDate() + 30);
    const now = new Date();
    const diffTime = expires.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div className="spinner" />
      <p style={{ color: '#64748b' }}>Carregando Central Master...</p>
    </div>
  );

  const getStatusStyle = (status: string | undefined) => {
    switch (status) {
      case 'active':  return { background: '#dcfce7', color: '#166534' };
      case 'expired': return { background: '#fef2f2', color: '#991b1b' };
      case 'trial':   return { background: '#fffbeb', color: '#92400e' };
      default:        return { background: '#f1f5f9', color: '#475569' };
    }
  };

  const getLeadStatusStyle = (status: string) => {
    if (status.includes('Pendente de Loja')) {
      return { background: '#fef3c7', color: '#92400e' };
    } else if (status.includes('Ainda não entrou')) {
      return { background: '#e0e7ff', color: '#3730a3' };
    }
    return { background: '#f1f5f9', color: '#475569' };
  };

  return (
    <div className="dashboard-container fade-in super-admin-container">
      <header className="dashboard-header super-admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="super-admin-icon-wrapper">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>Central Master</h1>
            <p style={{ color: '#64748b', margin: '4px 0 0' }}>Controle total da plataforma ANOTÔ</p>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="super-admin-tabs">
        {[
          { id: 'stats', label: 'Visão Geral', icon: <BarChart2 size={18} /> },
          { id: 'lojistas', label: 'Lojistas', icon: <Store size={18} /> },
          { id: 'leads', label: 'Leads & Acessos', icon: <Users size={18} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`super-admin-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'stats' && (
        <div className="fade-in">
          {/* Metrics Grid */}
          <div className="super-admin-metrics-grid">
            <div className="super-admin-metric-card mrr-card">
              <p className="metric-label">Faturamento (MRR)</p>
              <h2 className="metric-value">{formatCurrency(stats.mrr)}</h2>
              <div className="metric-progress-bar-bg">
                <div className="metric-progress-bar-fill" style={{ width: `${Math.min((stats.mrr/10000)*100, 100)}%` }} />
              </div>
            </div>
            <div className="super-admin-metric-card">
              <p className="metric-label">Lojistas Ativos</p>
              <h2 className="metric-value">{stats.activeSubscribers}</h2>
              <p className="metric-subtitle green">de {stats.totalStores} totais</p>
            </div>
            <div className="super-admin-metric-card">
              <p className="metric-label">Novas Lojas (Mês)</p>
              <h2 className="metric-value">+{stats.newThisMonth}</h2>
              <p className="metric-subtitle blue">Crescimento orgânico</p>
            </div>
            <div className="super-admin-metric-card">
              <p className="metric-label">Potencial de Leads</p>
              <h2 className="metric-value">{consolidatedLeads.length}</h2>
              <p className="metric-subtitle gray">Usuários sem loja</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="super-admin-charts-grid">
            <div className="super-admin-chart-card">
              <h3 className="chart-title">Receita Recorrente</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={v => `R$${v}`} />
                  <Tooltip />
                  <Line type="monotone" dataKey="mrr" stroke="#dc2626" strokeWidth={4} dot={{ r: 6, fill: '#dc2626' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="super-admin-chart-card">
              <h3 className="chart-title">Adesão de Novos Lojistas</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip />
                  <Bar dataKey="newSubscribers" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'lojistas' && (
        <div className="fade-in super-admin-panel">
          <div className="super-admin-panel-header">
            <h2>Gestão de Lojistas Ativos</h2>
          </div>
          <div className="responsive-table-wrapper">
            <table className="super-admin-table">
              <thead>
                <tr>
                  <th>Loja</th>
                  <th>Status</th>
                  <th>Plano</th>
                  <th>MRR</th>
                  <th>Último Acesso</th>
                  <th>Vencimento</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(store => {
                  const daysLeft = calculateDaysRemaining(store.created_at);
                  return (
                    <tr key={store.id}>
                      <td data-label="Loja">
                        <div className="store-name">{store.name}</div>
                        <div className="store-email">{store.email || 'Email não vinculado'}</div>
                      </td>
                      <td data-label="Status">
                        <span className="status-badge" style={getStatusStyle(store.subscription_status)}>
                          {store.subscription_status === 'trial' ? `TESTE (${daysLeft}d)` : store.subscription_status}
                        </span>
                      </td>
                      <td data-label="Plano">
                        <select 
                          className="plan-select"
                          value={store.plan_type || 'Mensal'}
                          onChange={(e) => handleChangePlan(store.id, e.target.value)}
                        >
                          <option value="Mensal">Mensal</option>
                          <option value="Anual">Anual</option>
                        </select>
                      </td>
                      <td data-label="MRR" className={`mrr-value ${store.subscription_status === 'active' ? 'active' : ''}`}>
                        {store.subscription_status === 'active' ? formatCurrency(PLAN_PRICES[store.plan_type || 'Mensal']) : '—'}
                      </td>
                      <td data-label="Último Acesso" className="last-access-value">
                        {store.last_access_at ? new Date(store.last_access_at).toLocaleString('pt-BR') : 'Sem acesso'}
                      </td>
                      <td data-label="Vencimento">
                        {store.subscription_status === 'trial' ? (
                          <div className={`days-left ${daysLeft < 5 ? 'urgent' : ''}`}>{daysLeft} dias</div>
                        ) : 'Vitalício'}
                      </td>
                      <td data-label="Ações" className="actions-cell">
                        <div className="actions-wrapper">
                          <button onClick={() => handleActivateStore(store.id, store.email || '', 'active')} className="btn-activate">Ativar</button>
                          <a href={`/${store.slug}`} target="_blank" className="secondary-action btn-view">Ver Loja</a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'leads' && (
        <div className="fade-in">
          <div className="super-admin-panel">
            <div className="super-admin-panel-header leads-header">
              <h2>Leads & Acessos Pendentes</h2>
              <span className="leads-badge">
                {consolidatedLeads.length} Usuários
              </span>
            </div>
            <div className="leads-grid">
              {consolidatedLeads.map(lead => (
                <div key={lead.id} className="lead-card">
                  <div className="lead-card-header">
                    <div className="lead-avatar">
                      {lead.email?.[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div className="lead-name">{lead.name}</div>
                      <div className="lead-email" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.email}</div>
                    </div>
                  </div>
                  <div className="lead-status-badge" style={getLeadStatusStyle(lead.status)}>
                    {lead.status}
                  </div>
                  <div className="lead-details">
                    <span>Criado: {new Date(lead.created_at).toLocaleDateString('pt-BR')}</span>
                    <span>Acesso: {lead.last_access_at ? new Date(lead.last_access_at).toLocaleDateString('pt-BR') : 'Nunca'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    {lead.phone ? (
                      <a href={`https://wa.me/${lead.phone}`} target="_blank" className="btn-whatsapp" style={{ flex: 1, textAlign: 'center' }}>
                         WhatsApp
                      </a>
                    ) : (
                      <a href={`mailto:${lead.email}`} className="btn-email" style={{ flex: 1, textAlign: 'center' }}>
                         E-mail
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {consolidatedLeads.length === 0 && (
                <div style={{ padding: '20px', color: '#64748b' }}>Nenhum lead encontrado.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
