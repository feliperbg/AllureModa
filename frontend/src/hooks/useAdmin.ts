import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface DashboardStats {
    users: number;
    products: number;
    orders: number;
    revenue: number;
    topProducts: { id: string; name: string; category?: { name: string } }[];
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    createdAt: string;
    cpf?: string;
    phone?: string;
}

export interface OrderItem {
    id: string;
    productVariant?: {
        product?: {
            name: string;
        };
    };
    quantity: number;
    unitPrice: number;
}

export interface Order {
    id: string;
    user?: {
        firstName: string;
        lastName: string;
        email: string;
    };
    totalPrice: number;
    status: string;
    createdAt: string;
    items?: OrderItem[];
}

export function useAdminStats() {
    return useQuery({
        queryKey: ["admin", "stats"],
        queryFn: async () => {
            const { data } = await api.get<DashboardStats>("/admin/stats");
            return data;
        },
    });
}

export function useAdminUsers() {
    return useQuery({
        queryKey: ["admin", "users"],
        queryFn: async () => {
            const { data } = await api.get<User[]>("/admin/users");
            return data;
        },
    });
}

export function useAdminOrders() {
    return useQuery({
        queryKey: ["admin", "orders"],
        queryFn: async () => {
            const { data } = await api.get<Order[]>("/admin/orders");
            return data;
        },
    });
}

export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const { data } = await api.patch<Order>(`/admin/orders/${id}/status`, { status });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
        },
    });
}
