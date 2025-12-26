import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Category {
    id: string;
    name: string;
    slug: string;
    parentId?: string;
    children?: Category[];
}

export function useCategories() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const { data } = await api.get<Category[]>("/categories");
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
