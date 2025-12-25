"use client";

import { Users, Package, CreditCard, DollarSign } from "lucide-react";
import { useAdminStats } from "@/hooks/useAdmin";

function StatCard({
    title,
    value,
    icon,
    unit = "",
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    unit?: string;
}) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 flex items-center gap-4 transition-all hover:shadow-xl">
            <div className="p-3 bg-allure-beige rounded-full">{icon}</div>
            <div>
                <div className="text-sm font-medium text-allure-grey">{title}</div>
                <div className="text-2xl font-bold text-allure-black">
                    {unit}
                    {value}
                </div>
            </div>
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
                        <div key={i} className="bg-white rounded-xl shadow-lg p-6 h-24 animate-pulse" />
                    ))}
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

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold font-serif text-allure-black">Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Usuários"
                    value={stats.users}
                    icon={<Users className="w-6 h-6 text-allure-black" />}
                />
                <StatCard
                    title="Produtos"
                    value={stats.products}
                    icon={<Package className="w-6 h-6 text-allure-black" />}
                />
                <StatCard
                    title="Pedidos"
                    value={stats.orders}
                    icon={<CreditCard className="w-6 h-6 text-allure-black" />}
                />
                <StatCard
                    title="Receita"
                    value={Number(stats.revenue || 0).toFixed(2)}
                    unit="R$ "
                    icon={<DollarSign className="w-6 h-6 text-allure-black" />}
                />
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-allure-black mb-4">Mais Vendidos</h2>
                {stats.topProducts && stats.topProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.topProducts.map((p) => (
                            <div
                                key={p.id}
                                className="border border-gray-200 rounded-lg p-4 transition-all hover:shadow-md"
                            >
                                <div className="font-semibold text-allure-black">{p.name}</div>
                                <div className="text-sm text-allure-grey">{p.category?.name}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">Nenhum produto vendido ainda.</p>
                )}
            </div>
        </div>
    );
}

