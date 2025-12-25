import React from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';

const WishlistPage = () => {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const load = async () => {
    try {
      setError('');
      const { data } = await api.get('/wishlist');
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Erro ao carregar wishlist.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  const remove = async (id) => {
    try {
      await api.delete(`/wishlist/${id}`);
      setItems(items.filter(i => i.id !== id));
    } catch (e) {
      setError('Falha ao remover item.');
    }
  };

  if (loading) return <div className="p-10 text-center">Carregando...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700">{error}</div>}
      <h1 className="text-2xl font-semibold mb-6">Lista de Desejos</h1>
      {items.length === 0 ? (
        <div className="text-gray-600">Sua lista está vazia.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it) => (
            <div key={it.id} className="border p-4">
              <div className="font-medium mb-1">{it.product?.name || 'Produto'}</div>
              <div className="text-sm text-gray-600 mb-3">{it.product?.brand?.name}</div>
              <div className="flex gap-3">
                <Link to={`/products/${it.product?.slug}`} className="px-3 py-2 border">Ver produto</Link>
                <button onClick={() => remove(it.id)} className="px-3 py-2 border text-red-600">Remover</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
