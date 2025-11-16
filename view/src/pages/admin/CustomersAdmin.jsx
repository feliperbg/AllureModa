import React from 'react';
import api from '../../api/axiosConfig';

const CustomersAdmin = () => {
  const [users, setUsers] = React.useState([]);
  const [orders, setOrders] = React.useState([]);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    Promise.all([
      api.get('/admin/users'),
      api.get('/admin/orders'),
    ]).then(([u,o])=>{ setUsers(u.data||[]); setOrders(o.data||[]); }).catch(()=>setError('Falha ao carregar dados'));
  }, []);

  if (error) return <div className="p-10 text-center">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h2 className="text-xl font-semibold mb-3">Clientes</h2>
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className="border p-3">
              <div className="font-medium">{u.firstName} {u.lastName}</div>
              <div className="text-sm text-gray-600">{u.email}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-3">Pedidos</h2>
        <div className="space-y-2">
          {orders.map(o => (
            <div key={o.id} className="border p-3">
              <div className="font-medium">#{o.id} • R$ {o.totalPrice}</div>
              <div className="text-sm text-gray-600">{o.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomersAdmin;
