"use client";

import Link from "next/link";
import { Package, ChevronRight, Clock, Truck, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useOrders, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/hooks/useOrders";
import { getImageUrl } from "@/components/shop/ProductImage";

export default function OrderHistoryPage() {
    const { data: orders = [], isLoading, isError } = useOrders();

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold font-serif text-allure-black mb-8">Meus Pedidos</h1>
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-gray-100 h-32 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold font-serif text-allure-black mb-4">Meus Pedidos</h1>
                <p className="text-red-500">Erro ao carregar pedidos. Tente novamente.</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h1 className="text-2xl font-bold font-serif text-allure-black mb-4">Nenhum pedido ainda</h1>
                <p className="text-gray-600 mb-8">Você ainda não fez nenhum pedido.</p>
                <Link
                    href="/products"
                    className="inline-block px-8 py-3 bg-allure-black text-white font-medium hover:bg-gray-800"
                >
                    Explorar Produtos
                </Link>
            </div>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "PENDING":
            case "PROCESSING":
                return <Clock className="h-5 w-5" />;
            case "SHIPPED":
                return <Truck className="h-5 w-5" />;
            case "DELIVERED":
                return <CheckCircle className="h-5 w-5" />;
            case "CANCELLED":
                return <XCircle className="h-5 w-5" />;
            default:
                return <Package className="h-5 w-5" />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold font-serif text-allure-black mb-8">
                Meus Pedidos ({orders.length})
            </h1>

            <div className="space-y-4">
                {orders.map((order) => {
                    const firstItem = order.items[0];
                    const additionalItems = order.items.length - 1;
                    const formattedDate = new Date(order.createdAt).toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    });

                    return (
                        <Link
                            key={order.id}
                            href={`/account/orders/${order.id}`}
                            className="block bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between gap-4">
                                {/* Order Info */}
                                <div className="flex gap-4 flex-1">
                                    {/* Product Image */}
                                    {firstItem?.productVariant?.product?.images?.[0] && (
                                        <img
                                            src={getImageUrl(firstItem.productVariant.product.images[0], "thumbnail")}
                                            alt={firstItem.productVariant.product.name}
                                            className="w-16 h-20 object-cover rounded"
                                        />
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-gray-900">
                                                Pedido #{order.orderNumber}
                                            </span>
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status]
                                                    }`}
                                            >
                                                {getStatusIcon(order.status)}
                                                {ORDER_STATUS_LABELS[order.status]}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">{formattedDate}</p>
                                        <p className="text-sm text-gray-700 mt-1 truncate">
                                            {firstItem?.productVariant?.product?.name}
                                            {additionalItems > 0 && (
                                                <span className="text-gray-500">
                                                    {" "}
                                                    +{additionalItems} {additionalItems === 1 ? "item" : "itens"}
                                                </span>
                                            )}
                                        </p>
                                        {order.trackingCode && (
                                            <p className="text-xs text-allure-gold mt-1">
                                                Rastreio: {order.trackingCode}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Price & Arrow */}
                                <div className="text-right flex items-center gap-2">
                                    <div>
                                        <p className="font-bold text-allure-black">
                                            R$ {order.total.toFixed(2).replace(".", ",")}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {order.items.reduce((sum, item) => sum + item.quantity, 0)} itens
                                        </p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
