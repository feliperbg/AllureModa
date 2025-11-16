import React from 'react';
import api from '../../api/axiosConfig';
import Chart from '../../components/Chart';

function AdminDashboard() {
  const [stats, setStats] = React.useState(null);
  const [error, setError] = React.useState('');

  React.useEffect(function() {
    api.get('/admin/stats').then(function({ data }) { setStats(data); }).catch(function(err) { setError(err.response?.data?.message || 'Falha ao carregar estatísticas'); });
  }, []);

  if (error) return <div className="p-10 text-center">{error}</div>;
  if (!stats) return <div className="p-10 text-center">Carregando...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Painel Administrativo</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border p-4"><div className="text-sm text-gray-600">Usuários</div><div className="text-2xl">{stats.users}</div></div>
        <div className="border p-4"><div className="text-sm text-gray-600">Produtos</div><div className="text-2xl">{stats.products}</div></div>
        <div className="border p-4"><div className="text-sm text-gray-600">Pedidos</div><div className="text-2xl">{stats.orders}</div></div>
        <div className="border p-4"><div className="text-sm text-gray-600">Receita</div><div className="text-2xl">R$ {Number(stats.revenue || 0).toFixed(2)}</div></div>
      </div>
      {stats.charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Chart type="line" data={stats.charts.users} title="Novos usuários (30 dias)" />
          <Chart type="bar" data={stats.charts.orders} title="Pedidos (30 dias)" />
          <Chart type="line" data={stats.charts.revenue} title="Receita (30 dias)" />
        </div>
      )}
      <div>
        <h2 className="font-semibold mb-2">Mais vendidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {stats.topProducts.map(function(p) {
            return (
              <div key={p.id} className="border p-3">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-600">{p.category?.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;