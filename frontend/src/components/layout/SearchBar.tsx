"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getImageUrl } from "@/components/shop/ProductImage";
import { NavbarSearchSkeleton } from "@/components/ui/Skeletons";

interface SearchResult {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    images: { url: string; thumbnailUrl?: string }[];
}

export function SearchBar() {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    // Search API call
    const { data: results = [], isLoading } = useQuery({
        queryKey: ["search", debouncedQuery],
        queryFn: async () => {
            if (!debouncedQuery || debouncedQuery.length < 2) return [];
            const { data } = await api.get<{ products: SearchResult[] }>(`/products?search=${encodeURIComponent(debouncedQuery)}&limit=5`);
            return data.products || [];
        },
        enabled: debouncedQuery.length >= 2,
    });

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/products?search=${encodeURIComponent(query)}`);
            setIsOpen(false);
            setQuery("");
        }
    };

    const handleResultClick = (slug: string) => {
        router.push(`/products/${slug}`);
        setIsOpen(false);
        setQuery("");
    };

    return (
        <div ref={containerRef} className="relative w-full max-w-md">
            <form onSubmit={handleSubmit} className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Buscar produtos..."
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-allure-gold focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                {query && (
                    <button
                        type="button"
                        onClick={() => {
                            setQuery("");
                            setIsOpen(false);
                            inputRef.current?.focus();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </form>

            {/* Dropdown Results */}
            {isOpen && debouncedQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {isLoading ? (
                        <NavbarSearchSkeleton />
                    ) : results.length > 0 ? (
                        <div className="py-2">
                            {results.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => handleResultClick(product.slug)}
                                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left"
                                >
                                    <img
                                        src={getImageUrl(product.images[0], "thumbnail")}
                                        alt={product.name}
                                        className="w-12 h-12 object-cover rounded"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {product.name}
                                        </p>
                                        <p className="text-sm text-allure-gold">
                                            R$ {product.basePrice.toFixed(2).replace(".", ",")}
                                        </p>
                                    </div>
                                </button>
                            ))}
                            <div className="border-t mt-2 pt-2 px-4 pb-2">
                                <button
                                    onClick={handleSubmit}
                                    className="text-sm text-allure-gold hover:underline"
                                >
                                    Ver todos os resultados para "{query}"
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            Nenhum produto encontrado para "{debouncedQuery}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
