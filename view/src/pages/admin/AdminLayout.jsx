import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Boxes, Users, Store } from 'lucide-react';

// Este é o novo componente de layout que envolve todas as páginas de admin.
// Ele cria a barra lateral de navegação e renderiza o conteúdo da página (via <Outlet />).

const AdminLayout = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Produtos', href: '/admin/products', icon: Boxes },
    { name: 'Clientes', href: '/admin/customers', icon: Users },
    { name: 'Voltar à Loja', href: '/', icon: Store },
  ];

  const isActive = (path) => {
    // A rota /admin exata deve corresponder apenas a 'Dashboard'
    if (path === '/admin') return location.pathname === '/admin';
    // Outras rotas /admin/*
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-allure-beige font-sans">
      {/* Barra Lateral */}
      <aside className="w-64 flex-shrink-0 bg-allure-black text-white p-6 hidden md:block">
        <h2 className="text-2xl font-serif text-white mb-8">Admin</h2>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive(item.href)
                  ? 'bg-allure-gold text-allure-black font-semibold'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-grow p-6 md:p-10 overflow-auto">
        {/* O <Outlet /> renderiza o componente da rota filha (Dashboard, Produtos, Clientes) */}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;