import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://allure.com.br";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://backend:5000/api";

// Force dynamic rendering (generate at runtime, not build time)
export const dynamic = "force-dynamic";

async function getProducts() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${API_URL}/products?limit=1000`, {
            signal: controller.signal,
            cache: "no-store",
        });
        clearTimeout(timeoutId);

        if (!response.ok) return [];
        const data = await response.json();
        return data.products || [];
    } catch {
        return [];
    }
}

async function getCategories() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${API_URL}/categories`, {
            signal: controller.signal,
            cache: "no-store",
        });
        clearTimeout(timeoutId);

        if (!response.ok) return [];
        return response.json();
    } catch {
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const products = await getProducts();
    const categories = await getCategories();

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${BASE_URL}/products`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/login`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/register`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.3,
        },
    ];

    // Product pages
    const productPages: MetadataRoute.Sitemap = products.map((product: any) => ({
        url: `${BASE_URL}/products/${product.slug}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    // Category pages
    const categoryPages: MetadataRoute.Sitemap = categories.map((category: any) => ({
        url: `${BASE_URL}/products?categorySlug=${category.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
    }));

    return [...staticPages, ...productPages, ...categoryPages];
}
