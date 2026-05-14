import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Clock, Package, Truck, CheckCircle, ArrowLeft, MessageCircle, XCircle, Star } from 'lucide-react';
import './OrderTracking.css';

interface Order {
  id: string;
  store_id: string;
  status: string;
  customer_name: string;
  customer_phone: string;
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
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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

  useEffect(() => {
    // Check if review was already submitted when order is loaded
    async function checkExistingReview() {
      if (order && order.status === 'delivered') {
        const { data } = await supabase
          .from('order_reviews')
          .select('id')
          .eq('order_id', order.id)
          .maybeSingle();
        if (data) {
          setReviewSubmitted(true);
        }
      }
    }
    checkExistingReview();
  }, [order]);

  const submitReview = async () => {
    if (rating === 0 || !order) return;
    setIsSubmittingReview(true);
    try {
      const { error } = await supabase.from('order_reviews').insert({
        store_id: order.store_id,
        order_id: order.id,
        customer_phone: order.customer_phone || 'unknown',
        rating,
        comment
      });
      if (error) throw error;
      setReviewSubmitted(true);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) return <div className="tracking-loading">Carregando status do pedido...</div>;
  if (!order) return <div className="tracking-error">Pedido não encontrado.</div>;

  const steps = [
    { id: 'pending', label: 'Recebido', icon: <Clock />, desc: 'Aguardando confirmação da loja' },
    { id: 'confirmed', label: 'Confirmado', icon: <CheckCircle />, desc: 'Loja confirmou seu pedido' },
    { id: 'preparing', label: 'Em Preparo', icon: <Package />, desc: 'Seu pedido está sendo preparado' },
    { id: 'ready', label: 'Saiu para Entrega', icon: <Truck />, desc: 'O motoboy já está a caminho' },
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
        
        {order.status === 'delivered' && (
          <div className="review-section" style={{ marginTop: '32px', background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            {reviewSubmitted ? (
              <div>
                <div style={{ color: '#10b981', marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                  <CheckCircle size={40} />
                </div>
                <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>Obrigado pelo feedback!</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Sua avaliação ajuda a loja a melhorar sempre.</p>
              </div>
            ) : (
              <div>
                <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>Como foi seu pedido?</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 16px' }}>Toque nas estrelas para avaliar a qualidade e entrega.</p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', transition: 'transform 0.1s' }}
                      className={(hoveredRating || rating) >= star ? 'star-active' : ''}
                    >
                      <Star 
                        size={32} 
                        fill={(hoveredRating || rating) >= star ? '#f59e0b' : 'transparent'} 
                        color={(hoveredRating || rating) >= star ? '#f59e0b' : '#cbd5e1'} 
                        style={{ transform: (hoveredRating || rating) === star ? 'scale(1.1)' : 'scale(1)' }}
                      />
                    </button>
                  ))}
                </div>

                {rating > 0 && (
                  <div style={{ animation: 'fadeIn 0.3s' }}>
                    <textarea 
                      placeholder="Deixe um comentário (opcional)..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                    />
                    <button 
                      onClick={submitReview}
                      disabled={isSubmittingReview}
                      style={{ width: '100%', padding: '14px', background: 'var(--brand-red, #dc2626)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', opacity: isSubmittingReview ? 0.7 : 1 }}
                    >
                      {isSubmittingReview ? 'Enviando...' : 'Enviar Avaliação'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="tracking-footer">
        <p>Desenvolvido por <strong>Anotô</strong></p>
      </footer>
    </div>
  );
}
