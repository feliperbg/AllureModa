"use client";

import { Users, Package, CreditCard, DollarSign, AlertTriangle, TrendingUp, Clock, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useAdminStats, DashboardStats } from "@/hooks/useAdminStats";

function StatCard({
    title,
    value,
    icon,
    unit = "",
    trend,
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    unit?: string;
    trend?: { value: number; label: string };
}) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl">
            <div className="flex items-center justify-between">
                <div className="p-3 bg-allure-beige rounded-full">{icon}</div>
                {trend && (
                    <span className={`text-xs px-2 py-1 rounded-full ${trend.value >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {trend.value >= 0 ? "+" : ""}{trend.value}%
                    </span>
                )}
            </div>
            <div className="mt-4">
                <div className="text-sm font-medium text-allure-grey">{title}</div>
                <div className="text-2xl font-bold text-allure-black">
                    {unit}{value}
                </div>
            </div>
        </div>
    );
}

function MiniBarChart({ data }: { data: Array<{ date: string; revenue: number }> }) {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.revenue));
    const lastDays = data.slice(-14); // Show last 14 days

    return (
        <div className="flex items-end gap-1 h-24">
            {lastDays.map((d, i) => {
                const height = maxValue > 0 ? (d.revenue / maxValue) * 100 : 0;
                return (
                    <div
                        key={i}
                        className="flex-1 bg-allure-gold/70 rounded-t hover:bg-allure-gold transition-colors"
                        style={{ height: `${Math.max(height, 4)}%` }}
                        title={`${new Date(d.date).toLocaleDateString("pt-BR")}: R$ ${d.revenue.toFixed(2)}`}
                    />
                );
            })}
        </div>
    );
}

function OrderStatusPie({ data }: { data: Array<{ status: string; count: number }> }) {
    if (!data || data.length === 0) return null;

    const total = data.reduce((sum, d) => sum + d.count, 0);
    const colors: Record<string, string> = {
        PENDING: "#fbbf24",
        PROCESSING: "#3b82f6",
        SHIPPED: "#8b5cf6",
        DELIVERED: "#22c55e",
        CANCELLED: "#ef4444",
    };
    const labels: Record<string, string> = {
        PENDING: "Aguardando",
        PROCESSING: "Processando",
        SHIPPED: "Enviado",
        DELIVERED: "Entregue",
        CANCELLED: "Cancelado",
    };

    return (
        <div className="space-y-2">
            {data.map((d) => {
                const percent = total > 0 ? (d.count / total) * 100 : 0;
                return (
                    <div key={d.status} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: colors[d.status] || "#ccc" }}
                        />
                        <span className="flex-1 text-sm text-gray-600">{labels[d.status] || d.status}</span>
                        <span className="text-sm font-medium">{d.count}</span>
                        <span className="text-xs text-gray-400 w-10 text-right">{percent.toFixed(0)}%</span>
                    </div>
                );
            })}
        </div>
    );
}

export default function AdminDashboard() {
    const { data: stats, isLoading: loading, isError } = useAdminStats();

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-xl shadow-lg p-6 h-32 animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-lg p-6 h-64 animate-pulse" />
                    <div className="bg-white rounded-xl shadow-lg p-6 h-64 animate-pulse" />
                </div>
            </div>
        );
    }

    if (isError || !stats) {
        return (
            <div className="p-10 text-center">
                <p className="text-red-600 mb-4">Falha ao carregar estatísticas ou acesso negado.</p>
                <p className="text-gray-500">Você precisa estar logado como admin para acessar.</p>
            </div>
        );
    }

    const formatCurrency = (value: number) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
        return value.toFixed(2);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold font-serif text-allure-black">Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Receita Total"
                    value={formatCurrency(stats.metrics.totalRevenue)}
                    unit="R$ "
                    icon={<DollarSign className="w-6 h-6 text-allure-black" />}
                />
                <StatCard
                    title="Pedidos"
                    value={stats.metrics.totalOrders}
                    icon={<CreditCard className="w-6 h-6 text-allure-black" />}
                />
                <StatCard
                    title="Clientes"
                    value={stats.metrics.totalCustomers}
                    icon={<Users className="w-6 h-6 text-allure-black" />}
                />
                <StatCard
                    title="Produtos"
                    value={stats.metrics.totalProducts}
                    icon={<Package className="w-6 h-6 text-allure-black" />}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-allure-black flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Receita (Últimos 14 dias)
                        </h2>
                    </div>
                    <MiniBarChart data={stats.dailyRevenue} />
                    <div className="mt-4 text-sm text-gray-500">
                        Total período: R$ {stats.dailyRevenue.reduce((sum, d) => sum + d.revenue, 0).toFixed(2).replace(".", ",")}
                    </div>
                </div>

                {/* Orders by Status */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold text-allure-black mb-4 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Pedidos por Status
                    </h2>
                    <OrderStatusPie data={stats.ordersByStatus} />
                </div>
            </div>

            {/* Low Stock Alert */}
            {stats.lowStockProducts && stats.lowStockProducts.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Estoque Baixo ({stats.lowStockProducts.length} produtos)
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {stats.lowStockProducts.map((p) => (
                            <div key={p.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-amber-100">
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">{p.productName}</p>
                                    <p className="text-xs text-gray-500">SKU: {p.sku}</p>
                                </div>
                                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-sm font-medium">
                                    {p.stockQuantity} un
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Orders & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-allure-black flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Pedidos Recentes
                        </h2>
                        <Link href="/admin/orders" className="text-sm text-allure-gold hover:underline">
                            Ver todos
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {stats.recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                <div>
                                    <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                                    <p className="text-xs text-gray-500">{order.customerName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">R$ {order.total.toFixed(2).replace(".", ",")}</p>
                                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString("pt-BR")}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold text-allure-black mb-4">🏆 Mais Vendidos</h2>
                    <div className="space-y-3">
                        {stats.topProducts.map((p, i) => (
                            <div key={p.productId} className="flex items-center gap-3 py-2 border-b last:border-0">
                                <span className="w-6 h-6 flex items-center justify-center bg-allure-beige rounded-full text-sm font-bold">
                                    {i + 1}
                                </span>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{p.productName}</p>
                                    <p className="text-xs text-gray-500">{p.quantitySold} vendidos</p>
                                </div>
                                <p className="font-medium text-allure-gold">R$ {p.revenue.toFixed(2).replace(".", ",")}</p>
                            </div>
                        ))}
                        {stats.topProducts.length === 0 && (
                            <p className="text-gray-500 text-center py-4">Nenhum produto vendido ainda</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
