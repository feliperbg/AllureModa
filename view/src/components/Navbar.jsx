// src/components/Navbar.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingBag, Heart, LayoutDashboard, Menu, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';

const Navbar = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [cartCount, setCartCount] = React.useState(0);
  const consent = typeof window !== 'undefined' && localStorage.getItem('cookie_consent') === 'true';
  const getCookie = (name) => {
    const m = typeof document !== 'undefined' ? document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)')) : null;
    return m ? m[1] : '';
  };
  const decodeCartCookie = (v) => { try { return JSON.parse(decodeURIComponent(atob(v))); } catch { return []; } };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      setAuth({ user: null, isAuthenticated: false });
      setCartCount(0);
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const [categories, setCategories] = React.useState([]);
  React.useEffect(() => {
    api.get('/categories').then(({ data }) => {
      setCategories(Array.isArray(data) ? data : []);
    }).catch(() => {
      setCategories([]);
    });
  }, []);

  React.useEffect(() => {
    const sumQty = function(arr){ return (arr||[]).reduce(function(s,i){ return s + Number(i.quantity||0); },0); };
    if (auth?.isAuthenticated && consent) {
      const fetchCount = function(){ api.get('/cart').then(function({data}){ setCartCount(sumQty(data.items||[])); }).catch(function(){ setCartCount(0); }); };
      fetchCount();
      const onCartUpdated = function(){ fetchCount(); };
      window.addEventListener('cart-updated', onCartUpdated);
      return function(){ window.removeEventListener('cart-updated', onCartUpdated); };
    } else {
      const raw = getCookie('local_cart');
      const arr = raw ? decodeCartCookie(raw) : [];
      setCartCount(sumQty(arr));
      const onCartUpdated = function(){ const r = getCookie('local_cart'); const a = r ? decodeCartCookie(r) : []; setCartCount(sumQty(a)); };
      window.addEventListener('cart-updated', onCartUpdated);
      return function(){ window.removeEventListener('cart-updated', onCartUpdated); };
    }
  }, [auth?.isAuthenticated, consent]);

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-900"
            aria-label="Menu"
          >
            <Menu size={22} />
          </button>

          <Link to="/" className="absolute left-1/2 -translate-x-1/2 select-none">
            <span className="text-2xl sm:text-3xl tracking-widest font-semibold text-gray-900">ALLURE MODA</span>
          </Link>

          <div className="flex items-center gap-4 text-gray-900">
            <Link to="/search" aria-label="Buscar" title="Buscar" className="hover:opacity-70">
              <Search size={20} />
            </Link>
            <Link to="/wishlist" aria-label="Favoritos" title="Favoritos" className="hover:opacity-70">
              <Heart size={20} />
            </Link>
            {auth?.isAuthenticated ? (
              <>
                <Link to="/account" aria-label="Meus dados" title="Meus dados" className="hover:opacity-70">
                  <User size={20} />
                </Link>
                {auth?.user?.role === 'ADMIN' && (
                  <Link to="/admin" aria-label="Admin" title="Admin" className="hover:opacity-70">
                    <LayoutDashboard size={20} />
                  </Link>
                )}
                <button onClick={handleLogout} aria-label="Sair" title="Sair" className="hover:opacity-70">
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <Link to="/login" aria-label="Entrar" title="Entrar" className="hover:opacity-70">
                <User size={20} />
              </Link>
            )}
            <Link to="/cart" aria-label="Carrinho" title="Carrinho" className="hover:opacity-70">
              <div className="relative">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full">{cartCount}</span>
                )}
              </div>
            </Link>
          </div>
        </div>

        <div className="hidden md:flex h-12 items-center justify-center gap-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/products?categorySlug=${encodeURIComponent(c.slug)}`}
              className="font-sansSerif text-[13px] tracking-wide font-semibold text-gray-800 hover:text-black"
            >
              {c.name.toUpperCase()}
            </Link>
          ))}
        </div>

        {menuOpen && (
          <div className="md:hidden pb-3">
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <Link key={c.id} to={`/products?categorySlug=${encodeURIComponent(c.slug)}`} className="text-sm py-2 text-gray-800">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
