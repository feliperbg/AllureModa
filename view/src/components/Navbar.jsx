// src/components/Navbar.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingBag, LogOut, Menu } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';

const Navbar = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      setAuth({ user: null, isAuthenticated: false });
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-allure-gold">
            AllureModa
          </Link>

          {/* Menu Links - Desktop */}
          <div className="hidden md:flex space-x-8">
            <Link to="/products" className="text-gray-700 hover:text-allure-gold transition">
              Produtos
            </Link>
            <a href="#about" className="text-gray-700 hover:text-allure-gold transition">
              Sobre
            </a>
            <a href="#contact" className="text-gray-700 hover:text-allure-gold transition">
              Contato
            </a>
          </div>

          {/* Ícones Direita */}
          <div className="flex items-center space-x-4">
            <Link
              to="/search"
              className="hover:text-allure-gold transition-colors"
              aria-label="Buscar"
              title="Buscar"
            >
              <Search size={20} />
            </Link>

            {auth?.isAuthenticated ? (
              <>
                {/* Usuário logado */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700">
                    Olá, {auth.user?.fullName || auth.user?.email}!
                  </span>
                  <button
                    onClick={handleLogout}
                    className="hover:text-allure-gold transition-colors"
                    title="Sair"
                    aria-label="Sair"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Não logado */}
                <Link
                  to="/login"
                  className="hover:text-allure-gold transition-colors"
                  aria-label="Entrar"
                  title="Entrar"
                >
                  <User size={20} />
                </Link>
              </>
            )}

            <Link
              to="/cart"
              className="hover:text-allure-gold transition-colors"
              aria-label="Carrinho"
              title="Carrinho"
            >
              <ShoppingBag size={20} />
            </Link>

            {/* Menu Mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden"
              aria-label="Menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              to="/products"
              className="block text-gray-700 hover:text-allure-gold transition py-2"
            >
              Produtos
            </Link>
            <a
              href="#about"
              className="block text-gray-700 hover:text-allure-gold transition py-2"
            >
              Sobre
            </a>
            <a
              href="#contact"
              className="block text-gray-700 hover:text-allure-gold transition py-2"
            >
              Contato
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;