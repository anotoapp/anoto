import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { getStoreSlug, isLandingPage } from './utils/multitenancy';

// Lazy loading das páginas para habilitar Code Splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const StoreFront = lazy(() => import('./pages/StoreFront'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const OrdersDashboard = lazy(() => import('./pages/admin/OrdersDashboard'));
const StoreSettings = lazy(() => import('./pages/admin/StoreSettings'));
const MyStore = lazy(() => import('./pages/admin/MyStore'));
const LoginAdmin = lazy(() => import('./pages/admin/LoginAdmin'));
const RegisterStore = lazy(() => import('./pages/admin/RegisterStore'));
const ProductsAdmin = lazy(() => import('./pages/admin/ProductsAdmin'));
const SuperAdmin = lazy(() => import('./pages/admin/SuperAdmin'));
const DeliveryFeesAdmin = lazy(() => import('./pages/admin/DeliveryFeesAdmin'));
const CouponsAdmin = lazy(() => import('./pages/admin/CouponsAdmin'));
const CustomersAdmin = lazy(() => import('./pages/admin/CustomersAdmin'));
const Subscription = lazy(() => import('./pages/admin/Subscription'));
const Legal = lazy(() => import('./pages/Legal'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', backgroundColor: '#09090b' }}>
    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  const storeSlug = getStoreSlug();
  const showLanding = isLandingPage();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Lógica de Roteamento por Subdomínio ou Caminho */}
        {showLanding ? (
          <Route path="/" element={<LandingPage />} />
        ) : (
          // Se houver um slug no subdomínio, a raiz "/" mostra a StoreFront desse slug
          <Route path="/" element={<StoreFront customSlug={storeSlug || undefined} />} />
        )}
        
        <Route path="/legal" element={<Legal />} />
        
        {/* Rota do Cliente (Vitrine via Path - Legado/Backup) */}
        <Route path="/:storeSlug" element={<StoreFront />} />
        <Route path="/:storeSlug/order/:orderId" element={<OrderTracking />} />

        {/* Rota de Auth Admin (Sem layout) */}
        <Route path="/admin/login" element={<LoginAdmin />} />
        <Route path="/admin/register" element={<RegisterStore />} />

        {/* Rota do Painel Admin (Protegida) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<OrdersDashboard />} />
          <Route path="products" element={<ProductsAdmin />} />
          <Route path="my-store" element={<MyStore />} />
          <Route path="delivery-fees" element={<DeliveryFeesAdmin />} />
          <Route path="coupons" element={<CouponsAdmin />} />
          <Route path="customers" element={<CustomersAdmin />} />
          <Route path="settings" element={<StoreSettings />} />
          <Route path="subscription" element={<Subscription />} />

          <Route path="master" element={<SuperAdmin />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
