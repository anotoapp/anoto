import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Settings, LogOut, Store, Home, Shield, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import './Admin.css';

export default function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function getSessionAndProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin/login');
        setLoading(false);
        return;
      }

      setUser(session.user);

      // Fetch profile to check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setUserProfile(profile);
      setLoading(false);
    }

    getSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        navigate('/admin/login');
      } else {
        setUser(session.user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUserProfile(profile);
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
          <img src="/assets/LOGO2.webp" alt="Anotô" style={{ height: '160px', width: 'auto' }} />
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
        <Outlet />
      </main>
    </div>
  );
}
