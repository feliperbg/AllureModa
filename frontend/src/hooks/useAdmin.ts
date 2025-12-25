import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface DashboardStats {
    users: number;
    products: number;
    orders: number;
    revenue: number;
    topProducts: { id: string; name: string; category?: { name: string } }[];
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
