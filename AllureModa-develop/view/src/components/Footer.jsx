// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Instagram, Facebook, Pin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-allure-black text-allure-beige py-16">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo e Social */}
        <div className="md:col-span-2 mb-6 md:mb-0">
          <Link to="/" className="font-serif text-3xl tracking-widest text-allure-gold">
            ALLURE
          </Link>
          <p className="text-gray-400 mt-2 font-sans">by Lu Mota</p>
          <div className="flex space-x-4 mt-6">
            <a className="..." href="https://pinterest.com" target="_blank" rel="noopener noreferrer">
              <Pin/>
            </a>
            <a className="..." href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <Twitter />
            </a>
            <a className="..." href="https://www.instagram.com/alluremoda_?igsh=MWNoM2RmeHVpOTNqNQ==" target="_blank" rel="noopener noreferrer">
              <Instagram />
            </a>
            <a className="..." href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <Facebook />
            </a>
          </div>
        </div>
        
        {/* Links Rápidos */}
        <div>
          <h3 className="font-sans font-bold tracking-wide uppercase text-white">Institucional</h3>
          <ul className="mt-4 space-y-2 font-sans">
            <li><Link to="/about" className="text-gray-400 hover:text-allure-gold">Sobre Nós</Link></li>
            <li><Link to="/contact" className="text-gray-400 hover:text-allure-gold">Contato</Link></li>
          </ul>
        </div>
        
        {/* Ajuda */}
        <div>
          <h3 className="font-sans font-bold tracking-wide uppercase text-white">Ajuda</h3>
          <ul className="mt-4 space-y-2 font-sans">
            <li><Link to="/faq" className="text-gray-400 hover:text-allure-gold">FAQ</Link></li>
            <li><Link to="/trade-politics" className="text-gray-400 hover:text-allure-gold">Política de Troca</Link></li>
            <li><Link to="/track-order" className="text-gray-400 hover:text-allure-gold">Rastrear Pedido</Link></li>
          </ul>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="container mx-auto px-4 mt-12 border-t border-gray-700 pt-8 text-center text-gray-500 font-sans">
        <p>&copy; {new Date().getFullYear()} Allure by Lu Mota. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
