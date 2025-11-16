import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axiosConfig';

const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = React.useState(params.get('q') || '');
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const runSearch = async (q) => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/products', { params: { q } });
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.response?.data?.message || 'Erro ao buscar produtos.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const q = params.get('q') || '';
    setQuery(q);
    if (q) runSearch(q);
  }, [params]);

  const onSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    setParams(q ? { q } : {});
    if (q) runSearch(q);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold mb-6">Buscar produtos</h1>
      <form onSubmit={onSubmit} className="flex gap-2 mb-6">
        <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Digite o nome do produto" className="flex-1 border p-2" />
        <button type="submit" className="px-4 py-2 bg-black text-white">Buscar</button>
      </form>
      {loading && <div>Carregando...</div>}
      {error && <div className="p-3 bg-red-100 text-red-700 mb-4">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border p-4">
            <Link to={`/products/${product.slug}`} className="font-medium">
              {product.name}
            </Link>
            <div className="text-sm text-gray-600">{product.category?.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
