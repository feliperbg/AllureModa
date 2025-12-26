"use client";

import { useFeaturedProducts } from "@/hooks/useProducts";
import { ProductCard } from "./ProductCard";

interface FeaturedProductsProps {
    type: "top" | "promo";
}

export function FeaturedProducts({ type }: FeaturedProductsProps) {
    const { data: products = [], isLoading: loading, isError } = useFeaturedProducts();

    if (loading) {
        return (
            <section className="py-20 bg-allure-beige">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 aspect-[3/4] rounded" />
                                <div className="mt-4 h-4 bg-gray-200 rounded w-3/4" />
                                <div className="mt-2 h-4 bg-gray-200 rounded w-1/4" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 bg-allure-beige">
            <div className="container mx-auto px-4">
                <h2 className="text-center font-serif text-4xl mb-12 text-allure-black">
                    {type === "promo" ? "Produtos em Promoção" : "Produtos em Destaque"}
                </h2>
                {isError && <div className="text-center text-red-600 mb-4">Falha ao carregar destaques</div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            name={product.name}
                            slug={product.slug}
                            price={product.basePrice}
                            promotionalPrice={product.promotionalPrice}
                            image={product.images?.[0]}
                        />
                    ))}
                </div>
                {products.length === 0 && !isError && (
                    <p className="text-center text-gray-500">Nenhum produto encontrado.</p>
                )}
            </div>
        </section>
    );
}

