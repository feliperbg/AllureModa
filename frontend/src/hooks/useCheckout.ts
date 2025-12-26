import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

// Types
export interface Address {
    id: string;
    recipientName?: string;
    phone?: string;
    street: string;
    number: string;
    neighborhood?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    addressLine2?: string;
    type: "SHIPPING" | "BILLING";
    isDefault: boolean;
}

export interface AddressInput {
    recipientName?: string;
    phone?: string;
    street: string;
    number: string;
    neighborhood?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
    addressLine2?: string;
    type?: "SHIPPING" | "BILLING";
    isDefault?: boolean;
}

export interface CheckoutSummary {
    items: Array<{
        id: string;
        productVariantId: string;
        productName: string;
        sku: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }>;
    subtotal: number;
    itemCount: number;
}

export interface CheckoutRequest {
    shippingAddressId: string;
    billingAddressId?: string;
    shippingCost: number;
    paymentMethod: "PIX" | "BOLETO" | "CREDIT_CARD";
    creditCardToken?: string;
    creditCard?: {
        holderName: string;
        number: string;
        expiryMonth: string;
        expiryYear: string;
        ccv: string;
    };
}

export interface CheckoutResponse {
    orderId: string;
    orderNumber: string;
    paymentId?: string;
    paymentMethod: string;
    pixQrCode?: string;
    pixCopyPaste?: string;
    boletoUrl?: string;
    subtotal: number;
    shippingCost: number;
    totalPrice: number;
}

// Address Hooks
export function useAddresses() {
    return useQuery({
        queryKey: ["addresses"],
        queryFn: async () => {
            const { data } = await api.get<Address[]>("/addresses");
            return data;
        },
    });
}

export function useCreateAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (address: AddressInput) => {
            const { data } = await api.post<Address>("/addresses", address);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
            toast.success("Endereço salvo!");
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || "Erro ao salvar endereço";
            toast.error(message);
        },
    });
}

export function useUpdateAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...address }: AddressInput & { id: string }) => {
            const { data } = await api.put<Address>(`/addresses/${id}`, address);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
            toast.success("Endereço atualizado!");
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || "Erro ao atualizar endereço";
            toast.error(message);
        },
    });
}

export function useDeleteAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/addresses/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
            toast.success("Endereço excluído!");
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || "Erro ao excluir endereço";
            toast.error(message);
        },
    });
}

// Checkout Hooks
export function useCheckoutSummary() {
    return useQuery({
        queryKey: ["checkout", "summary"],
        queryFn: async () => {
            const { data } = await api.get<CheckoutSummary>("/checkout/summary");
            return data;
        },
    });
}

export function useProcessCheckout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: CheckoutRequest) => {
            const { data } = await api.post<CheckoutResponse>("/checkout", request);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || "Erro ao processar checkout";
            toast.error(message);
            throw error;
        },
    });
}
