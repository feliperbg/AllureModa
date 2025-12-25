"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/shop";
import { useProducts, useBrands } from "@/hooks/useProducts";
import { Product } from "@/hooks/useProducts"; // Ensure Product is exported from hooks

export default function ProductsContent() {
    const searchParams = useSearchParams();

    // Filter State
    const [promo, setPromo] = useState(searchParams.get("promo") === "true");
    const [brandId, setBrandId] = useState(searchParams.get("brandId") || "");

    // Query Filters
    const filters = {
        categorySlug: searchParams.get("categorySlug") || undefined,
        search: searchParams.get("q") || undefined,
        brandId: brandId || undefined,
    };

    // Note: passing promo separately as we haven't strictly typed 'promo' in useProducts yet, 
    // but the hook can handle it if we cast or update the type.
    // For now, we assume useProducts processes generic filters passed to it.
    const { data: products = [], isLoading: loadingProducts, isError } = useProducts({
        ...filters,
        promo: promo ? "true" : undefined
    } as any);

    const { data: brands = [] } = useBrands();

    if (loadingProducts) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 aspect-[3/4] rounded" />
                            <div className="mt-4 h-4 bg-gray-200 rounded w-3/4" />
                            <div className="mt-2 h-4 bg-gray-200 rounded w-1/4" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return <div className="text-center p-10 text-red-500">Não foi possível carregar os produtos. Tente novamente mais tarde.</div>;
    }

    return (
        <div className="bg-white">
            <div className="max-w-7xl px-4 py-16 mx-auto sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-allure-black font-serif">
                        Nossos Produtos
                    </h1>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={promo}
                                onChange={(e) => setPromo(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            Promoções
                        </label>
                        <select
                            value={brandId}
                            onChange={(e) => setBrandId(e.target.value)}
                            className="border p-2 text-sm rounded bg-white"
                        >
                            <option value="">Todas as marcas</option>
                            {brands.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        Nenhum produto encontrado.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                slug={product.slug}
                                price={product.basePrice}
                                // promotionalPrice={product.promotionalPrice} // TODO: Add to Product interface
                                imageUrl={product.images?.[0]?.url}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
