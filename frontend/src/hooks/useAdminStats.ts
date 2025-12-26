import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface DashboardStats {
    metrics: {
        totalRevenue: number;
        totalOrders: number;
        totalCustomers: number;
        totalProducts: number;
    };
    dailyRevenue: Array<{
        date: string;
        revenue: number;
        orders: number;
    }>;
    ordersByStatus: Array<{
        status: string;
        count: number;
    }>;
    topProducts: Array<{
        productId: string;
        productName: string;
        quantitySold: number;
        revenue: number;
    }>;
    lowStockProducts: Array<{
        id: string;
        sku: string;
        productName: string;
        stockQuantity: number;
    }>;
    recentOrders: Array<{
        id: string;
        orderNumber: string;
        status: string;
        total: number;
        createdAt: string;
        customerName: string;
    }>;
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
