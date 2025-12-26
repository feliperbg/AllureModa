import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface Review {
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    productId: string;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
    };
}

export interface CreateReviewData {
    productId: string;
    rating: number;
    comment?: string;
}

export function useProductReviews(productId: string) {
    return useQuery({
        queryKey: ["reviews", productId],
        queryFn: async () => {
            const { data } = await api.get<Review[]>(`/reviews/product/${productId}`);
            return data;
        },
        enabled: !!productId,
    });
}

export function useCreateReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (reviewData: CreateReviewData) => {
            const { data } = await api.post<Review>("/reviews", reviewData);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["reviews", variables.productId] });
            toast.success("Avaliação enviada com sucesso!");
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || "Erro ao enviar avaliação";
            if (error?.response?.status === 409) {
                toast.info("Você já avaliou este produto");
            } else {
                toast.error(message);
            }
        },
    });
}

// Helper to calculate average rating
export function calculateAverageRating(reviews: Review[]): number {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return Math.round((total / reviews.length) * 10) / 10;
}
