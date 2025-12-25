
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import apiClient from '../api/axiosConfig';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [params] = useSearchParams();
  const [brands, setBrands] = useState([]);
  const [promo, setPromo] = useState(params.get('promo') === 'true');
  const [brandId, setBrandId] = useState(params.get('brandId') || '');
  useEffect(() => { api.get('/brands').then(({data})=>setBrands(data||[])).catch(()=>setBrands([])); }, []);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        const q = params.get('q') || undefined;
        const categorySlug = params.get('categorySlug') || undefined;
        const response = await apiClient.get('/products', { params: { q, categorySlug, brandId: brandId || undefined, promo } });
        setProducts(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Não foi possível carregar os produtos. Tente novamente mais tarde.');
        console.error('Erro ao buscar produtos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [params, brandId, promo]);

  if (loading) {
    return <div className="text-center p-10">Carregando produtos...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white">
      <div className="max-w-2xl px-4 py-16 mx-auto sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Nossos Produtos</h2>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={promo} onChange={(e)=>setPromo(e.target.checked)} /> Promoções
            </label>
            <select value={brandId} onChange={(e)=>setBrandId(e.target.value)} className="border p-2 text-sm">
              <option value="">Todas as marcas</option>
              {brands.map(b=> (<option key={b.id} value={b.id}>{b.name}</option>))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 mt-6 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <div key={product.id} className="relative group">
              <div className="w-full overflow-hidden bg-gray-200 rounded-md aspect-h-1 aspect-w-1 lg:aspect-none group-hover:opacity-75 lg:h-80">
                <img
                  // Usa a primeira imagem do array de imagens do produto ou uma imagem padrão
                  src={product.images[0]?.url || 'https://tailwindui.com/img/ecommerce-images/product-page-01-related-product-01.jpg'}
                  alt={product.images[0]?.altText || product.name}
                  className="object-cover object-center w-full h-full lg:h-full lg:w-full"
                />
              </div>
              <div className="flex justify-between mt-4">
                <div>
                  <h3 className="text-sm text-gray-700">
                    <Link to={`/products/${product.slug}`}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {product.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{product.category.name}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  R$ {product.basePrice}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
