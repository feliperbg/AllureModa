"use client";

import { useState } from "react";
import { Users, ShoppingBag, Eye, Mail, Phone, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import {
    useAdminUsers,
    useAdminOrders,
    useUpdateOrderStatus
} from "@/hooks/useAdmin";

const statusMap: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
    PAID: { label: "Pago", color: "bg-green-100 text-green-800" },
    PROCESSING: { label: "Processando", color: "bg-blue-100 text-blue-800" },
    SHIPPED: { label: "Enviado", color: "bg-purple-100 text-purple-800" },
    DELIVERED: { label: "Entregue", color: "bg-green-100 text-green-800" },
    CANCELLED: { label: "Cancelado", color: "bg-red-100 text-red-800" },
};

export default function CustomersPage() {
    const { data: users = [], isLoading: loadingUsers, isError: errorUsers } = useAdminUsers();
    const { data: orders = [], isLoading: loadingOrders, isError: errorOrders } = useAdminOrders();
    const { mutate: updateStatus } = useUpdateOrderStatus();

    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
    const [tab, setTab] = useState<"users" | "orders">("users");

    const loading = loadingUsers || loadingOrders;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-allure-gold" />
            </div>
        );
    }

    if (errorUsers || errorOrders) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-600 mb-4">Erro ao carregar dados. Verifique suas permissões.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-serif text-allure-black">
                Clientes & Pedidos
            </h1>

            {/* Tabs */}
            <div className="flex gap-4 border-b">
                <button
                    onClick={() => setTab("users")}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${tab === "users"
                        ? "border-allure-gold text-allure-black"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <Users className="h-5 w-5" />
                    Clientes ({users.length})
                </button>
                <button
                    onClick={() => setTab("orders")}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${tab === "orders"
                        ? "border-allure-gold text-allure-black"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <ShoppingBag className="h-5 w-5" />
                    Pedidos ({orders.length})
                </button>
            </div>

            {/* Users Tab */}
            {tab === "users" && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Cliente
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Contato
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Cadastro
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Tipo
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-allure-black">
                                            {u.firstName} {u.lastName}
                                        </div>
                                        {u.cpf && <div className="text-sm text-gray-500">CPF: {u.cpf}</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-sm">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            {u.email}
                                        </div>
                                        {u.phone && (
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                                {u.phone}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${u.role === "ADMIN"
                                                ? "bg-purple-100 text-purple-800"
                                                : "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {u.role}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {users.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>Nenhum cliente cadastrado</p>
                        </div>
                    )}
                </div>
            )}

            {/* Orders Tab */}
            {tab === "orders" && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Pedido
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Cliente
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Data
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {orders.map((o) => (
                                <>
                                    <tr key={o.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-sm">#{o.id.slice(0, 8)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                {o.user?.firstName} {o.user?.lastName}
                                            </div>
                                            <div className="text-xs text-gray-500">{o.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            R$ {o.totalPrice.toFixed(2).replace(".", ",")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={o.status}
                                                onChange={(e) => updateStatus({ id: o.id, status: e.target.value })}
                                                className={`text-xs px-2 py-1 rounded-full border-0 ${statusMap[o.status]?.color || "bg-gray-100"
                                                    }`}
                                            >
                                                {Object.entries(statusMap).map(([key, val]) => (
                                                    <option key={key} value={key}>
                                                        {val.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(o.createdAt).toLocaleDateString("pt-BR")}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() =>
                                                    setSelectedOrder(selectedOrder === o.id ? null : o.id)
                                                }
                                                className="p-2 text-gray-600 hover:text-allure-gold"
                                            >
                                                {selectedOrder === o.id ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                    {selectedOrder === o.id && o.items && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 bg-gray-50">
                                                <div className="text-sm font-medium mb-2">Itens do pedido:</div>
                                                <div className="space-y-2">
                                                    {o.items.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex justify-between text-sm text-gray-600"
                                                        >
                                                            <span>
                                                                {item.productVariant?.product?.name || "Produto"} x{" "}
                                                                {item.quantity}
                                                            </span>
                                                            <span>R$ {(item.unitPrice * item.quantity).toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>

                    {orders.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>Nenhum pedido encontrado</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
