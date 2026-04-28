import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { CategoryNav } from '../components/CategoryNav';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { CartDrawer } from '../components/CartDrawer';
import { supabase } from '../lib/supabase';
import type { Product, CartItem, ProductOption, RestaurantConfig } from '../types';
import { formatWhatsAppMessage } from '../utils/whatsapp';

import '../App.css';

function App() {
  const { storeSlug } = useParams<{ storeSlug?: string }>();
  const [config, setConfig] = useState<RestaurantConfig | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    // Carregar cliente do localStorage (Login via WhatsApp)
    const savedCustomer = localStorage.getItem('anoto_customer');
    if (savedCustomer) {
      try {
        setCustomer(JSON.parse(savedCustomer));
      } catch (e) {
        console.error('Error parsing customer from local storage');
      }
    }

    async function loadData() {
      try {
        // Fetch Store
        let storeQuery = supabase.from('stores').select('*');
        
        if (storeSlug) {
          storeQuery = storeQuery.eq('slug', storeSlug);
        } else {
          // Fallback para a primeira loja se não houver slug
          storeQuery = storeQuery.limit(1);
        }

        const { data: storeData, error: storeError } = await storeQuery.single();

        if (storeError) throw storeError;

        // Fetch Categories
        const { data: categoriesData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .eq('store_id', storeData.id);

        if (catError) throw catError;

        // Fetch Products
        const { data: productsData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .in('category_id', categoriesData.map(c => c.id));

        if (prodError) throw prodError;

        // Map data to RestaurantConfig
        const loadedConfig: RestaurantConfig = {
          id: storeData.id,
          name: storeData.name,
          logo: storeData.logo,
          banner: storeData.banner,
          whatsappNumber: storeData.whatsapp_number,
          address: storeData.address,
          deliveryFee: storeData.delivery_fee,
          minOrder: storeData.min_order,
          theme: {
            primaryColor: storeData.primary_color,
            secondaryColor: storeData.secondary_color,
            accentColor: storeData.accent_color,
            backgroundColor: storeData.background_color,
            textColor: storeData.text_color,
            borderRadius: storeData.border_radius,
            fontFamily: storeData.font_family,
          },
          categories: categoriesData,
          products: productsData.map(p => ({
            ...p,
            category: p.category_id // mapping for backward compatibility
          })),
        };

        setConfig(loadedConfig);
        if (categoriesData.length > 0) {
          setActiveCategory(categoriesData[0].id);
        }

        // Apply theme
        const root = document.documentElement;
        root.style.setProperty('--primary', loadedConfig.theme.primaryColor);
        root.style.setProperty('--secondary', loadedConfig.theme.secondaryColor);
        root.style.setProperty('--accent', loadedConfig.theme.accentColor);
        root.style.setProperty('--bg', loadedConfig.theme.backgroundColor);
        root.style.setProperty('--text', loadedConfig.theme.textColor);
        root.style.setProperty('--radius', loadedConfig.theme.borderRadius);
        
        document.title = loadedConfig.name;

      } catch (err) {
        console.error('Error loading data:', err);
        setError('Não foi possível carregar os dados da loja.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleAddToCart = (quantity: number, selectedOptions: ProductOption[], notes: string) => {
    if (selectedProduct) {
      const newItem: CartItem = {
        product: selectedProduct,
        quantity,
        selectedOptions,
        notes,
      };
      setCart([...cart, newItem]);
      setSelectedProduct(null);
    }
  };

  const handleRemoveFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const handleCheckout = async (customerInfo: { name: string; address: string; payment: string; type: string }) => {
    if (!config || !config.id) return;

    try {
      // 1. Calculate total
      const total = cart.reduce((acc, item) => {
        const optionsPrice = item.selectedOptions.reduce((sum, o) => sum + o.price, 0);
        return acc + (item.product.price + optionsPrice) * item.quantity;
      }, 0) + (customerInfo.type === 'delivery' ? config.deliveryFee : 0);

      // 2. Insert Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          store_id: config.id,
          customer_name: customerInfo.name,
          customer_address: customerInfo.address,
          payment_method: customerInfo.payment,
          order_type: customerInfo.type,
          total: total,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. Insert Order Items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price + item.selectedOptions.reduce((sum, o) => sum + o.price, 0),
        notes: item.notes || ''
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 4. Clear Cart and Open WhatsApp
      setCart([]);
      setIsCartOpen(false);
      
      const whatsappUrl = formatWhatsAppMessage(cart, customerInfo, config);
      window.open(whatsappUrl, '_blank');

    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
      alert('Houve um erro ao processar seu pedido. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Carregando cardápio...</p>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="app-error">
        <h2>Ops!</h2>
        <p>{error || 'Loja não encontrada'}</p>
      </div>
    );
  }

  const filteredProducts = config.products.filter(p => p.category === activeCategory);

  return (
    <div className="app">
      <Header 
        config={config} 
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} 
        onCartClick={() => setIsCartOpen(true)} 
      />

      <main className="container">
        <CategoryNav 
          categories={config.categories} 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />

        <section className="product-list fade-in">
          <h2 className="category-title">
            {config.categories.find(c => c.id === activeCategory)?.name}
          </h2>
          <div className="products-grid">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAdd={() => setSelectedProduct(product)} 
              />
            ))}
          </div>
        </section>
      </main>

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={handleAddToCart} 
        />
      )}

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart} 
        onRemoveItem={handleRemoveFromCart} 
        config={config} 
        onCheckout={handleCheckout} 
        customer={customer}
      />
    </div>
  );
}

export default App;
