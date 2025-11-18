import React from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';

const CartPage = () => {
  const { auth } = React.useContext(AuthContext);
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [addresses, setAddresses] = React.useState([]);
  const [selectedAddressId, setSelectedAddressId] = React.useState('');
  const [addrForm, setAddrForm] = React.useState({ cep: '', street: '', city: '', state: '', addressLine2: '' });

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
  const delCookie = (name) => { if (typeof document !== 'undefined') document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'; };
  const decodeCartCookie = (v) => { try { return JSON.parse(decodeURIComponent(atob(v))); } catch { return []; } };
  const encodeCartCookie = (arr) => { try { return btoa(encodeURIComponent(JSON.stringify(arr || []))); } catch { return ''; } };

  const loadServerCart = async () => {
    try {
      setError('');
      const { data } = await api.get('/cart');
      const normalized = (data.items || []).map((ci) => ({
        id: ci.id,
        quantity: ci.quantity,
        productVariantId: ci.productVariantId,
        product: ci.productVariant?.product || null,
        variant: ci.productVariant || null,
      }));
      setItems(normalized);
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          await api.post('/cart', {});
          const { data } = await api.get('/cart');
          const normalized = (data.items || []).map((ci) => ({
            id: ci.id,
            quantity: ci.quantity,
            productVariantId: ci.productVariantId,
            product: ci.productVariant?.product || null,
            variant: ci.productVariant || null,
          }));
          setItems(normalized);
        } catch (e) {
          setError('');
        }
      } else {
        setError('Erro ao carregar carrinho.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadLocalCart = () => {
    const raw = getCookie('local_cart');
    const arr = raw ? decodeCartCookie(raw) : [];
    setItems(arr);
    setError('');
    setLoading(false);
  };

  React.useEffect(() => {
    if (auth?.isAuthenticated && consent) {
      loadServerCart();
      api.get('/addresses').then(({ data }) => {
        setAddresses(data || []);
        if (data && data.length) setSelectedAddressId(data[0].id);
      }).catch(() => {});
    } else {
      loadLocalCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.isAuthenticated, consent]);

  const persistLocal = (next) => {
    const v = encodeCartCookie(next);
    if (v) setCookie('local_cart', v, 7);
    setItems(next);
  };

  const updateServerItem = async (productVariantId, delta, next) => {
    setItems(next);
    try {
      await api.put('/cart', { productVariantId, quantity: delta });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cart-updated'));
      }
    } catch (e) {
      setError('Falha ao atualizar carrinho.');
    }
  };

  const changeQty = (idx, qty) => {
    const current = items[idx];
    const nextQty = Math.max(1, qty);
    const delta = nextQty - current.quantity;
    const next = items.map((it, i) => (i === idx ? { ...it, quantity: nextQty } : it));
    if (auth?.isAuthenticated && consent) return updateServerItem(current.productVariantId, delta, next);
    persistLocal(next);
  };

  const removeItem = (idx) => {
    const next = items.filter((_, i) => i !== idx);
    const current = items[idx];
    if (auth?.isAuthenticated && consent) return updateServerItem(current.productVariantId, -current.quantity, next);
    persistLocal(next);
  };

  const total = items.reduce((sum, it) => {
    const price = Number(it.variant?.price || it.product?.basePrice || 0);
    return sum + price * it.quantity;
  }, 0);

  const maskCep = (v) => {
    const d = (v||'').replace(/\D/g,'').slice(0,8);
    const p1 = d.slice(0,5);
    const p2 = d.slice(5,8);
    return p2 ? `${p1}-${p2}` : p1;
  };

  const onAddrChange = (e) => {
    const { name, value } = e.target;
    const v = name === 'cep' ? maskCep(value) : value;
    setAddrForm(prev => ({ ...prev, [name]: v }));
  };

  React.useEffect(() => {
    const d = addrForm.cep.replace(/\D/g,'');
    if (d.length === 8) {
      fetch(`https://viacep.com.br/ws/${d}/json/`).then(r=>r.json()).then((data)=>{
        if (!data.erro) {
          setAddrForm(prev=>({
            ...prev,
            street: data.logradouro || prev.street,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
          }));
        }
      }).catch(()=>{});
    }
  }, [addrForm.cep]);

  const saveAddress = async () => {
    if (!addrForm.cep || !addrForm.street || !addrForm.city || !addrForm.state) {
      setError('Endereço incompleto.');
      return;
    }
    if (auth?.isAuthenticated && consent) {
      try {
        const { data } = await api.post('/addresses', {
          postalCode: addrForm.cep.replace(/\D/g,''),
          street: addrForm.street,
          city: addrForm.city,
          state: addrForm.state,
          country: 'Brazil',
          addressLine2: addrForm.addressLine2 || undefined,
          type: 'SHIPPING',
        });
        setAddresses((prev)=>[data, ...prev]);
        setSelectedAddressId(data.id);
        setError('');
      } catch (e) {
        setError('Falha ao salvar endereço.');
      }
    } else {
      setError('Faça login para salvar endereço.');
    }
  };

  if (loading) return <div className="p-10 text-center">Carregando carrinho...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700">{error}</div>}
      <h1 className="text-2xl font-semibold mb-6">Seu Carrinho</h1>
      {items.length === 0 ? (
        <div className="text-gray-600">Seu carrinho está vazio.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((it, idx) => (
              console.log(it),
              <div key={idx} className="flex items-center justify-between border p-4">
                <div className="flex-1">
                  <div className="text-sm text-gray-500">{it.product?.brand?.name}</div>
                  <div className="font-medium">{it.product?.name}</div>
                  <div className="text-sm text-gray-600">
                    {it.variant?.attributes?.map(a => a.attributeValue.attribute.name + ': ' + a.attributeValue.value).join(' / ')}
                  </div>
                  <div className="text-sm text-gray-600">SKU {it.variant?.sku}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => changeQty(idx, it.quantity - 1)} className="px-2 border">-</button>
                  <div className="w-10 text-center">{it.quantity}</div>
                  <button onClick={() => changeQty(idx, it.quantity + 1)} className="px-2 border">+</button>
                </div>
                <div className="w-24 text-right">R$ {Number(it.variant?.price || it.product?.basePrice || 0).toFixed(2)}</div>
                <button onClick={() => removeItem(idx)} className="ml-4 text-red-600">Remover</button>
              </div>
            ))}
          </div>
          <div className="border p-4 space-y-4">
            <div>
              <h2 className="font-semibold mb-2">Endereço de entrega</h2>
              {auth?.isAuthenticated && addresses.length > 0 && (
                <select value={selectedAddressId} onChange={(e)=>setSelectedAddressId(e.target.value)} className="w-full border p-2 mb-3">
                  {addresses.map(a => (
                    <option key={a.id} value={a.id}>{a.street}, {a.city} - {a.state}</option>
                  ))}
                </select>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input name="cep" value={addrForm.cep} onChange={onAddrChange} placeholder="CEP" className="border p-2" />
                <input name="street" value={addrForm.street} onChange={onAddrChange} placeholder="Rua" className="border p-2 sm:col-span-2" />
                <input name="city" value={addrForm.city} onChange={onAddrChange} placeholder="Cidade" className="border p-2" />
                <input name="state" value={addrForm.state} onChange={onAddrChange} placeholder="Estado" className="border p-2" />
                <input name="addressLine2" value={addrForm.addressLine2} onChange={onAddrChange} placeholder="Complemento" className="border p-2 sm:col-span-2" />
              </div>
              <button onClick={saveAddress} className="mt-2 w-full border p-2">Salvar endereço</button>
            </div>
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            <button className="mt-4 w-full bg-black text-white py-2">Finalizar compra</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
