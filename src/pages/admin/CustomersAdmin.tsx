import { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { AdminContextType } from './AdminLayout';
import { 
  Users, 
  Search, 
  MessageCircle, 
  ShoppingBag, 
  Clock,
  ArrowUpRight,
  TrendingUp,
  UserCheck,
  Star,
  Filter,
  Megaphone
} from 'lucide-react';
import './Admin.css';

interface CustomerStats {
  id: string;
  full_name: string;
  phone: string;
  address: string;
  neighborhood: string;
  created_at: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string | null;
}

export default function CustomersAdmin() {
  const { store } = useOutletContext<AdminContextType>();
  const [customers, setCustomers] = useState<CustomerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'crm' | 'reviews'>('crm');
  const [filterAbsent, setFilterAbsent] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  const fetchCustomers = useCallback(async () => {
    if (!store?.id) return;
    try {
      setLoading(true);
      
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('customer_phone, total, created_at')
        .eq('store_id', store.id);

      if (ordersError) throw ordersError;

      const { data: profiles, error: profilesError } = await supabase
        .from('customers')
        .select('*');

      if (profilesError) throw profilesError;

      const customerMap = new Map<string, CustomerStats>();

      orders.forEach(order => {
        const phone = order.customer_phone;
        if (!phone) return;

        const profile = profiles.find(p => p.phone === phone);
        
        if (!customerMap.has(phone)) {
          customerMap.set(phone, {
            id: profile?.id || 'unknown',
            full_name: profile?.full_name || 'Cliente sem nome',
            phone: phone,
            address: profile?.address || 'N/A',
            neighborhood: profile?.neighborhood || 'N/A',
            created_at: profile?.created_at || order.created_at,
            total_orders: 0,
            total_spent: 0,
            last_order_date: null
          });
        }

        const stats = customerMap.get(phone)!;
        stats.total_orders += 1;
        stats.total_spent += Number(order.total);
        
        if (!stats.last_order_date || new Date(order.created_at) > new Date(stats.last_order_date)) {
          stats.last_order_date = order.created_at;
        }
      });

      setCustomers(Array.from(customerMap.values()).sort((a, b) => b.total_spent - a.total_spent));

      // Fetch Reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('order_reviews')
        .select('*')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false });

      if (!reviewsError) {
        setReviews(reviewsData || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  }, [store]);

  useEffect(() => {
    const timer = setTimeout(() => fetchCustomers(), 0);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  const filteredCustomers = customers.filter(c => {
    const searchMatch = c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm);
    if (!filterAbsent) return searchMatch;
    
    // If filterAbsent is true, check if last_order_date is older than 30 days
    if (!c.last_order_date) return false;
    const daysSinceLastOrder = (new Date().getTime() - new Date(c.last_order_date).getTime()) / (1000 * 3600 * 24);
    return searchMatch && daysSinceLastOrder >= 30;
  });

  const totalCustomers = customers.length;
  const avgLTV = totalCustomers > 0 ? customers.reduce((acc, c) => acc + c.total_spent, 0) / totalCustomers : 0;
  const topSpenders = customers.filter(c => c.total_spent > avgLTV * 1.5).length;
  const averageRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;

  return (
    <div className="admin-page fade-in" style={{ padding: '0 20px 40px' }}>
      <header className="admin-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Gestão de Clientes</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Acompanhe o comportamento e fidelidade dos seus clientes.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={fetchCustomers} className="secondary-action" style={{ padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} /> Atualizar
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ padding: '10px', background: '#eff6ff', color: '#2563eb', borderRadius: '12px' }}><Users size={20} /></div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10b981', background: '#f0fdf4', padding: '4px 10px', borderRadius: '20px' }}>TOTAL</span>
          </div>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>Base de Clientes</p>
          <h2 style={{ margin: '4px 0 0', fontSize: '2rem', fontWeight: '800' }}>{totalCustomers}</h2>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ padding: '10px', background: '#fff7ed', color: '#ea580c', borderRadius: '12px' }}><TrendingUp size={20} /></div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ea580c', background: '#fff7ed', padding: '4px 10px', borderRadius: '20px' }}>LTV MÉDIO</span>
          </div>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>Valor Médio por Cliente</p>
          <h2 style={{ margin: '4px 0 0', fontSize: '2rem', fontWeight: '800' }}>R$ {avgLTV.toFixed(2)}</h2>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ padding: '10px', background: '#f5f3ff', color: '#7c3aed', borderRadius: '12px' }}><UserCheck size={20} /></div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#7c3aed', background: '#f5f3ff', padding: '4px 10px', borderRadius: '20px' }}>VIPs</span>
          </div>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>Clientes com maior gasto</p>
          <h2 style={{ margin: '4px 0 0', fontSize: '2rem', fontWeight: '800' }}>{topSpenders}</h2>
        </div>
        
        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ padding: '10px', background: '#fefce8', color: '#eab308', borderRadius: '12px' }}><Star size={20} /></div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ca8a04', background: '#fefce8', padding: '4px 10px', borderRadius: '20px' }}>NPS</span>
          </div>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>Nota Média de Avaliação</p>
          <h2 style={{ margin: '4px 0 0', fontSize: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {averageRating.toFixed(1)} <Star size={24} fill="#eab308" color="#eab308" />
          </h2>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
        <button 
          onClick={() => setActiveTab('crm')}
          style={{ padding: '10px 20px', border: 'none', background: activeTab === 'crm' ? '#0f172a' : 'transparent', color: activeTab === 'crm' ? 'white' : '#64748b', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Users size={18} /> Base de Clientes (CRM)
        </button>
        <button 
          onClick={() => setActiveTab('reviews')}
          style={{ padding: '10px 20px', border: 'none', background: activeTab === 'reviews' ? '#0f172a' : 'transparent', color: activeTab === 'reviews' ? 'white' : '#64748b', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Star size={18} /> Avaliações ({reviews.length})
        </button>
      </div>

      {activeTab === 'crm' ? (
        <div className="fade-in" style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Buscar por nome ou WhatsApp..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button 
                onClick={() => setFilterAbsent(!filterAbsent)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', border: filterAbsent ? '1px solid #dc2626' : '1px solid #e2e8f0', background: filterAbsent ? '#fef2f2' : 'white', color: filterAbsent ? '#dc2626' : '#64748b', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <Filter size={16} /> 
                Ausentes +30 dias
              </button>
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>
                Exibindo {filteredCustomers.length} clientes
              </div>
            </div>
          </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            <p style={{ color: '#64748b' }}>Analisando base de clientes...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
            <div style={{ width: '64px', height: '64px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
              <Users size={32} color="#cbd5e1" />
            </div>
            <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>Nenhum cliente encontrado</h3>
            <p style={{ color: '#64748b', maxWidth: '300px', margin: '0 auto' }}>Os clientes aparecerão aqui assim que realizarem o primeiro pedido na sua loja.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>
                  <th style={{ padding: '16px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Cliente</th>
                  <th style={{ padding: '16px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Pedidos</th>
                  <th style={{ padding: '16px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Total Gasto</th>
                  <th style={{ padding: '16px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Último Pedido</th>
                  <th style={{ padding: '16px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', textAlign: 'right' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.phone} className="customer-row" style={{ borderBottom: '1px solid #f8fafc', transition: 'all 0.2s' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--brand-red)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1rem' }}>
                          {customer.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: '#1e293b' }}>{customer.full_name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MessageCircle size={12} /> {customer.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.9rem', fontWeight: '600' }}>
                        <ShoppingBag size={14} /> {customer.total_orders} pedidos
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ color: '#10b981', fontWeight: '800', fontSize: '1rem' }}>
                        R$ {customer.total_spent.toFixed(2)}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.85rem' }}>
                        <Clock size={14} /> {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString('pt-BR') : 'N/A'}
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      {filterAbsent ? (
                        <a 
                          href={`https://wa.me/55${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${customer.full_name}, sentimos sua falta! Preparamos um cupom especial de 10% OFF para o seu próximo pedido conosco: VOLTA10. Acesse nosso cardápio e faça seu pedido!`)}`} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: 'var(--brand-red)', color: 'white', borderRadius: '10px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700', transition: 'all 0.2s' }}
                        >
                          <Megaphone size={14} /> Recuperar Cliente
                        </a>
                      ) : (
                        <a 
                          href={`https://wa.me/55${customer.phone.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: '#f0fdf4', color: '#16a34a', borderRadius: '10px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700', transition: 'all 0.2s' }}
                        >
                          WhatsApp <ArrowUpRight size={14} />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      ) : (
        <div className="fade-in" style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageCircle size={20} color="#64748b" /> Feedbacks Recentes
          </h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Carregando avaliações...</div>
          ) : reviews.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #e2e8f0', color: '#64748b' }}>
               Ainda não há avaliações de clientes.
             </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviews.map((review) => {
                const customer = customers.find(c => c.phone === review.customer_phone);
                return (
                  <div key={review.id} style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', background: '#3b82f6', color: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                           {customer?.full_name ? customer.full_name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: '#1e293b' }}>{customer?.full_name || 'Cliente'}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{review.customer_phone}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} size={16} fill={star <= review.rating ? '#eab308' : 'transparent'} color={star <= review.rating ? '#eab308' : '#cbd5e1'} />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <div style={{ background: 'white', padding: '16px', borderRadius: '12px', color: '#334155', fontStyle: 'italic', borderLeft: '4px solid #e2e8f0' }}>
                        "{review.comment}"
                      </div>
                    )}
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'right' }}>
                      {new Date(review.created_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .customer-row:hover { background-color: #f8fafc; }
        .customer-row:hover .customer-avatar { transform: scale(1.1); }
      `}} />
    </div>
  );
}
