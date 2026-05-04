import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import StoreFront from './pages/StoreFront';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import OrdersDashboard from './pages/admin/OrdersDashboard';
import StoreSettings from './pages/admin/StoreSettings';
import MyStore from './pages/admin/MyStore';
import LoginAdmin from './pages/admin/LoginAdmin';
import RegisterStore from './pages/admin/RegisterStore';
import ProductsAdmin from './pages/admin/ProductsAdmin';
import SuperAdmin from './pages/admin/SuperAdmin';
import DeliveryFeesAdmin from './pages/admin/DeliveryFeesAdmin';
import CouponsAdmin from './pages/admin/CouponsAdmin';
import CustomersAdmin from './pages/admin/CustomersAdmin';
import Subscription from './pages/admin/Subscription';
import Legal from './pages/Legal';
import OrderTracking from './pages/OrderTracking';
import { getStoreSlug, isLandingPage } from './utils/multitenancy';

function App() {
  const storeSlug = getStoreSlug();
  const showLanding = isLandingPage();

  return (
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
  );
}

export default App;
