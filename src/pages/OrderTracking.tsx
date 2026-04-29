import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Clock, Package, Truck, CheckCircle, ArrowLeft, MessageCircle, XCircle } from 'lucide-react';
import './OrderTracking.css';

interface Order {
  id: string;
  status: string;
  customer_name: string;
  total: number;
  created_at: string;
  order_type: string;
  store: {
    name: string;
    whatsapp_number: string;
    logo: string;
  };
}

export default function OrderTracking() {
  const { storeSlug, orderId } = useParams<{ storeSlug: string; orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            store:stores(name, whatsapp_number, logo)
          `)
          .eq('id', orderId)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();

    // Realtime para atualizar o status automaticamente na tela do cliente
    const channel = supabase
      .channel(`order-status-${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => {
          setOrder(current => current ? { ...current, status: payload.new.status } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  if (loading) return <div className="tracking-loading">Carregando status do pedido...</div>;
  if (!order) return <div className="tracking-error">Pedido não encontrado.</div>;

  const steps = [
    { id: 'pending', label: 'Recebido', icon: <Clock />, desc: 'Aguardando confirmação da loja' },
    { id: 'preparing', label: 'Em Preparo', icon: <Package />, desc: 'Seu pedido está sendo preparado' },
    { id: 'delivering', label: 'Saiu para Entrega', icon: <Truck />, desc: 'O motoboy já está a caminho' },
    { id: 'delivered', label: 'Entregue', icon: <CheckCircle />, desc: 'Bom apetite!' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="tracking-container fade-in">
      <header className="tracking-header">
        <Link to={`/${storeSlug}`} className="back-button">
          <ArrowLeft size={20} />
        </Link>
        <img src={order.store.logo} alt={order.store.name} className="tracking-logo" />
        <h1>{order.store.name}</h1>
      </header>

      <main className="tracking-content">
        <div className="order-brief">
          <p className="order-number">Pedido #{order.id.slice(0, 5).toUpperCase()}</p>
          <div className="total-badge">R$ {order.total.toFixed(2)}</div>
        </div>

        {isCancelled ? (
          <div className="cancelled-card">
            <XCircle size={48} color="#ef4444" />
            <h2>Pedido Cancelado</h2>
            <p>Infelizmente a loja não pôde atender seu pedido neste momento.</p>
          </div>
        ) : (
          <div className="status-timeline">
            {steps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={step.id} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                  <div className="step-icon">
                    {step.icon}
                  </div>
                  <div className="step-info">
                    <h3>{step.label}</h3>
                    <p>{step.desc}</p>
                  </div>
                  {index < steps.length - 1 && <div className="step-connector" />}
                </div>
              );
            })}
          </div>
        )}

        <div className="tracking-actions">
          <a 
            href={`https://wa.me/${order.store.whatsapp_number}?text=Olá! Gostaria de saber sobre meu pedido #${order.id.slice(0, 5).toUpperCase()}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="contact-store"
          >
            <MessageCircle size={20} /> Falar com a loja
          </a>
        </div>
      </main>

      <footer className="tracking-footer">
        <p>Desenvolvido por <strong>Anotô</strong></p>
      </footer>
    </div>
  );
}
