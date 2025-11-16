// src/components/ProductCard.jsx
import React from 'react';

const ProductCard = ({ name, price, imageUrl }) => {
  return (
    <div className="group text-left">
      <div className="overflow-hidden bg-gray-100">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-auto aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <h3 className="mt-4 text-lg font-serif text-allure-black">{name}</h3>
      <p className="mt-1 text-base font-sans font-semibold text-allure-black">{price}</p>
    </div>
  );
};

export default ProductCard;