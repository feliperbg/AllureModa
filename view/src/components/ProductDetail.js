
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import apiClient from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { auth } = React.useContext(AuthContext);
  const consent = typeof window !== 'undefined' && localStorage.getItem('cookie_consent') === 'true';
  const getCookie = (name) => {
    const m = typeof document !== 'undefined' ? document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)')) : null;
    return m ? m[1] : '';
  };
  const setCookie = (name, value, days) => {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + d.toUTCString();
    if (typeof document !== 'undefined') document.cookie = name + '=' + value + '; ' + expires + '; path=/';
  };
  const decodeCartCookie = (v) => { try { return JSON.parse(decodeURIComponent(atob(v))); } catch { return []; } };
  const encodeCartCookie = (arr) => { try { return btoa(encodeURIComponent(JSON.stringify(arr || []))); } catch { return ''; } };
  const [product, setProduct] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await apiClient.get(`/products/slug/${slug}`);
        setProduct(data);
        if (data?.variants?.[0]) setSelectedVariantId(data.variants[0].id);
      } catch (err) {
        setError(err.response?.data?.message || 'Não foi possível carregar o produto. Tente novamente mais tarde.');
        console.error('Erro ao buscar produto:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return <div className="text-center p-10">Carregando produto...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  if (!product) {
    return <div className="text-center p-10">Produto não encontrado.</div>;
  }

  const addToWishlist = async () => {
    try {
      setMessage('');
      await api.post('/wishlist', { productId: product.id });
      setMessage('Adicionado à wishlist');
    } catch (e) { setMessage(e.response?.data?.message || 'Falha ao favoritar'); }
  };

  const addToCart = async () => {
    try {
      setMessage('');
      if (auth?.isAuthenticated && consent) {
        await api.put('/cart', { productVariantId: selectedVariantId, quantity: 1 });
      } else {
        const raw = getCookie('local_cart');
        const arr = raw ? decodeCartCookie(raw) : [];
        const idx = arr.findIndex(function(i){ return i.productVariantId === selectedVariantId; });
        if (idx >= 0) {
          arr[idx] = { ...arr[idx], quantity: Number(arr[idx].quantity || 0) + 1 };
        } else {
          const variant = (product?.variants || []).find(function(v){ return v.id === selectedVariantId; });
          arr.push({ id: 'local-'+selectedVariantId, quantity: 1, productVariantId: selectedVariantId, product: product, variant: variant || null });
        }
        const v = encodeCartCookie(arr);
        if (v) setCookie('local_cart', v, 7);
      }
      setMessage('Adicionado ao carrinho');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cart-updated'));
      }
    } catch (e) { setMessage(e.response?.data?.message || 'Falha ao adicionar ao carrinho'); }
  };

  return (
    <div className="bg-white">
      <div className="pt-6">
        {/* Image gallery */}
        <div className="mx-auto mt-6 max-w-2xl sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:gap-x-8 lg:px-8">
          {product.images.map((image) => (
            <div key={image.id} className="aspect-h-4 aspect-w-3 hidden overflow-hidden rounded-lg lg:block">
              <img
                src={image.url}
                alt={image.altText}
                className="h-full w-full object-cover object-center"
              />
            </div>
          ))}
        </div>

        {/* Product info */}
        <div className="mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:grid-rows-[auto,auto,1fr] lg:gap-x-8 lg:px-8 lg:pb-24 lg:pt-16">
          <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{product.name}</h1>
          </div>

          {/* Options */}
          <div className="mt-4 lg:row-span-3 lg:mt-0">
            <h2 className="sr-only">Product information</h2>
            <p className="text-3xl tracking-tight text-gray-900">R$ {product.basePrice}</p>
            {message && <div className="mt-2 text-sm">{message}</div>}

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm text-gray-700">Variante</label>
                <select value={selectedVariantId} onChange={(e)=>setSelectedVariantId(e.target.value)} className="mt-1 w-full border p-2">
                  {product.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.attributes.map(a=>a.attributeValue.attribute.name+': '+a.attributeValue.value).join(' / ')} - R$ {v.price}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={addToCart} className="flex items-center justify-center rounded-md bg-indigo-600 px-8 py-3 text-base font-medium text-white">Adicionar ao carrinho</button>
                <button onClick={addToWishlist} className="flex items-center justify-center rounded-md border px-8 py-3 text-base">Favoritar</button>
              </div>
            </div>
          </div>

          <div className="py-10 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-200 lg:pb-16 lg:pr-8 lg:pt-6">
            {/* Description and details */}
            <div>
              <h3 className="sr-only">Description</h3>

              <div className="space-y-6">
                <p className="text-base text-gray-900">{product.description}</p>
                <div className="mt-6">
                  <h4 className="font-semibold">Avaliações</h4>
                  {product.reviews?.length ? (
                    <div className="space-y-3 mt-2">
                      {product.reviews.map((r)=> (
                        <div key={r.id} className="border p-3">
                          <div className="text-sm text-gray-600">{r.user?.firstName} • Nota {r.rating}</div>
                          <div>{r.comment}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">Ainda não há avaliações.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
