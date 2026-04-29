import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Settings, LogOut, Store, Home, Shield, MapPin } from 'lucide-react';
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
      // 1. Fetch Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setUserProfile(profile);

      // 2. Fetch Store
      const { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', userId)
        .single();
      setStore(storeData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function initAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin/login');
        setLoading(false);
        return;
      }

      setUser(session.user);
      await loadAllData(session.user.id);
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setUserProfile(null);
        setStore(null);
        navigate('/admin/login');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session.user);
        if (!userProfile) await loadAllData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) return <div className="p-4">Carregando painel...</div>;
  if (!user) return null;

  const isSuperAdmin = userProfile?.role === 'superadmin';

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src="/assets/LOGO NOVA SEM FUNDO.png" alt="Anotô" style={{ height: '140px', width: 'auto', marginBottom: '10px' }} />
        </div>
        
        <nav className="admin-nav">
          <NavLink to="/admin" end className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Home size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/orders" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <ShoppingBag size={20} />
            <span>Pedidos</span>
          </NavLink>
          <NavLink to="/admin/products" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <LayoutDashboard size={20} />
            <span>Produtos</span>
          </NavLink>
          <NavLink to="/admin/my-store" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Store size={20} />
            <span>Minha Loja</span>
          </NavLink>
          <NavLink to="/admin/delivery-fees" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <MapPin size={20} />
            <span>Taxas de Entrega</span>
          </NavLink>
          <NavLink to="/admin/settings" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Settings size={20} />
            <span>Configurações</span>
          </NavLink>

          {isSuperAdmin && (
            <>
              <div className="nav-divider" style={{ margin: '16px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>
              <NavLink to="/admin/master" className={({isActive}) => isActive ? "nav-item active superadmin" : "nav-item superadmin"}>
                <Shield size={20} />
                <span>Gestão Geral</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="admin-footer">
          <button className="nav-item logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet context={{ user, userProfile, store } as AdminContextType} />
      </main>
    </div>
  );
}
