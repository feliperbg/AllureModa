// src/components/Hero.jsx
import React from 'react';

const Hero = () => {
  return (
    <section 
      className="relative h-[80vh] w-full bg-cover bg-center" 
      // Substitua por uma imagem real de alta qualidade
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1574695026980-a2491b312015?q=80&w=2070')" }}
    >
      {/* Overlay escuro para melhor legibilidade do texto */}
      <div className="absolute inset-0 bg-black bg-opacity-20" />
      
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white p-4">
        <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight">
          Elegância que Desperta
        </h1>
        <p className="mt-4 text-lg max-w-lg font-sans">
          Descubra peças que causam impacto com qualidade premium.
        </p>
        <button className="mt-8 bg-allure-black text-white font-sans font-bold py-3 px-10 tracking-wide transition-all hover:bg-gray-800">
          Conheça a Coleção
        </button>
      </div>
    </section>
  );
};

export default Hero;