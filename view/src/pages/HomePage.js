// src/pages/HomePage.js
import React from 'react';
import Hero from '../components/Hero';
import FeaturedProducts from '../components/FeaturedProducts';
import Mission from '../components/Mission';

function HomePage() {
  return (
    // Define a fonte padrão como 'sans' (Inter) e a cor de fundo principal
    <div className="bg-allure-beige text-allure-black font-sans antialiased">
      <main>
        <Hero />
        <FeaturedProducts type="top" />
        <FeaturedProducts type="promo" />
        <Mission />
        
        {/* Outras seções (ex: Categorias, Newsletter) podem ser adicionadas aqui */}
      </main>
    </div>
  );
}

export default HomePage;
