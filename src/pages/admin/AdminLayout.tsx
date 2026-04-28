import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Settings, LogOut, Store, Home } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import './Admin.css';

export default function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/admin/login');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/admin/login');
      else setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) return <div className="p-4">Carregando painel...</div>;
  if (!user) return null;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src="/assets/LOGO ANOTO.webp" alt="Anotô" style={{ height: '160px', width: 'auto' }} />
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
          <NavLink to="/admin/settings" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Settings size={20} />
            <span>Configurações</span>
          </NavLink>
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
