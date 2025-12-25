"use client";

import { useState } from "react";
import { Package, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { useOrder } from "@/hooks/useCustomer";

const statusMap: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Aguardando pagamento", color: "bg-yellow-100 text-yellow-800" },
    PAID: { label: "Pago", color: "bg-green-100 text-green-800" },
    PROCESSING: { label: "Preparando", color: "bg-blue-100 text-blue-800" },
    SHIPPED: { label: "Enviado", color: "bg-purple-100 text-purple-800" },
    DELIVERED: { label: "Entregue", color: "bg-green-100 text-green-800" },
    CANCELLED: { label: "Cancelado", color: "bg-red-100 text-red-800" },
};

export default function TrackOrderPage() {
    const [inputValue, setInputValue] = useState("");
    const [searchId, setSearchId] = useState("");

    const { data: order, isLoading, isError } = useOrder(searchId);

    const search = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            setSearchId(inputValue.trim());
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="text-center mb-8">
                <Package className="h-12 w-12 text-allure-gold mx-auto mb-4" />
                <h1 className="text-3xl font-serif text-allure-black mb-2">Rastrear Pedido</h1>
                <p className="text-gray-600">Digite o código do seu pedido para acompanhar</p>
            </div>

            <form onSubmit={search} className="flex gap-2 mb-8">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Código do pedido..."
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-allure-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Buscar"}
                </button>
            </form>

            {isError && (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg text-center">
                    Pedido não encontrado. Verifique o código e tente novamente.
                </div>
            )}

            {order && !isError && (
                <div className="bg-white border rounded-lg overflow-hidden">
                    <div className="p-6 border-b">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Pedido</p>
                                <p className="text-lg font-semibold">#{order.id.slice(0, 8)}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusMap[order.status]?.color || "bg-gray-100"}`}>
                                {statusMap[order.status]?.label || order.status}
                            </span>
                        </div>
                    </div>

                    <div className="p-6">
                        <h3 className="font-semibold mb-4">Itens do Pedido</h3>
                        <div className="space-y-3">
                            {order.items?.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span>{item.productVariant?.product?.name || "Produto"}</span>
                                    <span className="text-gray-500">Qtd: {item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t flex justify-between">
                            <span className="font-semibold">Total</span>
                            <span className="font-bold text-lg">
                                R$ {order.totalPrice.toFixed(2).replace(".", ",")}
                            </span>
                        </div>

                        <div className="mt-4 text-sm text-gray-500">
                            Pedido realizado em {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 border-t">
                        <Link
                            href="/account"
                            className="text-allure-gold hover:underline text-sm"
                        >
                            Ver todos os meus pedidos →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
