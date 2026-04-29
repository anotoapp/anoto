import { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { AdminContextType } from './AdminLayout';
import { Clock, CheckCircle, Package, XCircle, Printer, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';
import './Admin.css';

interface OrderItem {
  quantity: number;
  price: number;
  notes?: string;
  product?: { name: string };
}

interface Order {
  id: string;
  store_id: string;
  customer_name: string;
  customer_address: string;
  payment_method: string;
  order_type: string;
  total: number;
  status: string;
  created_at: string;
  items?: OrderItem[];
}

export default function OrdersDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('ANOTÔ');
  const [soundEnabled, setSoundEnabled] = useState(false);

  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.error("Erro ao tocar som:", e));
  }, [soundEnabled]);

  async function fetchOrders(sid: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(name)
          )
        `)
        .eq('store_id', sid)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }

  const { store } = useOutletContext<AdminContextType>();

  useEffect(() => {
    let channel: RealtimeChannel | undefined;

    async function initialize() {
      if (!store) return;
      
      try {
        setStoreId(store.id);
        setStoreName(store.name);
        await fetchOrders(store.id);

        channel = supabase
          .channel(`public:orders:${store.id}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders', filter: `store_id=eq.${store.id}` },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                setOrders(current => [payload.new as Order, ...current]);
                playNotificationSound();
              } else if (payload.eventType === 'UPDATE') {
                setOrders(current =>
                  current.map(order =>
                    order.id === payload.new.id ? (payload.new as Order) : order
                  )
                );
              }
            }
          )
          .subscribe();
      } catch (error) {
        console.error('Error initializing orders dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    initialize();
    
    const timeout = setTimeout(() => setLoading(false), 3000);
    
    return () => {
      if (channel) supabase.removeChannel(channel);
      clearTimeout(timeout);
    };
  }, [store, playNotificationSound]);


  const handlePrint = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = order.items?.map(item => `
      <div style="border-bottom: 1px solid #eee; padding: 5px 0;">
        <div style="display: flex; justify-content: space-between; font-weight: bold;">
          <span>${item.quantity}x ${item.product?.name || 'Produto'}</span>
          <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
        </div>
        ${item.notes ? `<div style="font-size: 11px; margin-top: 2px;">>> OBS: ${item.notes}</div>` : ''}
      </div>
    `).join('') || 'Nenhum item';

    printWindow.document.write(`
      <html>
        <head>
          <title>Pedido #${order.id.slice(0, 4)}</title>
          <style>
            @page { margin: 0; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              width: 280px; 
              margin: 0; 
              padding: 10px;
              color: #000;
              line-height: 1.2;
            }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
            .info { font-size: 13px; margin-bottom: 10px; }
            .total { font-weight: bold; font-size: 18px; border-top: 2px solid #000; margin-top: 10px; padding-top: 5px; display: flex; justify-content: space-between; }
            .footer { margin-top: 20px; text-align: center; font-size: 11px; font-style: italic; }
            h2 { margin: 0; text-transform: uppercase; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="header">
            <h2>${storeName}</h2>
            <div style="font-size: 14px; margin-top: 5px;">PEDIDO #${order.id.slice(0, 4).toUpperCase()}</div>
            <div style="font-size: 11px;">${new Date(order.created_at).toLocaleString('pt-BR')}</div>
          </div>
          
          <div class="info">
            <strong>CLIENTE:</strong> ${order.customer_name}<br>
            <strong>TIPO:</strong> ${order.order_type === 'delivery' ? 'ENTREGA 🛵' : 'RETIRADA 🥡'}<br>
            ${order.order_type === 'delivery' ? `<strong>ENDEREÇO:</strong> ${order.customer_address}` : ''}
            <br><strong>PAGAMENTO:</strong> ${order.payment_method}
          </div>

          <div style="border-top: 1px solid #000; padding-top: 5px;">
            ${itemsHtml}
          </div>

          <div class="total">
            <span>TOTAL</span>
            <span>R$ ${order.total.toFixed(2)}</span>
          </div>

          <div class="footer">
            --- Impresso via ANOTÔ ---
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  async function updateOrderStatus(id: string, newStatus: string) {
    try {
      // Optimistic update para UI mais rápida
      setOrders(current => current.map(o => o.id === id ? { ...o, status: newStatus } : o));

      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erro ao atualizar status do pedido');
      // Em caso de erro, seria ideal fazer rollback do optimistic update
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span style={{ background: '#fff3cd', color: '#856404', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> Pendente</span>;
      case 'preparing': return <span style={{ background: '#cce5ff', color: '#004085', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Package size={12}/> Preparando</span>;
      case 'delivered': return <span style={{ background: '#d4edda', color: '#155724', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12}/> Entregue</span>;
      case 'cancelled': return <span style={{ background: '#f8d7da', color: '#721c24', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><XCircle size={12}/> Cancelado</span>;
      default: return <span>{status}</span>;
    }
  };

  if (loading) return <div className="p-4">Carregando painel de pedidos...</div>;
  if (!storeId) return <div className="p-4">Por favor, configure sua loja antes de ver os pedidos.</div>;

  // Sem estatísticas não utilizadas no momento

  const todayOrders = orders.filter(o => {
    const today = new Date().toISOString().split('T')[0];
    return o.created_at.split('T')[0] === today && o.status !== 'cancelled';
  });

  const todayRevenue = todayOrders.reduce((acc, o) => acc + o.total, 0);
  const avgTicket = todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;

  return (
    <div className="orders-dashboard fade-in">
      <header className="dashboard-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Fila de Pedidos</h1>
          <p>Gerencie e acompanhe os pedidos em tempo real</p>
        </div>
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          style={{
            padding: '10px 20px',
            background: soundEnabled ? '#e8f5e9' : '#f5f5f5',
            color: soundEnabled ? '#2e7d32' : '#666',
            border: `1px solid ${soundEnabled ? '#2e7d32' : '#ddd'}`,
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {soundEnabled ? '🔔 Alerta Ativo' : '🔕 Ativar Alerta'}
        </button>
      </header>

      {/* Métricas do Dia */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#eef2ff', color: '#4f46e5', padding: '12px', borderRadius: '10px' }}><DollarSign size={24} /></div>
          <div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Faturamento Hoje</p>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>R$ {todayRevenue.toFixed(2)}</h2>
          </div>
        </div>
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px', borderRadius: '10px' }}><ShoppingBag size={24} /></div>
          <div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Pedidos Hoje</p>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>{todayOrders.length}</h2>
          </div>
        </div>
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#fff7ed', color: '#ea580c', padding: '12px', borderRadius: '10px' }}><TrendingUp size={24} /></div>
          <div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Ticket Médio</p>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>R$ {avgTicket.toFixed(2)}</h2>
          </div>
        </div>
      </div>

      <div className="orders-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {orders.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', background: '#fff', padding: '60px', borderRadius: '12px', textAlign: 'center', color: '#888', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px dashed #ddd' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
            <p style={{ margin: 0, fontSize: '1.1rem' }}>Nenhum pedido recebido ainda.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Divulgue seu link para começar a vender!</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>{order.customer_name}</h3>
                {getStatusBadge(order.status)}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.95rem', color: '#555', marginBottom: '20px', flex: 1 }}>
                <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px', marginBottom: '8px' }}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: '600', fontSize: '0.85rem', color: '#888', textTransform: 'uppercase' }}>Itens do Pedido</p>
                  {order.items?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#333' }}>
                      <span>{item.quantity}x {item.product?.name}</span>
                      <span style={{ fontWeight: '500' }}>R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <p style={{ margin: 0 }}><strong>Tipo:</strong> {order.order_type === 'delivery' ? 'Entrega' : 'Retirada'}</p>
                {order.order_type === 'delivery' && <p style={{ margin: 0 }}><strong>Endereço:</strong> {order.customer_address}</p>}
                <p style={{ margin: 0 }}><strong>Pagamento:</strong> {order.payment_method}</p>
                <p style={{ margin: 0, fontSize: '1.1rem', color: '#212121', marginTop: '8px' }}><strong>Total:</strong> R$ {order.total.toFixed(2)}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#999', marginTop: '4px' }}><Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> {new Date(order.created_at).toLocaleTimeString()}</p>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                {order.status === 'pending' && (
                  <>
                    <button onClick={() => updateOrderStatus(order.id, 'preparing')} style={{ flex: 1, padding: '10px', background: '#2962ff', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}>
                      Aceitar
                    </button>
                    <button onClick={() => updateOrderStatus(order.id, 'cancelled')} style={{ padding: '10px', background: '#f5f5f5', color: '#d32f2f', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}>
                      Recusar
                    </button>
                  </>
                )}
                {order.status === 'preparing' && (
                  <button onClick={() => updateOrderStatus(order.id, 'delivered')} style={{ flex: 1, padding: '10px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}>
                    Finalizar
                  </button>
                )}
                <button 
                  onClick={() => handlePrint(order)} 
                  style={{ padding: '10px', background: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="Imprimir Comanda"
                >
                  <Printer size={18} />
                </button>
                {/* Entregue ou Cancelado não tem ações principais */}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
