import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Clock, CheckCircle, Package, XCircle } from 'lucide-react';
import './Admin.css'; // Garantindo os estilos

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
}

export default function OrdersDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    let channel: any;

    async function initialize() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Primeiro pega a loja do dono
      const { data: storeData } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', session.user.id)
        .single();

      if (storeData) {
        setStoreId(storeData.id);
        fetchOrders(storeData.id);

        // Subscribe to realtime changes APENAS para esta loja
        channel = supabase
          .channel('public:orders')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders', filter: `store_id=eq.${storeData.id}` },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                setOrders(current => [payload.new as Order, ...current]);
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
      } else {
        setLoading(false);
      }
    }

    initialize();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  async function fetchOrders(storeId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <div className="orders-dashboard fade-in">
      <header className="dashboard-header" style={{ marginBottom: '32px' }}>
        <h1>Fila de Pedidos</h1>
        <p>Gerencie e acompanhe os pedidos em tempo real</p>
      </header>

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
                  <button onClick={() => updateOrderStatus(order.id, 'delivered')} style={{ width: '100%', padding: '10px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}>
                    Despachar / Concluir
                  </button>
                )}
                {/* Entregue ou Cancelado não tem ações principais */}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
