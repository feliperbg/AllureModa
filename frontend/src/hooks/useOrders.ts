import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface OrderItem {
    id: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productVariant: {
        id: string;
        sku: string;
        product: {
            id: string;
            name: string;
            slug: string;
            images: { url: string; thumbnailUrl?: string }[];
        };
        attributes: Array<{
            attributeValue: {
                value: string;
                attribute: { name: string };
            };
        }>;
    };
}

export interface Order {
    id: string;
    orderNumber: string;
    status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    subtotal: number;
    shippingCost: number;
    discount: number;
    total: number;
    trackingCode?: string;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
    shippingAddress?: {
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
    };
    payments: Payment[];
}

export interface Payment {
    id: string;
    method: "PIX" | "BOLETO" | "CREDIT_CARD";
    status: string;
    value: number;
    pixQrCode?: string;
    pixCopyPaste?: string;
    bankSlipUrl?: string;
    invoiceUrl?: string;
}

export function useOrders() {
    return useQuery({
        queryKey: ["orders"],
        queryFn: async () => {
            const { data } = await api.get<Order[]>("/orders/my");
            return data;
        },
    });
}

export function useOrder(orderId: string) {
    return useQuery({
        queryKey: ["orders", orderId],
        queryFn: async () => {
            const { data } = await api.get<Order>(`/orders/${orderId}`);
            return data;
        },
        enabled: !!orderId,
    });
}

export const ORDER_STATUS_LABELS: Record<Order["status"], string> = {
    PENDING: "Aguardando",
    PROCESSING: "Em Processamento",
    SHIPPED: "Enviado",
    DELIVERED: "Entregue",
    CANCELLED: "Cancelado",
};

export const PAYMENT_STATUS_LABELS: Record<Order["paymentStatus"], string> = {
    PENDING: "Aguardando Pagamento",
    PAID: "Pago",
    FAILED: "Falhou",
    REFUNDED: "Reembolsado",
};

export const ORDER_STATUS_COLORS: Record<Order["status"], string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
};
