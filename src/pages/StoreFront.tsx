import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronRight, ChevronDown } from 'lucide-react';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { CartDrawer } from '../components/CartDrawer';
import { BottomNav } from '../components/BottomNav';
import { supabase } from '../lib/supabase';
import type { Product, CartItem, ProductOption, RestaurantConfig, CustomerProfile } from '../types';
import { formatWhatsAppMessage } from '../utils/whatsapp';
import { isStoreOpen } from '../utils/storeStatus';

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

  useEffect(() => {
    const savedCustomer = localStorage.getItem('anoto_customer');
    if (savedCustomer) {
      try {
        setCustomer(JSON.parse(savedCustomer));
      } catch {
        console.error('Error parsing customer from local storage');
      }
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
        };

        setConfig(loadedConfig);
        if (categoriesData.length > 0) setActiveCategory(categoriesData[0].id);

        document.title = loadedConfig.name;
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Não foi possível carregar os dados da loja.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [storeSlug]);

  const handleAddToCart = (quantity: number, selectedOptions: ProductOption[], notes: string) => {
    if (selectedProduct) {
      setCart([...cart, { product: selectedProduct, quantity, selectedOptions, notes }]);
      setSelectedProduct(null);
    }
  };

  const handleRemoveFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const handleCheckout = async (customerInfo: any) => {
    if (!config || !config.id) return;
    try {
      const total = cart.reduce((acc, item) => {
        const optionsPrice = item.selectedOptions.reduce((sum, o) => sum + o.price, 0);
        return acc + (item.product.price + optionsPrice) * item.quantity;
      }, 0) + (customerInfo.type === 'delivery' ? config.deliveryFee : 0);

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          store_id: config.id,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          customer_address: `${customerInfo.address}${customerInfo.neighborhood ? ` - Bairro: ${customerInfo.neighborhood}` : ''}`,
          payment_method: customerInfo.payment,
          order_type: customerInfo.type,
          total: total,
          status: 'pending'
        })
        .select().single();

      if (orderError) throw orderError;

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
    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
      alert('Houve um erro ao processar seu pedido.');
    }
  };

  if (loading) return <div className="app-loading"><div className="spinner"></div></div>;
  if (error || !config) return <div className="app-error"><h2>{error || 'Loja não encontrada'}</h2></div>;

  const storeStatus = isStoreOpen(config);
  const isOpen = storeStatus.isOpen;

  const highlights = config.products.slice(0, 4);
  const filteredProducts = config.products.filter(p => p.category === activeCategory);

  return (
    <div className="app" style={{ paddingBottom: '90px', background: '#fcfcfc', minHeight: '100vh' }}>
      <Header 
        config={config} 
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} 
        onCartClick={() => setIsCartOpen(true)} 
        isOpen={isOpen}
      />

      <main className="container">
        <div className="delivery-fee-card">
          <div className="delivery-info-main">
            <div className="icon-circle"><MapPin size={18} /></div>
            <span>Calcular taxa e tempo de entrega</span>
          </div>
          <ChevronRight size={18} className="arrow-icon" />
        </div>

        <div className="filter-row">
          <div className="category-select-wrapper">
            <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)} className="category-select">
              {config.categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            <ChevronDown size={16} className="select-arrow" />
          </div>
          <button className="search-btn-round"><Search size={20} /></button>
        </div>

        {activeTab === 'inicio' && highlights.length > 0 && (
          <section className="highlights-section">
            <h2 className="section-title">Destaques</h2>
            <div className="highlights-scroll">
              {highlights.map(product => (
                <ProductCard key={`h-${product.id}`} product={product} layout="grid" onAdd={() => setSelectedProduct(product)} />
              ))}
            </div>
          </section>
        )}

        <section className="main-products">
          <h2 className="section-title">{config.categories.find(c => c.id === activeCategory)?.name || 'Produtos'}</h2>
          <div className="products-list-vertical">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} layout="list" onAdd={() => setSelectedProduct(product)} />
            ))}
          </div>
        </section>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} />

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} />
      )}

      <CartDrawer 
        isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} 
        onRemoveItem={handleRemoveFromCart} config={config} onCheckout={handleCheckout} 
        customer={customer} onCustomerUpdate={setCustomer} onSelectUpsell={(p) => setSelectedProduct(p)}
      />
    </div>
  );
}

export default StoreFront;
