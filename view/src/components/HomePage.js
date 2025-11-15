// src/components/HomePage.js
import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import FeaturedProducts from './FeaturedProducts';
import Mission from './Mission';
import Footer from './Footer';

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