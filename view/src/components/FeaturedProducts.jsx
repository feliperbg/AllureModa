// src/components/FeaturedProducts.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import api from '../api/axiosConfig';

const FeaturedProducts = ({ type }) => {
  const [products, setProducts] = React.useState([]);
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    api.get('/products/featured', { params: { type } }).then(({ data }) => {
      setProducts(Array.isArray(data) ? data : []);
    }).catch(()=>setError('Falha ao carregar destaques'));
  }, [type]);
 
  return (
    <section className="py-20 bg-allure-beige">
      <div className="container mx-auto px-4">
        <h2 className="text-center font-serif text-4xl mb-12">
          {type === 'promo' ? 'Produtos em Promoção' : 'Produtos em Destaque'}
        </h2>
        {error && <div className="text-center text-red-600 mb-4">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {products.map((product) => (
            <Link key={product.id} to={`/products/${product.slug}`}>
              <ProductCard 
                name={product.name}
                price={product.basePrice}
                imageUrl={product.images?.[0]?.url}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
