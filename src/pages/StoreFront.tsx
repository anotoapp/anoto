import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Award } from 'lucide-react';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { CartDrawer } from '../components/CartDrawer';
import { BottomNav } from '../components/BottomNav';
import { ConversionBoosters } from '../components/ConversionBoosters';
import { supabase } from '../lib/supabase';
import type { Product, CartItem, ProductOption, RestaurantConfig, CustomerProfile } from '../types';
import { formatWhatsAppMessage } from '../utils/whatsapp';
import { isStoreOpen } from '../utils/storeStatus';
import { CategoryNav } from '../components/CategoryNav';
import { Toast, type ToastType } from '../components/Toast';
import { FloatingCart } from '../components/FloatingCart';
import '../App.css';

interface StoreFrontProps {
  customSlug?: string;
}

function StoreFront({ customSlug }: StoreFrontProps) {
  const { storeSlug: paramSlug } = useParams<{ storeSlug?: string }>();
  const storeSlug = customSlug || paramSlug;

  const navigate = useNavigate();
  const [config, setConfig] = useState<RestaurantConfig | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [activeTab, setActiveTab] = useState('inicio');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isCategoryNavFixed, setIsCategoryNavFixed] = useState(false);
  const NAV_HEIGHT = 52; // px — must match CategoryNav padding+content
  const HEADER_THRESHOLD = 300; // scroll px before the nav sticks

  // Ref to track observer and avoid re-creating every render
  const observerRef = useRef<IntersectionObserver | null>(null);
  // Prevent observer from overriding a user click for a brief window
  const scrollingByClick = useRef(false);

  useEffect(() => {
    const savedCustomer = localStorage.getItem('anoto_customer');
    if (savedCustomer) {
      setTimeout(() => {
        try {
          setCustomer(JSON.parse(savedCustomer));
        } catch {
          console.error('Error parsing customer from local storage');
        }
      }, 0);
    }

    async function loadData() {
      try {
        let storeQuery = supabase.from('stores').select('*');
        if (storeSlug) {
          storeQuery = storeQuery.eq('slug', storeSlug);
        } else {
          storeQuery = storeQuery.limit(1);
        }

        const { data: storeData, error: storeError } = await storeQuery.single();
        if (storeError) throw storeError;

        const { data: categoriesData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .eq('store_id', storeData.id);
        if (catError) throw catError;

        const { data: productsData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .in('category_id', categoriesData.map(c => c.id));
        if (prodError) throw prodError;

        let parsedHours = null;
        if (storeData.opening_hours) {
          try {
            parsedHours = typeof storeData.opening_hours === 'string'
              ? JSON.parse(storeData.opening_hours)
              : storeData.opening_hours;
          } catch (e) {
            console.error('Error parsing hours:', e);
          }
        }

        const loadedConfig: RestaurantConfig = {
          id: storeData.id,
          name: storeData.name,
          logo: storeData.logo,
          banner: storeData.banner,
          whatsappNumber: storeData.whatsapp_number,
          address: storeData.address,
          deliveryFee: storeData.delivery_fee,
          minOrder: storeData.min_order,
          is_open_manual: storeData.is_open_manual,
          opening_hours: parsedHours,
          theme: storeData.theme || {},
          categories: categoriesData,
          products: productsData.map(p => ({ ...p, category: p.category_id })),
          subscription_status: storeData.subscription_status,
          loyalty_enabled: storeData.loyalty_enabled,
          points_per_real: storeData.points_per_real || 1,
          points_redeem_ratio: storeData.points_redeem_ratio || 0.05
        };

        setConfig(loadedConfig);
        if (categoriesData.length > 0) setActiveCategory(categoriesData[0].id);
        document.title = loadedConfig.name;

        // Verificar expiração na vitrine
        if (storeData.subscription_status === 'expired') {
          setError('Esta loja está temporariamente fora do ar por questões de manutenção na assinatura. Por favor, tente novamente mais tarde.');
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Não foi possível carregar os dados da loja.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [storeSlug]);

  // ─── Scroll listener: fix CategoryNav when header scrolls off screen ────────
  useEffect(() => {
    const handleScroll = () => {
      setIsCategoryNavFixed(window.scrollY > HEADER_THRESHOLD);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ─── IntersectionObserver: update activeCategory as the user scrolls ───────
  useEffect(() => {
    if (!config || activeTab !== 'inicio') return;

    // Slight delay so that all category sections are already painted
    const timer = setTimeout(() => {
      if (observerRef.current) observerRef.current.disconnect();

      const navOffset = isCategoryNavFixed ? `-${NAV_HEIGHT + 8}px` : '-8px';
      const options: IntersectionObserverInit = {
        root: null,
        // Compensate for fixed category nav when it's active
        rootMargin: `${navOffset} 0px -65% 0px`,
        threshold: 0,
      };

      observerRef.current = new IntersectionObserver((entries) => {
        if (scrollingByClick.current) return; // ignore while user-initiated scroll is running

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const catId = (entry.target as HTMLElement).dataset.categoryId;
            if (catId) {
              setActiveCategory(catId);
            }
          }
        });
      }, options);

      config.categories.forEach((cat) => {
        const section = document.getElementById(`cat-section-${cat.id}`);
        if (section) observerRef.current!.observe(section);
      });
    }, 300);

    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, [config, activeTab, isCategoryNavFixed]);

  // Handle category chip click: disable observer briefly, then re-enable
  const handleCategoryChange = useCallback((catId: string) => {
    scrollingByClick.current = true;
    setActiveCategory(catId);
    setTimeout(() => {
      scrollingByClick.current = false;
    }, 900); // ~same duration as the CSS smooth scroll
  }, []);

  // Load orders when Pedidos tab is active
  useEffect(() => {
    if (activeTab === 'pedidos' && customer?.phone) {
      async function loadOrders() {
        setLoadingOrders(true);
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*, products(*))')
            .eq('customer_phone', customer?.phone)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setOrders(data || []);
        } catch (err) {
          console.error('Error loading orders:', err);
        } finally {
          setLoadingOrders(false);
        }
      }
      loadOrders();
    }
  }, [activeTab, customer?.phone]);

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('anoto_customer', JSON.stringify(customer));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleAddToCart = (quantity: number, selectedOptions: ProductOption[], notes: string) => {
    if (selectedProduct) {
      setCart([...cart, { product: selectedProduct, quantity, selectedOptions, notes }]);
      setSelectedProduct(null);
      setToast({ message: `${selectedProduct.name} adicionado ao carrinho!`, type: 'success' });
    }
  };

  const handleRemoveFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const handleCheckout = async (customerInfo: { 
    name: string; 
    phone: string; 
    address: string; 
    neighborhood?: string; 
    payment: string; 
    type: 'delivery' | 'pickup';
    couponCode?: string;
    discountAmount?: number;
    subtotal?: number;
    redeemedPoints?: number;
  }) => {
    if (!config || !config.id) return;
    try {
      // Re-calculate precisely to avoid discrepancies
      const deliveryFeeValue = customerInfo.type === 'delivery' 
        ? (config.id ? (await supabase.from('delivery_fees').select('fee').eq('store_id', config.id).eq('neighborhood', customerInfo.neighborhood || '').single()).data?.fee || config.deliveryFee || 0 : config.deliveryFee || 0)
        : 0;

      const total = (customerInfo.subtotal || 0) - (customerInfo.discountAmount || 0) + deliveryFeeValue;

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          store_id: config.id,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone || '(00) 0000-0000',
          customer_address: `${customerInfo.address}${customerInfo.neighborhood ? ` - Bairro: ${customerInfo.neighborhood}` : ''}`,
          payment_method: customerInfo.payment,
          order_type: customerInfo.type,
          subtotal: customerInfo.subtotal,
          discount_amount: customerInfo.discountAmount,
          coupon_code: customerInfo.couponCode,
          redeemed_points: customerInfo.redeemedPoints || 0,
          total: total,
          status: 'pending'
        })
        .select().single();

      if (orderError) throw orderError;

      // Increment coupon usage if applicable
      if (customerInfo.couponCode) {
        await supabase.rpc('increment_coupon_uses', { 
          p_store_id: config.id, 
          p_code: customerInfo.couponCode 
        });
      }

      // Deduct loyalty points if used
      if (customerInfo.redeemedPoints && customerInfo.redeemedPoints > 0 && customer?.id) {
        const newPoints = Math.max(0, (customer.loyalty_points || 0) - customerInfo.redeemedPoints);
        await supabase.from('customers').update({ loyalty_points: newPoints }).eq('id', customer.id);
        
        // Log transaction
        await supabase.from('loyalty_transactions').insert({
          store_id: config.id,
          customer_id: customer.id,
          order_id: orderData.id,
          points_change: -customerInfo.redeemedPoints,
          type: 'redeem',
          description: `Resgate de pontos no pedido #${orderData.id.slice(0,5).toUpperCase()}`
        });

        // Update local state
        setCustomer({ ...customer, loyalty_points: newPoints });
        localStorage.setItem('anoto_customer', JSON.stringify({ ...customer, loyalty_points: newPoints }));
      }

      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price + item.selectedOptions.reduce((sum, o) => sum + o.price, 0),
        notes: item.notes || ''
      }));

      await supabase.from('order_items').insert(orderItems);
      setCart([]);
      setIsCartOpen(false);
      window.open(formatWhatsAppMessage(cart, customerInfo, config, orderData.id, storeSlug), '_blank');
      navigate(`/${storeSlug}/order/${orderData.id}`);
    } catch (error: any) {
      console.error('Erro ao salvar pedido:', error);
      alert('Houve um erro ao processar seu pedido. Detalhe: ' + (error.message || JSON.stringify(error)));
    }
  };

  if (loading) return <div className="app-loading"><div className="spinner"></div></div>;
  if (error || !config) return <div className="app-error"><h2>{error || 'Loja não encontrada'}</h2></div>;

  const storeStatus = isStoreOpen(config);
  const isOpen = storeStatus.isOpen;

  // Filtered products for search mode (flat, all categories)
  const allFilteredProducts = searchQuery
    ? config.products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="app" style={{ paddingBottom: '90px', background: '#f8f9fa', minHeight: '100vh' }}>
      <Header
        config={config}
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        isOpen={isOpen}
      />



      <main className="container" style={{ marginTop: '0', paddingTop: '0' }}>
        {activeTab === 'inicio' && (
          <>
            <div className="search-container" style={{ marginBottom: '4px' }}>
              <div className="search-wrapper">
                <input
                  type="text"
                  placeholder="O que você está procurando?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            {/* ── Category Chips (Entre busca e destaques) ─ */}
            {activeTab === 'inicio' && !searchQuery && (
              <CategoryNav
                categories={config.categories}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
                isFixed={isCategoryNavFixed}
                navHeight={NAV_HEIGHT}
              />
            )}

            {/* ── Featured Products Carousel (usa is_featured do banco) ── */}
            {!searchQuery && (() => {
              const featured = config.products.filter(p => p.is_featured);
              const items = featured.length > 0 ? featured : config.products.slice(0, 6);
              if (items.length === 0) return null;
              return (
                <section className="featured-section">
                  <div className="section-header-compact">
                    <h2 className="section-title-compact">🔥 Destaques da Casa</h2>
                    {featured.length > 0 && (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                        {featured.length} em destaque
                      </span>
                    )}
                  </div>
                  <div className="featured-carousel">
                    {items.map(product => (
                      <div key={`featured-${product.id}`} className="featured-item" onClick={() => setSelectedProduct(product)}>
                        <div className="featured-img-container">
                          {product.image
                            ? <img src={product.image} alt={product.name} />
                            : <div className="featured-img-placeholder">🍽️</div>
                          }
                          <div className="featured-price-tag">R$ {product.price.toFixed(2)}</div>
                          {product.is_featured && (
                            <div className="featured-badge">⭐ Destaque</div>
                          )}
                        </div>
                        <div className="featured-info">
                          <h3>{product.name}</h3>
                          <p className="featured-desc">{product.description?.slice(0, 45)}{product.description && product.description.length > 45 ? '...' : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })()}

            {/* ── Search Results ──────────────────────────────────────── */}
            {searchQuery && (
              <section className="main-products fade-in">
                <h2 className="section-title">Resultados para "{searchQuery}"</h2>
                <div className="products-list-vertical">
                  {allFilteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} layout="list" onAdd={() => setSelectedProduct(product)} />
                  ))}
                  {allFilteredProducts.length === 0 && (
                    <div className="empty-state"><p>Nenhum produto encontrado.</p></div>
                  )}
                </div>
              </section>
            )}

            {/* ── Category sections (vertical list, IntersectionObserver tracks them) ─ */}
            {!searchQuery && config.categories.map((category) => {
              const categoryProducts = config.products.filter(p => p.category_id === category.id);
              if (categoryProducts.length === 0) return null;
              return (
                <section
                  key={category.id}
                  id={`cat-section-${category.id}`}
                  data-category-id={category.id}
                  className="category-section"
                  style={{ marginTop: '50px' }}
                >
                  <div className="category-section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0', paddingBottom: '0', border: 'none' }}>
                    <h2 className="section-title category-section-title">
                      {category.name}
                    </h2>
                    <span className="category-count">{categoryProducts.length} itens</span>
                  </div>
                  <div className="products-list-vertical">
                    {categoryProducts.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        layout="list"
                        onAdd={() => setSelectedProduct(product)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        )}

        {activeTab === 'promocoes' && (
          <section className="promo-section fade-in">
            <h2 className="section-title">Ofertas do Dia 🔥</h2>
            <div className="products-list-vertical">
              {config.products
                .filter(p => p.price < 30)
                .map(product => (
                  <ProductCard key={`p-${product.id}`} product={product} layout="list" onAdd={() => setSelectedProduct(product)} />
                ))}
              {config.products.filter(p => p.price < 30).length === 0 && (
                <div className="empty-state"><p>Não há promoções ativas no momento.</p></div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'pedidos' && (
          <section className="orders-section fade-in">
            <h2 className="section-title">Meus Pedidos</h2>
            {loadingOrders ? (
              <div className="skeleton-loader">Carregando pedidos...</div>
            ) : orders.length > 0 ? (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.id} className="order-summary-card" onClick={() => navigate(`/${storeSlug}/order/${order.id}`)}>
                    <div className="order-header">
                      <span className="order-date">{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                      <span className={`order-status-badge ${order.status}`}>{order.status}</span>
                    </div>
                    <div className="order-items-preview">
                      {order.order_items?.map((item: any) => item.products?.name).join(', ')}
                    </div>
                    <div className="order-footer">
                      <span className="order-total">R$ {order.total.toFixed(2)}</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state"><p>Você ainda não fez nenhum pedido.</p></div>
            )}
          </section>
        )}

        {activeTab === 'perfil' && (
          <section className="profile-section fade-in">
            {/* Avatar */}
            <div className="profile-avatar-block">
              <div className="profile-avatar">
                {customer?.full_name
                  ? customer.full_name.charAt(0).toUpperCase()
                  : '?'}
              </div>
              <div className="profile-avatar-info">
                <h2 className="profile-name">
                  {customer?.full_name || 'Seu nome aqui'}
                </h2>
                {config?.loyalty_enabled && (
                  <div className="loyalty-badge">
                    <Award size={14} />
                    <span>{customer?.loyalty_points || 0} Pontos Fidelidade</span>
                  </div>
                )}
              </div>
            </div>

            <form className="profile-form" onSubmit={handleUpdateProfile}>

              {/* ── Seção: Identificação ───────────────────────── */}
              <div className="profile-section-card">
                <h3 className="profile-section-label">👤 Identificação</h3>

                <div className="form-group">
                  <label>Nome Completo</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      value={customer?.full_name || ''}
                      onChange={e => setCustomer({ ...customer!, full_name: e.target.value })}
                      placeholder="Ex: João Silva"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>WhatsApp</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">📱</span>
                    <input
                      type="tel"
                      value={customer?.phone || ''}
                      onChange={e => setCustomer({ ...customer!, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </div>

              {/* ── Seção: Endereço ────────────────────────────── */}
              <div className="profile-section-card">
                <h3 className="profile-section-label">📍 Endereço de Entrega</h3>

                <div className="form-group">
                  <label>CEP</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      value={customer?.cep || ''}
                      onChange={e => setCustomer({ ...customer!, cep: e.target.value })}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Rua e Número</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      value={customer?.address || ''}
                      onChange={e => setCustomer({ ...customer!, address: e.target.value })}
                      placeholder="Ex: Rua das Flores, 123"
                    />
                  </div>
                </div>

                <div className="profile-row">
                  <div className="form-group">
                    <label>Complemento</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        value={customer?.complement || ''}
                        onChange={e => setCustomer({ ...customer!, complement: e.target.value })}
                        placeholder="Apto, Bloco..."
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Bairro</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        value={customer?.neighborhood || ''}
                        onChange={e => setCustomer({ ...customer!, neighborhood: e.target.value })}
                        placeholder="Ex: Centro"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Ponto de Referência</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">🏠</span>
                    <input
                      type="text"
                      value={customer?.reference || ''}
                      onChange={e => setCustomer({ ...customer!, reference: e.target.value })}
                      placeholder="Ex: Próximo ao mercado X, casa azul..."
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className={`save-profile-btn ${saveSuccess ? 'saved' : ''}`}
              >
                {saveSuccess ? '✓ Salvo com sucesso!' : 'Salvar Alterações'}
              </button>
            </form>
          </section>
        )}
      </main>

      {/* Botão flutuante do carrinho — aparece apenas na aba início */}
      <FloatingCart
        cart={cart}
        onOpen={() => setIsCartOpen(true)}
        visible={activeTab === 'inicio'}
      />

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} cartCount={cartCount} />

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} />
      )}

      <CartDrawer
        isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart}
        onRemoveItem={handleRemoveFromCart} config={config} onCheckout={handleCheckout}
        customer={customer} onCustomerUpdate={setCustomer} onSelectUpsell={(p) => setSelectedProduct(p)}
      />

      <ConversionBoosters 
        primaryColor={config.theme?.primaryColor} 
        storeName={config.name}
      />

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}

export default StoreFront;
