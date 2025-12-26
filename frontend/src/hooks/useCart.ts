import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface CartItem {
    id: string;
    quantity: number;
    productVariantId: string;
    product?: {
        name: string;
        basePrice: number;
        brand?: { name: string };
    };
    variant?: {
        sku: string;
        price?: number;
        attributes?: {
            attributeValue: {
                value: string;
                attribute: { name: string };
            };
        }[];
    };
}

export function useCart() {
    return useQuery({
        queryKey: ["cart"],
        queryFn: async () => {
            const { data } = await api.get<{ items: any[] }>("/cart");
            const normalized = (data.items || []).map((ci: any) => ({
                id: ci.id,
                quantity: ci.quantity,
                productVariantId: ci.productVariantId,
                product: ci.productVariant?.product || null,
                variant: ci.productVariant || null,
            }));
            return normalized as CartItem[];
        },
    });
}

export function useAddToCart() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ productVariantId, quantity }: { productVariantId: string; quantity: number }) => {
            await api.put("/cart", { productVariantId, quantity });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            toast.success("Produto adicionado ao carrinho!");
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || "Erro ao adicionar ao carrinho";
            toast.error(message);
        },
    });
}

export function useUpdateCartItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ productVariantId, quantity }: { productVariantId: string; quantity: number }) => {
            await api.put("/cart", { productVariantId, quantity });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || "Erro ao atualizar carrinho";
            toast.error(message);
        },
    });
}

export function useRemoveFromCart() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ productVariantId, quantity }: { productVariantId: string; quantity: number }) => {
            await api.put("/cart", { productVariantId, quantity: -quantity });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            toast.info("Produto removido do carrinho");
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || "Erro ao remover do carrinho";
            toast.error(message);
        },
    });
}
