"use client";

import Script from "next/script";

interface Product {
    id: string;
    name: string;
    slug: string;
    description?: string;
    basePrice: number;
    images: { url: string; largeUrl?: string }[];
    brand?: { name: string };
    category?: { name: string };
    variants?: Array<{ stockQuantity: number }>;
}

interface ProductSchemaProps {
    product: Product;
}

export function ProductSchema({ product }: ProductSchemaProps) {
    const imageUrl = product.images[0]?.largeUrl || product.images[0]?.url || "";
    const inStock = product.variants?.some((v) => v.stockQuantity > 0) ?? true;

    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description || `${product.name} - ${product.brand?.name || "Allure Moda"}`,
        image: imageUrl,
        brand: {
            "@type": "Brand",
            name: product.brand?.name || "Allure Moda",
        },
        offers: {
            "@type": "Offer",
            url: `https://allure.com.br/products/${product.slug}`,
            priceCurrency: "BRL",
            price: product.basePrice,
            availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            seller: {
                "@type": "Organization",
                name: "Allure Moda",
            },
        },
    };

    return (
        <Script
            id="product-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
