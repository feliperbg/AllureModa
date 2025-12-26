import { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://backend:5000/api";
        const response = await fetch(`${baseUrl}/products/slug/${slug}`, {
            next: { revalidate: 3600 }, // Cache for 1 hour
        });
        if (!response.ok) return null;
        return response.json();
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        return {
            title: "Produto não encontrado | Allure Moda",
            description: "O produto que você procura não foi encontrado.",
        };
    }

    const imageUrl = product.images?.[0]?.largeUrl || product.images?.[0]?.url || "";
    const description =
        product.description?.substring(0, 160) ||
        `${product.name} - ${product.brand?.name || "Allure Moda"}. Compre agora com frete grátis acima de R$299.`;

    return {
        title: `${product.name} | Allure Moda`,
        description,
        keywords: [product.name, product.brand?.name, product.category?.name, "moda feminina", "roupas"].filter(
            Boolean
        ),
        openGraph: {
            title: product.name,
            description,
            images: imageUrl ? [{ url: imageUrl, width: 1200, height: 1600, alt: product.name }] : [],
            type: "website",
            siteName: "Allure Moda",
            locale: "pt_BR",
        },
        twitter: {
            card: "summary_large_image",
            title: product.name,
            description,
            images: imageUrl ? [imageUrl] : [],
        },
        alternates: {
            canonical: `/products/${slug}`,
        },
    };
}

export default function ProductDetailPage() {
    return <ProductDetailClient />;
}
