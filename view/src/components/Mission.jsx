// src/components/Mission.jsx
import React from 'react';

const Mission = () => {
  return (
    <section className="py-24 text-center bg-white">
      <div className="container mx-auto px-4">
        <h2 className="font-cursive text-5xl text-allure-black mb-2">Nossa Missão</h2>
        <span className="font-serif text-xl tracking-widest text-allure-gold uppercase">ALLURE</span>
        <p className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-allure-grey leading-relaxed font-sans">
          Nossa missão é oferecer moda sofisticada e acessível que desperte a autenticidade e sensualidade de todas as mulheres.
        </p>
        <p className="mt-4 max-w-2xl mx-auto text-base md:text-lg text-allure-grey leading-relaxed font-sans">
          Aqui você encontra peças que causam impacto com preço justo e a qualidade premium que você merece.
        </p>
      </div>
    </section>
  );
};

export default Mission;