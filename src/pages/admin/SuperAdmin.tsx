import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Store, Users, DollarSign, ExternalLink } from 'lucide-react';
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

export default function SuperAdmin() {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStores: 0,
    activeSubscribers: 0,
    mrr: 0
  });

  useEffect(() => {
    async function fetchAllStores() {
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        const storesData = data || [];
        setStores(storesData);
        
        const activeCount = storesData.filter(s => s.subscription_status === 'active').length;
        // Mocking MRR calculation based on active plans
        const estimatedMRR = storesData.reduce((acc, store) => {
          if (store.subscription_status !== 'active') return acc;
          const prices: Record<string, number> = { 'Starter': 39.9, 'Growth': 79.9, 'Diamond': 149.9 };
          return acc + (prices[store.plan_type || 'Starter'] || 39.9);
        }, 0);

        setStats({
          totalStores: storesData.length,
          activeSubscribers: activeCount,
          mrr: estimatedMRR
        });
      } catch (error) {
        console.error('Error fetching all stores:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAllStores();
  }, []);

  if (loading) return <div className="p-4">Carregando dados da plataforma...</div>;

  const getStatusStyle = (status: string | undefined) => {
    switch (status) {
      case 'active': return { background: '#e8f5e9', color: '#2e7d32' };
      case 'expired': return { background: '#ffebee', color: '#c62828' };
      case 'trial': return { background: '#fffde7', color: '#fbc02d' };
      default: return { background: '#f5f5f5', color: '#757575' };
    }
  };

  return (
    <div className="dashboard-container fade-in">
      <header className="dashboard-header" style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#d32f2f', display: 'flex', alignItems: 'center', gap: '12px' }}>
          Gestão Geral (Master)
        </h1>
        <p>Controle global de todos os restaurantes cadastrados no ANOTÔ</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="stat-card" style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Total de Lojas</p>
              <h2 style={{ margin: '8px 0 0 0', fontSize: '2rem' }}>{stats.totalStores}</h2>
            </div>
            <div style={{ padding: '12px', background: '#f0f4ff', color: '#1a237e', borderRadius: '12px' }}><Store size={24} /></div>
          </div>
        </div>

        <div className="stat-card" style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Assinantes Ativos</p>
              <h2 style={{ margin: '8px 0 0 0', fontSize: '2rem' }}>{stats.activeSubscribers}</h2>
              <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', marginTop: '12px' }}>
                <div style={{ width: `${(stats.activeSubscribers / stats.totalStores || 1) * 100}%`, height: '100%', background: '#4caf50', borderRadius: '4px' }}></div>
              </div>
            </div>
            <div style={{ padding: '12px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '12px' }}><Users size={24} /></div>
          </div>
        </div>

        <div className="stat-card" style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Faturamento SaaS (MRR)</p>
              <h2 style={{ margin: '8px 0 0 0', fontSize: '2rem' }}>R$ {stats.mrr.toFixed(2)}</h2>
            </div>
            <div style={{ padding: '12px', background: '#fff3e0', color: '#e65100', borderRadius: '12px' }}><DollarSign size={24} /></div>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Lojas Cadastradas</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '16px 24px', color: '#666', fontWeight: '600' }}>Loja</th>
                <th style={{ padding: '16px 24px', color: '#666', fontWeight: '600' }}>WhatsApp</th>
                <th style={{ padding: '16px 24px', color: '#666', fontWeight: '600' }}>Plano</th>
                <th style={{ padding: '16px 24px', color: '#666', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '16px 24px', color: '#666', fontWeight: '600' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {stores.map(store => {
                const statusStyle = getStatusStyle(store.subscription_status);
                return (
                <tr key={store.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: '600' }}>{store.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>/{store.slug}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank" rel="noreferrer" style={{ color: '#2e7d32', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {store.whatsapp_number} <ExternalLink size={14} />
                    </a>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{store.plan_type || 'Starter'}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      fontWeight: '700', 
                      textTransform: 'uppercase',
                      ...statusStyle
                    }}>
                      {store.subscription_status || 'Trial'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <a href={`/${store.slug}`} target="_blank" rel="noreferrer" style={{ color: '#1a237e', fontSize: '0.85rem', fontWeight: '600' }}>
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
