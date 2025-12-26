"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Package, Clock, Truck, CheckCircle, XCircle, MapPin, Copy, ScanLine, FileText } from "lucide-react";
import { useOrder, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_STATUS_LABELS } from "@/hooks/useOrders";
import { getImageUrl } from "@/components/shop/ProductImage";
import { toast } from "sonner";

export default function OrderDetailPage() {
    const params = useParams();
    const orderId = params.id as string;
    const { data: order, isLoading, isError } = useOrder(orderId);

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3" />
                    <div className="h-48 bg-gray-100 rounded-lg" />
                    <div className="h-32 bg-gray-100 rounded-lg" />
                </div>
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 text-center">
                <p className="text-red-500">Pedido não encontrado.</p>
                <Link href="/account/orders" className="text-allure-gold hover:underline mt-4 inline-block">
                    Voltar para meus pedidos
                </Link>
            </div>
        );
    }

    const formattedDate = new Date(order.createdAt).toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const copyTrackingCode = () => {
        if (order.trackingCode) {
            navigator.clipboard.writeText(order.trackingCode);
            toast.success("Código de rastreio copiado!");
        }
    };

    // Timeline steps
    const timelineSteps = [
        { status: "PENDING", label: "Pedido Realizado", icon: Clock },
        { status: "PROCESSING", label: "Em Processamento", icon: Package },
        { status: "SHIPPED", label: "Enviado", icon: Truck },
        { status: "DELIVERED", label: "Entregue", icon: CheckCircle },
    ];

    const currentStepIndex = order.status === "CANCELLED"
        ? -1
        : timelineSteps.findIndex((s) => s.status === order.status);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/account/orders"
                    className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Voltar para meus pedidos
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold font-serif text-allure-black">
                            Pedido #{order.orderNumber}
                        </h1>
                        <p className="text-sm text-gray-500">{formattedDate}</p>
                    </div>
                    <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${ORDER_STATUS_COLORS[order.status]
                            }`}
                    >
                        {ORDER_STATUS_LABELS[order.status]}
                    </span>
                </div>
            </div>

            {/* Status Timeline */}
            {order.status !== "CANCELLED" && (
                <div className="bg-white border rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Status do Pedido</h2>
                    <div className="flex items-center justify-between">
                        {timelineSteps.map((step, index) => {
                            const Icon = step.icon;
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;
                            return (
                                <div key={step.status} className="flex flex-col items-center relative flex-1">
                                    {index > 0 && (
                                        <div
                                            className={`absolute left-0 right-1/2 top-4 h-0.5 -translate-y-1/2 ${isCompleted ? "bg-green-500" : "bg-gray-200"
                                                }`}
                                        />
                                    )}
                                    {index < timelineSteps.length - 1 && (
                                        <div
                                            className={`absolute left-1/2 right-0 top-4 h-0.5 -translate-y-1/2 ${index < currentStepIndex ? "bg-green-500" : "bg-gray-200"
                                                }`}
                                        />
                                    )}
                                    <div
                                        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${isCompleted
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-200 text-gray-400"
                                            } ${isCurrent ? "ring-4 ring-green-100" : ""}`}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <span
                                        className={`mt-2 text-xs text-center ${isCompleted ? "text-gray-900 font-medium" : "text-gray-400"
                                            }`}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Payment Section (Pending) */}
            {order.paymentStatus === "PENDING" && order.status !== "CANCELLED" && order.payments?.some(p => p.status === "PENDING") && (
                <div className="bg-white border rounded-lg p-6 mb-6 border-allure-gold/30 ring-1 ring-allure-gold/20">
                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <span className="bg-allure-gold/10 p-1.5 rounded-full text-allure-gold">
                            {order.payments.find(p => p.status === "PENDING")?.method === "PIX" ? <ScanLine className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                        </span>
                        Pagamento Pendente
                    </h2>

                    {order.payments.filter(p => p.status === "PENDING").map(payment => (
                        <div key={payment.id} className="space-y-4">
                            {payment.method === "PIX" && payment.pixQrCode && (
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <p className="text-sm text-gray-600">Escaneie o QR Code abaixo com o app do seu banco:</p>
                                    <div className="bg-white p-2 border rounded-lg shadow-sm">
                                        <img
                                            src={`data:image/png;base64,${payment.pixQrCode}`}
                                            alt="QR Code Pix"
                                            className="w-48 h-48 object-contain"
                                        />
                                    </div>
                                    <div className="w-full max-w-md">
                                        <p className="text-xs text-gray-500 mb-1 text-left">Ou copie e cole o código:</p>
                                        <div className="flex gap-2">
                                            <input
                                                readOnly
                                                value={payment.pixCopyPaste}
                                                className="flex-1 text-xs border p-2 rounded bg-gray-50 text-gray-600 truncate"
                                            />
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(payment.pixCopyPaste || "");
                                                    toast.success("Código Pix copiado!");
                                                }}
                                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition"
                                                title="Copiar Código"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {payment.method === "BOLETO" && payment.bankSlipUrl && (
                                <div className="text-center space-y-4">
                                    <p className="text-sm text-gray-600">Clique no botão abaixo para visualizar e imprimir seu boleto:</p>
                                    <a
                                        href={payment.bankSlipUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-allure-black text-white rounded-lg hover:bg-gray-800 transition shadow-sm"
                                    >
                                        <FileText className="h-4 w-4" />
                                        Visualizar Boleto
                                    </a>
                                    <p className="text-xs text-gray-500">A compensação pode levar até 3 dias úteis.</p>
                                </div>
                            )}

                            {payment.method === "CREDIT_CARD" && (
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-gray-700">Seu pagamento está sendo processado.</p>
                                    <p className="text-sm text-gray-500">Você receberá uma confirmação em breve.</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Cancelled Notice */}
            {order.status === "CANCELLED" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                    <XCircle className="h-6 w-6 text-red-500" />
                    <div>
                        <p className="font-medium text-red-800">Pedido Cancelado</p>
                        <p className="text-sm text-red-600">Este pedido foi cancelado.</p>
                    </div>
                </div>
            )}

            {/* Tracking Code */}
            {order.trackingCode && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Truck className="h-5 w-5 text-purple-600" />
                            <div>
                                <p className="text-sm text-purple-800">Código de Rastreio</p>
                                <p className="font-mono font-medium text-purple-900">{order.trackingCode}</p>
                            </div>
                        </div>
                        <button
                            onClick={copyTrackingCode}
                            className="p-2 text-purple-600 hover:bg-purple-100 rounded"
                        >
                            <Copy className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Order Items */}
            <div className="bg-white border rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Itens do Pedido</h2>
                <div className="divide-y">
                    {order.items.map((item) => {
                        const product = item.productVariant?.product;
                        const attributes = item.productVariant?.attributes || [];
                        return (
                            <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                                {product?.images?.[0] && (
                                    <img
                                        src={getImageUrl(product.images[0], "thumbnail")}
                                        alt={product.name}
                                        className="w-16 h-20 object-cover rounded"
                                    />
                                )}
                                <div className="flex-1">
                                    <Link
                                        href={`/products/${product?.slug}`}
                                        className="font-medium text-gray-900 hover:text-allure-gold"
                                    >
                                        {product?.name || "Produto"}
                                    </Link>
                                    <div className="text-sm text-gray-500 mt-1">
                                        {attributes.map((a) => a.attributeValue.value).join(" / ")}
                                    </div>
                                    <div className="text-sm text-gray-500">Quantidade: {item.quantity}</div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">
                                        R$ {item.totalPrice.toFixed(2).replace(".", ",")}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        R$ {item.unitPrice.toFixed(2).replace(".", ",")} cada
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white border rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Resumo</h2>
                <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <dt className="text-gray-500">Subtotal</dt>
                        <dd className="text-gray-900">R$ {order.subtotal.toFixed(2).replace(".", ",")}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-gray-500">Frete</dt>
                        <dd className="text-gray-900">R$ {order.shippingCost.toFixed(2).replace(".", ",")}</dd>
                    </div>
                    {order.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <dt>Desconto</dt>
                            <dd>- R$ {order.discount.toFixed(2).replace(".", ",")}</dd>
                        </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-bold text-base">
                        <dt>Total</dt>
                        <dd>R$ {order.total.toFixed(2).replace(".", ",")}</dd>
                    </div>
                </dl>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
                <div className="bg-white border rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Endereço de Entrega
                    </h2>
                    <address className="not-italic text-sm text-gray-700">
                        <p>
                            {order.shippingAddress.street}, {order.shippingAddress.number}
                            {order.shippingAddress.complement && ` - ${order.shippingAddress.complement}`}
                        </p>
                        <p>{order.shippingAddress.neighborhood}</p>
                        <p>
                            {order.shippingAddress.city} - {order.shippingAddress.state}
                        </p>
                        <p>CEP: {order.shippingAddress.zipCode}</p>
                    </address>
                </div>
            )}
        </div>
    );
}
