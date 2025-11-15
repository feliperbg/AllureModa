// src/pages/HomePage.js
import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeaturedProducts from '../components/FeaturedProducts';
import Mission from '../components/Mission';
import Footer from '../components/Footer';

function HomePage() {
  return (
    // Define a fonte padrão como 'sans' (Inter) e a cor de fundo principal
    <div className="bg-allure-beige text-allure-black font-sans antialiased">
      <Navbar />
      <main>
        <Hero />
        <FeaturedProducts />
        <Mission />
        {/* Outras seções (ex: Categorias, Newsletter) podem ser adicionadas aqui */}
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;