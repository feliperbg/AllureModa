import React, { useContext } from 'react';
// Importa o Outlet para as rotas aninhadas
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'; 
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import Auth from './components/Auth';
import ProductDetail from './components/ProductDetail';
import ProductList from './components/ProductList';
import CookieConsent from './components/CookieConsent';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import SearchPage from './pages/SearchPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import TradePolicyPage from './pages/TradePolicyPage';
import TrackOrderPage from './pages/TrackOrderPage';
import AccountPage from './pages/AccountPage';

// Importa o novo layout de Admin
import AdminLayout from './pages/admin/AdminLayout'; 
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductsAdmin from './pages/admin/ProductsAdmin';
import CustomersAdmin from './pages/admin/CustomersAdmin';
import { AuthContext } from './context/AuthContext';

function App() {
  const { auth } = useContext(AuthContext);
  const AdminOnly = ({ children }) => (auth?.user?.role === 'ADMIN' ? children : <div className="p-10 text-center">Acesso restrito ao administrador.</div>);

  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <CookieConsent />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/trade-politics" element={<TradePolicyPage />} />
            <Route path="/track-order" element={<TrackOrderPage />} />

            {/* *** ROTAS DE ADMIN ATUALIZADAS ***
              Usamos rotas aninhadas. O AdminLayout é carregado para /admin
              e o <Outlet /> dentro dele vai renderizar a rota filha correta.
            */}
            <Route path="/admin" element={<AdminOnly><AdminLayout /></AdminOnly>}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<ProductsAdmin />} />
              <Route path="customers" element={<CustomersAdmin />} />
            </Route>
            
            {/* Adicione mais rotas conforme necessário */}
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;