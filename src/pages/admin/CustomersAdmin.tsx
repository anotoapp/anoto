import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { AdminContextType } from './AdminLayout';
import { 
  Users, 
  Search, 
  MessageCircle, 
  ShoppingBag, 
  Clock
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

  useEffect(() => {
    if (store?.id) {
      fetchCustomers();
    }
  }, [store?.id]);

  async function fetchCustomers() {
    if (!store?.id) return;
    try {

      setLoading(true);
      
      // 1. Fetch all orders from this store to identify customers
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('customer_phone, total, created_at')
        .eq('store_id', store.id);

      if (ordersError) throw ordersError;

      // 2. Fetch all customer profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('customers')
        .select('*');

      if (profilesError) throw profilesError;

      // 3. Aggregate data
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
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredCustomers = customers.filter(c => 
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const totalCustomers = customers.length;
  const avgLTV = totalCustomers > 0 ? customers.reduce((acc, c) => acc + c.total_spent, 0) / totalCustomers : 0;

  return (
    <div className="admin-page fade-in">
      <header className="admin-header">
        <div>
          <h1>Gestão de Clientes</h1>
          <p>Acompanhe o comportamento e fidelidade dos seus clientes.</p>
        </div>
        <div className="header-stats">
          <div className="mini-stat">
            <span className="stat-label">Total de Clientes</span>
            <span className="stat-value">{totalCustomers}</span>
          </div>
          <div className="mini-stat">
            <span className="stat-label">Ticket Médio (LTV)</span>
            <span className="stat-value">R$ {avgLTV.toFixed(2)}</span>
          </div>
        </div>
      </header>

      <div className="admin-actions">
        <div className="search-bar">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou WhatsApp..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="customers-grid">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Analisando base de clientes...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <p>Nenhum cliente encontrado.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Contato</th>
                  <th>Pedidos</th>
                  <th>Total Gasto</th>
                  <th>Última Compra</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.phone}>
                    <td>
                      <div className="customer-info-cell">
                        <div className="customer-avatar">
                          {customer.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="customer-name">{customer.full_name}</div>
                          <div className="customer-subtext">{customer.neighborhood}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="phone-cell">
                        <MessageCircle size={14} />
                        {customer.phone}
                      </div>
                    </td>
                    <td>
                      <div className="stats-cell">
                        <ShoppingBag size={14} />
                        {customer.total_orders} pedidos
                      </div>
                    </td>
                    <td>
                      <div className="ltv-cell">
                        <strong>R$ {customer.total_spent.toFixed(2)}</strong>
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <Clock size={14} />
                        {customer.last_order_date 
                          ? new Date(customer.last_order_date).toLocaleDateString('pt-BR') 
                          : 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <a 
                          href={`https://wa.me/55${customer.phone.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn-icon-link"
                          title="Falar no WhatsApp"
                        >
                          <MessageCircle size={18} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .customer-info-cell { display: flex; align-items: center; gap: 12px; }
        .customer-avatar {
          width: 36px;
          height: 36px;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.9rem;
        }
        .customer-name { font-weight: 700; color: #1e293b; }
        .customer-subtext { font-size: 0.75rem; color: #64748b; }
        .phone-cell, .stats-cell, .date-cell { 
          display: flex; 
          align-items: center; 
          gap: 6px; 
          font-size: 0.9rem; 
          color: #475569;
        }
        .ltv-cell { color: #10b981; font-size: 1rem; }
        .btn-icon-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #f0fdf4;
          color: #16a34a;
          transition: all 0.2s;
        }
        .btn-icon-link:hover {
          background: #16a34a;
          color: white;
          transform: translateY(-2px);
        }
        .header-stats { display: flex; gap: 24px; }
        .mini-stat { display: flex; flex-direction: column; align-items: flex-end; }
        .stat-label { font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase; }
        .stat-value { font-size: 1.25rem; font-weight: 800; color: #0f172a; }
      `}} />
    </div>
  );
}
