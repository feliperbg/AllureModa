import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

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
            // Normalize data structure if needed, or assume API matches
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
            // Optional: Dispatch event for non-react parts if any
            // window.dispatchEvent(new CustomEvent("cart-updated"));
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
    });
}

export function useRemoveFromCart() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ productVariantId, quantity }: { productVariantId: string; quantity: number }) => {
            // Sending negative quantity effectively removes/decreases
            await api.put("/cart", { productVariantId, quantity: -quantity });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
    });
}
