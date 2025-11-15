// src/components/FeaturedProducts.jsx
import React from 'react';
import ProductCard from './ProductCard';

// Dados mockados. Substitua pelos dados reais da sua API/backend.
const products = [
  { id: 1, name: 'Vestido de Seda', price: 'R$ 450,00', imageUrl: '/images/product1.jpg' },
  { id: 2, name: 'Bolsa de Couro', price: 'R$ 720,00', imageUrl: '/images/product2.jpg' },
  { id: 3, name: 'Sapato Scarpin', price: 'R$ 380,00', imageUrl: '/images/product3.jpg' },
  { id: 4, name: 'Blazer Alongado', price: 'R$ 590,00', imageUrl: '/images/product4.jpg' },
];

const FeaturedProducts = () => {
  return (
    <section className="py-20 bg-allure-beige">
      <div className="container mx-auto px-4">
        <h2 className="text-center font-serif text-4xl mb-12">Produtos em Destaque</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {products.map((product) => (
            <ProductCard 
              key={product.id}
              name={product.name}
              price={product.price}
              imageUrl={product.imageUrl} // Certifique-se que essas imagens existem
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;