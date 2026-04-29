import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Package, Store, Truck, Settings, LogOut, Shield, Menu 
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';
import './Admin.css';

interface UserProfile {
  id: string;
  role: string;
  full_name?: string;
}

export interface AdminContextType {
  user: User | null;
  userProfile: UserProfile | null;
  store: any | null;
}

export default function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [store, setStore] = useState<any | null>(null);
  const navigate = useNavigate();

  const loadAllData = async (userId: string) => {
    try {
      // Busca Perfil e Loja em paralelo para ser mais rápido
      const [profileRes, storeRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('stores').select('*').eq('owner_id', userId).single()
      ]);

      if (profileRes.data) setUserProfile(profileRes.data);
      if (storeRes.data) setStore(storeRes.data);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (mounted) navigate('/admin/login');
        setLoading(false);
        return;
      }

      if (mounted) {
        setUser(session.user);
        await loadAllData(session.user.id);
      }
    }

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setStore(null);
        navigate('/admin/login');
      } else if (session) {
        setUser(session.user);
        if (!store) loadAllData(session.user.id);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <img src="/assets/logo-anoto.png" alt="Anotô" className="loading-logo" />
          <div className="loading-bar-container">
            <div className="loading-bar-progress"></div>
          </div>
          <span className="loading-text">Carregando painel...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isSuperAdmin = userProfile?.role === 'superadmin';

  return (
    <div className="admin-layout">
      {/* Mobile Header */}
      <div className="admin-mobile-header">
        <img src="/assets/logo-anoto.png" alt="Anotô" className="mobile-logo" />
        <button className="hamburger-btn" onClick={() => setMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      <div className={`sidebar-overlay ${mobileMenuOpen ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)} />

      <aside className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="admin-brand">
          <img src="/assets/logo-anoto.png" alt="Anotô" style={{ height: 'auto', width: '180px' }} />
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin" end className="nav-item" onClick={() => setMobileMenuOpen(false)}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/admin/orders" className="nav-item" onClick={() => setMobileMenuOpen(false)}>
            <ShoppingBag size={20} /> Pedidos
          </NavLink>
          <NavLink to="/admin/products" className="nav-item" onClick={() => setMobileMenuOpen(false)}>
            <Package size={20} /> Produtos
          </NavLink>
          <NavLink to="/admin/my-store" className="nav-item" onClick={() => setMobileMenuOpen(false)}>
            <Store size={20} /> Minha Loja
          </NavLink>
          <NavLink to="/admin/delivery-fees" className="nav-item" onClick={() => setMobileMenuOpen(false)}>
            <Truck size={20} /> Taxas
          </NavLink>
          <NavLink to="/admin/settings" className="nav-item" onClick={() => setMobileMenuOpen(false)}>
            <Settings size={20} /> Ajustes
          </NavLink>

          {isSuperAdmin && (
            <>
              <div className="nav-divider" />
              <NavLink to="/admin/master" className="nav-item superadmin" onClick={() => setMobileMenuOpen(false)}>
                <Shield size={20} /> Master
              </NavLink>
            </>
          )}
        </nav>
        <div className="admin-footer">
          <button onClick={() => supabase.auth.signOut()} className="nav-item logout">
            <LogOut size={20} /> Sair
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet context={{ store, userProfile, user }} />
      </main>
    </div>
  );
}
