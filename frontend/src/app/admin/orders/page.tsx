"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Filter, ChevronDown, Eye, Truck, Loader2 } from "lucide-react";
import { useAdminOrders, useUpdateOrderStatus, useUpdateTrackingCode } from "@/hooks/useAdminOrders";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_STATUS_LABELS, Order } from "@/hooks/useOrders";
import { getImageUrl } from "@/components/shop/ProductImage";

const ORDER_STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export default function AdminOrdersPage() {
    const [statusFilter, setStatusFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [trackingInput, setTrackingInput] = useState("");

    const { data: orders = [], isLoading, isError } = useAdminOrders({
        status: statusFilter,
        search: searchQuery,
    });

    const { mutate: updateStatus, isPending: updatingStatus } = useUpdateOrderStatus();
    const { mutate: updateTracking, isPending: updatingTracking } = useUpdateTrackingCode();

    const handleStatusChange = (orderId: string, newStatus: string) => {
        updateStatus({ orderId, status: newStatus });
    };

    const handleTrackingUpdate = (orderId: string) => {
        if (trackingInput.trim()) {
            updateTracking({ orderId, trackingCode: trackingInput.trim() });
            setTrackingInput("");
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
                <div className="bg-white rounded-xl p-6 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-10 text-center text-red-500">
                Erro ao carregar pedidos. Verifique suas permissões.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-serif text-allure-black">Gestão de Pedidos</h1>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por número do pedido ou cliente..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-allure-gold focus:border-transparent"
                    />
                </div>
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="appearance-none pl-4 pr-10 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-allure-gold"
                    >
                        <option value="">Todos os Status</option>
                        {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                                {ORDER_STATUS_LABELS[status]}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagamento</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <span className="font-medium">#{order.orderNumber}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {/* Customer would be populated from API */}
                                        Cliente
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                                    </td>
                                    <td className="px-4 py-3 font-medium">
                                        R$ {order.total.toFixed(2).replace(".", ",")}
                                    </td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            disabled={updatingStatus}
                                            className={`text-xs px-2 py-1 rounded-full font-medium border-0 ${ORDER_STATUS_COLORS[order.status]}`}
                                        >
                                            {ORDER_STATUSES.map((status) => (
                                                <option key={status} value={status}>
                                                    {ORDER_STATUS_LABELS[status]}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${order.paymentStatus === "PAID" ? "bg-green-100 text-green-800" :
                                                order.paymentStatus === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                                                    "bg-red-100 text-red-800"
                                            }`}>
                                            {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2 hover:bg-gray-100 rounded"
                                                title="Ver detalhes"
                                            >
                                                <Eye className="h-4 w-4 text-gray-600" />
                                            </button>
                                            {order.status === "SHIPPED" && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setTrackingInput(order.trackingCode || "");
                                                    }}
                                                    className="p-2 hover:bg-gray-100 rounded"
                                                    title="Atualizar rastreio"
                                                >
                                                    <Truck className="h-4 w-4 text-purple-600" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {orders.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        Nenhum pedido encontrado
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedOrder(null)} />
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Pedido #{selectedOrder.orderNumber}</h2>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-3 mb-6">
                                <h3 className="font-medium text-gray-900">Itens</h3>
                                {selectedOrder.items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 py-2 border-b">
                                        {item.productVariant?.product?.images?.[0] && (
                                            <img
                                                src={getImageUrl(item.productVariant.product.images[0], "thumbnail")}
                                                alt=""
                                                className="w-12 h-14 object-cover rounded"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-medium">{item.productVariant?.product?.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {item.productVariant?.attributes?.map(a => a.attributeValue.value).join(" / ")}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p>{item.quantity}x R$ {item.unitPrice.toFixed(2).replace(".", ",")}</p>
                                            <p className="font-medium">R$ {item.totalPrice.toFixed(2).replace(".", ",")}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Tracking */}
                            <div className="mb-6">
                                <h3 className="font-medium text-gray-900 mb-2">Código de Rastreio</h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={trackingInput || selectedOrder.trackingCode || ""}
                                        onChange={(e) => setTrackingInput(e.target.value)}
                                        placeholder="Digite o código de rastreio"
                                        className="flex-1 border rounded px-3 py-2"
                                    />
                                    <button
                                        onClick={() => handleTrackingUpdate(selectedOrder.id)}
                                        disabled={updatingTracking}
                                        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {updatingTracking && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Salvar
                                    </button>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex justify-between mb-1">
                                    <span>Subtotal</span>
                                    <span>R$ {selectedOrder.subtotal.toFixed(2).replace(".", ",")}</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span>Frete</span>
                                    <span>R$ {selectedOrder.shippingCost.toFixed(2).replace(".", ",")}</span>
                                </div>
                                {selectedOrder.discount > 0 && (
                                    <div className="flex justify-between mb-1 text-green-600">
                                        <span>Desconto</span>
                                        <span>- R$ {selectedOrder.discount.toFixed(2).replace(".", ",")}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                                    <span>Total</span>
                                    <span>R$ {selectedOrder.total.toFixed(2).replace(".", ",")}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
