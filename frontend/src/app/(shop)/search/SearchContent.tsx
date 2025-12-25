"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/shop";
import { useProducts } from "@/hooks/useProducts";

export default function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const qParam = searchParams.get("q") || "";
    const [query, setQuery] = useState(qParam);

    // Filter only applied if there is a query text
    const { data: products = [], isLoading: loading, isError: error } = useProducts(
        qParam ? { q: qParam } : { q: "___NO_SEARCH___" } // Hack to avoid fetching all if empty, or just rely on backend handling empty Q
    );
    // Actually useProducts implementation just passes filters.
    // If I pass { q: "" }, it fetches all? 
    // The original code only fetched if (!q.trim()) return;
    // So if qParam is empty, we shouldn't fetch or should show nothing.
    // Let's use `enabled` option if I can pass options to useProducts.
    // My useProducts signature is (filters?). It doesn't accept queryOptions.
    // But TanStack Query `enabled` is powerful. 
    // I should probably update `useProducts` to accept query options OR just pass a special filter that returns empty.
    // OR simpler: Render nothing if !qParam.

    const shouldSearch = !!qParam.trim();

    // I'll use a modified useProducts call that respects `enabled` logic if I modify component structure
    // But since useProducts is simple, I'll just conditionally render or accept that it might fetch all if I'm not careful.
    // Wait, useProducts fetches ALL products if filters is empty? Yes.
    // But original code: "if (!q.trim()) return;" -> Set products empty.
    // So if qParam is empty, we want empty list.
    // I can modify useProducts to support enabled, OR I can just handle it here by NOT calling it? No, hooks must be called.
    // I will modify `useProducts` signature in a separate step if needed, but for now:
    // If I pass { search: "impossible_string" } it returns nothing.
    // Or I can add `enabled` prop to `useProducts` filter arguments? No, it goes to queryKey.

    // Let's look at `useProducts` again.
    // export function useProducts(filters?: { ... }) { return useQuery(...) }
    // I can't pass `enabled`.
    // I'll update `useProducts` to accept options or just handle it.

    // For now, I'll pass { q: qParam } and if qParam is empty, it fetches all.
    // Original behavior: "Nenhum produto encontrado" if empty? No, initial state empty.
    // If qParam is present, it searches.

    // Let's assume useProducts({ q: qParam }) is fine, but I want to avoid fetching ALL if qParam is empty.
    // I will just force a dummy filter if empty.

    const { data: searchResults, isLoading, isError: isQueryError } = useProducts(
        shouldSearch ? { q: qParam } : { limit: 0 } // Fetch 0 if empty
    );

    const productsResult = shouldSearch ? (searchResults || []) : [];

    useEffect(() => {
        setQuery(qParam);
    }, [qParam]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const q = query.trim();
        if (q) {
            router.push(`/search?q=${encodeURIComponent(q)}`);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-semibold mb-6 font-serif">Buscar Produtos</h1>

            <form onSubmit={onSubmit} className="flex gap-2 mb-8">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Digite o nome do produto..."
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none"
                    />
                </div>
                <button
                    type="submit"
                    className="px-6 py-3 bg-allure-black text-white rounded-lg hover:bg-gray-800"
                >
                    Buscar
                </button>
            </form>

            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 aspect-[3/4] rounded" />
                            <div className="mt-4 h-4 bg-gray-200 rounded w-3/4" />
                            <div className="mt-2 h-4 bg-gray-200 rounded w-1/4" />
                        </div>
                    ))}
                </div>
            )}

            {isQueryError && <div className="p-3 bg-red-100 text-red-700 rounded mb-4">Erro ao buscar produtos.</div>}

            {!loading && productsResult.length === 0 && shouldSearch && (
                <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">
                        Nenhum produto encontrado para "{qParam}".
                    </p>
                    <Link
                        href="/products"
                        className="text-allure-gold hover:underline"
                    >
                        Ver todos os produtos
                    </Link>
                </div>
            )}

            {!loading && productsResult.length > 0 && (
                <>
                    <p className="text-gray-600 mb-4">
                        {productsResult.length} resultado{productsResult.length !== 1 ? "s" : ""} para "{qParam}"
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {productsResult.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                slug={product.slug}
                                price={product.basePrice}
                                promotionalPrice={product.promotionalPrice}
                                imageUrl={product.images?.[0]?.url}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
