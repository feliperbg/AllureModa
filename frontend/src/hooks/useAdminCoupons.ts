import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Coupon {
    id: string;
    code: string;
    type: "PERCENTAGE" | "FIXED";
    value: number;
    minPurchase?: number;
    expirationDate?: string;
    usageLimit?: number;
    usageCount?: number;
    isActive: boolean;
    createdAt?: string;
}

export function useAdminCoupons() {
    return useQuery({
        queryKey: ["admin", "coupons"],
        queryFn: async () => {
            const { data } = await api.get<Coupon[]>("/coupons");
            return data;
        },
    });
}

export function useCreateCoupon() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Omit<Coupon, "id" | "usageCount">) => {
            await api.post("/coupons", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
        },
    });
}

export function useUpdateCoupon() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Coupon> }) => {
            await api.put(`/coupons/${id}`, { ...data, id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
        },
    });
}

export function useDeleteCoupon() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/coupons/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
        },
    });
}
