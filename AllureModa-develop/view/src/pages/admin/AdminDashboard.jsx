import React from 'react';
import api from '../../api/axiosConfig';
import Chart from '../../components/Chart';
import { Users, Package, CreditCard, DollarSign } from 'lucide-react';

// Componente de Card de Estatística
const StatCard = ({ title, value, icon, unit = '' }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 flex items-center gap-4 transition-all hover:shadow-xl">
    <div className="p-3 bg-allure-beige rounded-full">
      {icon}
    </div>
    <div>
      <div className="text-sm font-medium text-allure-grey">{title}</div>
      <div className="text-2xl font-bold text-allure-black">{unit}{value}</div>
    </div>
  </div>
);

function AdminDashboard() {
  const [stats, setStats] = React.useState(null);
  const [error, setError] = React.useState('');

  React.useEffect(function() {
    api.get('/admin/stats').then(function({ data }) { setStats(data); }).catch(function(err) { setError(err.response?.data?.message || 'Falha ao carregar estatísticas'); });
  }, []);

  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;
  if (!stats) return <div className="p-10 text-center text-allure-grey">Carregando...</div>;

  return (
    // Removemos o max-w-7xl, etc. O AdminLayout cuida disso.
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-serif text-allure-black">Dashboard</h1>
      
      {/* Cards de Estatística Modernizados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Usuários" value={stats.users} icon={<Users className="w-6 h-6 text-allure-black" />} />
        <StatCard title="Produtos" value={stats.products} icon={<Package className="w-6 h-6 text-allure-black" />} />
        <StatCard title="Pedidos" value={stats.orders} icon={<CreditCard className="w-6 h-6 text-allure-black" />} />
        <StatCard title="Receita" value={Number(stats.revenue || 0).toFixed(2)} unit="R$ " icon={<DollarSign className="w-6 h-6 text-allure-black" />} />
      </div>
      
      {/* Gráficos (assumindo que o Chart existe) */}
      {stats.charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <Chart type="line" data={stats.charts.users} title="Novos usuários (30 dias)" />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <Chart type="bar" data={stats.charts.orders} title="Pedidos (30 dias)" />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
            <Chart type="line" data={stats.charts.revenue} title="Receita (30 dias)" />
          </div>
        </div>
      )}
      
      {/* Mais Vendidos */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-allure-black mb-4">Mais vendidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.topProducts.map(function(p) {
            return (
              <div key={p.id} className="border border-gray-200 rounded-lg p-4 transition-all hover:shadow-md">
                <div className="font-semibold text-allure-black">{p.name}</div>
                <div className="text-sm text-allure-grey">{p.category?.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;