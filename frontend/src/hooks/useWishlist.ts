import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Product } from "./useProducts";

export interface WishlistItem {
    id: string;
    userId: string;
    productId: string;
    product?: Product;
}

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
            const { data } = await api.post<WishlistItem>("/wishlist", { productId });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wishlist"] });
            toast.success("Produto adicionado aos favoritos!");
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || "Erro ao adicionar aos favoritos";
            if (error?.response?.status === 409) {
                toast.info("Este produto já está nos seus favoritos");
            } else {
                toast.error(message);
            }
        },
    });
}

export function useRemoveFromWishlist() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (wishlistItemId: string) => {
            await api.delete(`/wishlist/${wishlistItemId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wishlist"] });
            toast.info("Produto removido dos favoritos");
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || "Erro ao remover dos favoritos";
            toast.error(message);
        },
    });
}

// Helper hook to check if a product is in wishlist
export function useIsInWishlist(productId: string) {
    const { data: wishlist = [] } = useWishlist();
    return wishlist.find((item) => item.productId === productId);
}
