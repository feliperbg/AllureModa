import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface WishlistItem {
    id: string;
    product?: {
        id: string;
        name: string;
        slug: string;
        basePrice: number;
        images?: { url: string }[];
        brand?: { name: string };
    };
}

export interface Order {
    id: string;
    status: string;
    totalPrice: number;
    createdAt: string;
    items?: {
        id: string;
        quantity: number;
        unitPrice: number;
        productVariant?: {
            product?: { name: string };
        };
    }[];
    trackingCode?: string;
}

// --- Wishlist ---

export function useWishlist() {
    return useQuery({
        queryKey: ["wishlist"],
        queryFn: async () => {
            const { data } = await api.get<WishlistItem[]>("/wishlist");
            return data;
        },
    });
}

export function useAddToWishlist() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (productId: string) => {
            await api.post("/wishlist", { productId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wishlist"] });
        },
    });
}

export function useRemoveFromWishlist() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/wishlist/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wishlist"] });
        },
    });
}

// --- Orders ---

export function useMyOrders() {
    return useQuery({
        queryKey: ["my-orders"],
        queryFn: async () => {
            const { data } = await api.get<Order[]>("/orders/my-orders");
            return data;
        },
    });
}

export function useOrder(id: string) {
    return useQuery({
        queryKey: ["order", id],
        queryFn: async () => {
            const { data } = await api.get<Order>(`/orders/${id}`);
            return data;
        },
        enabled: !!id,
    });
}

// --- Profile ---

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const { data: response } = await api.put("/users/me", data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
        },
    });
}

// --- Contact ---

export function useContact() {
    return useMutation({
        mutationFn: async (data: any) => {
            await api.post("/contact", data);
        },
    });
}

// --- Checkout ---

export function useCreateOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (orderData: any) => {
            const { data } = await api.post<Order>("/orders", orderData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            queryClient.invalidateQueries({ queryKey: ["my-orders"] });
        },
    });
}

export function useCreatePayment() {
    return useMutation({
        mutationFn: async ({ orderId, method, creditCardToken }: { orderId: string; method: "PIX" | "BOLETO" | "CREDIT_CARD"; creditCardToken?: string }) => {
            let url = `/payments/`;
            if (method === "PIX") url += `pix/${orderId}`;
            else if (method === "BOLETO") url += `boleto/${orderId}`;
            else if (method === "CREDIT_CARD") url += `credit-card/${orderId}`;

            const body = method === "CREDIT_CARD" ? { creditCardToken } : {};

            const { data } = await api.post(url, body);
            return data;
        },
    });
}
