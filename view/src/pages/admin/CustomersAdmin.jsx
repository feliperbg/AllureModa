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

  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    // Removemos o max-w-7xl, etc. O AdminLayout cuida disso.
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-serif text-allure-black">Clientes e Pedidos</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Card de Clientes */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-allure-black mb-4">Clientes ({users.length})</h2>
          <div className="space-y-3 max-h-[600px] overflow-auto">
            {users.length > 0 ? users.map(u => (
              <div key={u.id} className="border border-gray-200 rounded-lg p-4">
                <div className="font-medium text-allure-black">{u.firstName} {u.lastName}</div>
                <div className="text-sm text-allure-grey">{u.email}</div>
              </div>
            )) : <p className="text-allure-grey">Nenhum cliente encontrado.</p>}
          </div>
        </div>
        
        {/* Card de Pedidos */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-allure-black mb-4">Pedidos ({orders.length})</h2>
          <div className="space-y-3 max-h-[600px] overflow-auto">
            {orders.length > 0 ? orders.map(o => (
              <div key={o.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-allure-black">Pedido #{o.id}</span>
                  <span className="text-sm font-semibold text-allure-black">R$ {o.totalPrice}</span>
                </div>
                <div className="text-sm text-allure-grey mt-1">{o.status}</div>
              </div>
            )) : <p className="text-allure-grey">Nenhum pedido encontrado.</p>}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default CustomersAdmin;