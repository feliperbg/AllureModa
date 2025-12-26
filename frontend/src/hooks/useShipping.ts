import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface ShippingOption {
    id: string;
    name: string;
    company: string;
    price: number;
    deliveryDays: number;
    error?: string;
}

export interface ShippingQuoteResponse {
    options: ShippingOption[];
}

export interface ShippingCalculateRequest {
    cepDestino: string;
    weight?: number;
    height?: number;
    width?: number;
    length?: number;
    productValue?: number;
}

export function useCalculateShipping() {
    return useMutation({
        mutationFn: async (request: ShippingCalculateRequest) => {
            const { data } = await api.post<ShippingQuoteResponse>("/shipping/calculate", request);
            return data;
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || "Erro ao calcular frete";
            toast.error(message);
        },
    });
}

// Helper to format CEP
export function formatCep(cep: string): string {
    const digits = cep.replace(/\D/g, "");
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
}
