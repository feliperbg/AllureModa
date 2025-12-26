import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
}

export interface Brand {
    id: string;
    name: string;
    logoUrl?: string;
}

export interface Attribute {
    id: string;
    value: string; // The attribute value (e.g. "Red", "XL")
    label?: string; // Sometimes label is useful
    // For admin list
    name?: string;
    values?: { id: string; value: string; meta?: string }[];
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    promotionalPrice?: number;
    isActive: boolean;
    categoryId: string;
    brandId: string;
    category?: Category;
    brand?: Brand;
    images: {
        url: string;           // Primary URL (medium)
        thumbnailUrl?: string; // 200px for listings/cart
        mediumUrl?: string;    // 600px for cards
        largeUrl?: string;     // 1200px for detail/zoom
        isMain: boolean;
        id?: string;
        altText?: string;
    }[];
    variants: {
        id: string;
        sku: string;
        price?: number;
        stockQuantity: number;
        attributes: {
            attributeValue: {
                id: string;
                value: string;
                meta?: string;
                attribute: { name: string };
            };
        }[];
    }[];
}

// --- Queries ---

export function useCategories() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const { data } = await api.get<Category[]>("/categories");
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function useBrands() {
    return useQuery({
        queryKey: ["brands"],
        queryFn: async () => {
            const { data } = await api.get<Brand[]>("/brands");
            return data;
        },
        staleTime: 10 * 60 * 1000,
    });
}

export function useAttributes() {
    return useQuery({
        queryKey: ["attributes"],
        queryFn: async () => {
            // Admin expects grouped attributes or list.
            // The admin page logic handles grouping if endpoint returns flat list.
            // Let's assume generic fetch returns list. 
            // admin/attributes/page.tsx logic tries /linked then /attributes.
            // For simplicity, we fetch /attributes and let component handle or improved API.
            // But here we just return raw data.
            const { data } = await api.get<Attribute[]>("/attributes");
            return data;
        },
        staleTime: 10 * 60 * 1000,
    });
}

export function useProducts(filters?: { categorySlug?: string; brandId?: string; search?: string; promo?: string;[key: string]: any }) {
    return useQuery({
        queryKey: ["products", filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        params.append(key, String(value));
                    }
                });
            }
            const { data } = await api.get<Product[]>(`/products?${params.toString()}`);
            return data;
        },
    });
}

export function useProduct(slug: string) {
    return useQuery({
        queryKey: ["product", slug],
        queryFn: async () => {
            const { data } = await api.get<Product>(`/products/${slug}`);
            return data;
        },
        enabled: !!slug,
    });
}

export function useFeaturedProducts() {
    return useQuery({
        queryKey: ["products", "featured"],
        queryFn: async () => {
            const { data } = await api.get<Product[]>("/products?limit=8");
            return data;
        },
    });
}

// --- Product Mutations ---

export function useCreateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const { data: response } = await api.post("/products", data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
        },
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const { data: response } = await api.put(`/products/${id}`, data);
            return response;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["product", data.slug] });
        },
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/products/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
        },
    });
}

// --- Category Mutations ---

export function useCreateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const { data: response } = await api.post("/categories", data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const { data: response } = await api.put(`/categories/${id}`, data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/categories/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });
}

// --- Brand Mutations ---

export function useCreateBrand() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const { data: response } = await api.post("/brands", data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["brands"] });
        },
    });
}

export function useUpdateBrand() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const { data: response } = await api.put(`/brands/${id}`, data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["brands"] });
        },
    });
}

export function useDeleteBrand() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/brands/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["brands"] });
        },
    });
}

// --- Attribute Mutations ---

export function useCreateAttribute() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const { data: response } = await api.post("/attributes", data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attributes"] });
        },
    });
}

export function useUpdateAttribute() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const { data: response } = await api.put(`/attributes/${id}`, data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attributes"] });
        },
    });
}

export function useDeleteAttribute() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/attributes/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attributes"] });
        },
    });
}
