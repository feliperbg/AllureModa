import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Order, ORDER_STATUS_LABELS } from "./useOrders";

export function useAdminOrders(filters?: { status?: string; search?: string }) {
    return useQuery({
        queryKey: ["admin", "orders", filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters?.status) params.append("status", filters.status);
            if (filters?.search) params.append("search", filters.search);
            const { data } = await api.get<Order[]>(`/orders?${params.toString()}`);
            return data;
        },
    });
}

export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
            const { data } = await api.patch(`/orders/${orderId}/status`, { status });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
            toast.success("Status atualizado com sucesso!");
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || "Erro ao atualizar status";
            toast.error(message);
        },
    });
}

export function useUpdateTrackingCode() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ orderId, trackingCode }: { orderId: string; trackingCode: string }) => {
            const { data } = await api.patch(`/orders/${orderId}/tracking`, { trackingCode });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
            toast.success("Código de rastreio atualizado!");
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || "Erro ao atualizar rastreio";
            toast.error(message);
        },
    });
}
