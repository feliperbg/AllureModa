"use client";

import Link from "next/link";
import { Heart, Trash2, Loader2 } from "lucide-react";
import { useWishlist, useRemoveFromWishlist } from "@/hooks/useCustomer";
import { useState } from "react";

export default function WishlistPage() {
    const { data: items = [], isLoading, isError } = useWishlist();
    const { mutate: remove } = useRemoveFromWishlist();
    const [errorMsg, setErrorMsg] = useState("");

    const handleRemove = (id: string) => {
        remove(id, {
            onError: () => setErrorMsg("Falha ao remover item."),
        });
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse border rounded-lg p-4">
                            <div className="h-48 bg-gray-200 rounded mb-4" />
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return <div className="p-10 text-center text-red-500">Erro ao carregar lista de desejos.</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{errorMsg}</div>}

            <div className="flex items-center gap-3 mb-6">
                <Heart className="h-6 w-6 text-allure-gold" />
                <h1 className="text-2xl font-semibold font-serif">Lista de Desejos</h1>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Sua lista de desejos está vazia.</p>
                    <Link
                        href="/products"
                        className="inline-block bg-allure-black text-white px-6 py-3 hover:bg-gray-800"
                    >
                        Explorar produtos
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((it) => (
                        <div key={it.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                            {it.product?.images?.[0]?.url && (
                                <Link href={`/products/${it.product.slug}`}>
                                    <img
                                        src={it.product.images[0].url}
                                        alt={it.product.name}
                                        className="w-full h-48 object-cover"
                                    />
                                </Link>
                            )}
                            <div className="p-4">
                                <div className="text-sm text-gray-500 mb-1">{it.product?.brand?.name}</div>
                                <Link
                                    href={`/products/${it.product?.slug}`}
                                    className="font-medium text-allure-black hover:text-allure-gold"
                                >
                                    {it.product?.name || "Produto"}
                                </Link>
                                <div className="text-lg font-semibold mt-2">
                                    R$ {it.product?.basePrice?.toFixed(2).replace(".", ",")}
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <Link
                                        href={`/products/${it.product?.slug}`}
                                        className="flex-1 text-center py-2 bg-allure-black text-white hover:bg-gray-800"
                                    >
                                        Ver produto
                                    </Link>
                                    <button
                                        onClick={() => handleRemove(it.id)}
                                        className="p-2 border border-red-500 text-red-500 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function WishlistPage() {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    const load = async () => {
        try {
            setError("");
            const res = await fetch(`${apiUrl}/wishlist`, { credentials: "include" });
            if (!res.ok) throw new Error("Erro ao carregar");
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch {
            setError("Erro ao carregar lista de desejos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const remove = async (id: string) => {
        try {
            await fetch(`${apiUrl}/wishlist/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            setItems(items.filter((i) => i.id !== id));
        } catch {
            setError("Falha ao remover item.");
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse border rounded-lg p-4">
                            <div className="h-48 bg-gray-200 rounded mb-4" />
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

            <div className="flex items-center gap-3 mb-6">
                <Heart className="h-6 w-6 text-allure-gold" />
                <h1 className="text-2xl font-semibold font-serif">Lista de Desejos</h1>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Sua lista de desejos está vazia.</p>
                    <Link
                        href="/products"
                        className="inline-block bg-allure-black text-white px-6 py-3 hover:bg-gray-800"
                    >
                        Explorar produtos
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((it) => (
                        <div key={it.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                            {it.product?.images?.[0]?.url && (
                                <Link href={`/products/${it.product.slug}`}>
                                    <img
                                        src={it.product.images[0].url}
                                        alt={it.product.name}
                                        className="w-full h-48 object-cover"
                                    />
                                </Link>
                            )}
                            <div className="p-4">
                                <div className="text-sm text-gray-500 mb-1">{it.product?.brand?.name}</div>
                                <Link
                                    href={`/products/${it.product?.slug}`}
                                    className="font-medium text-allure-black hover:text-allure-gold"
                                >
                                    {it.product?.name || "Produto"}
                                </Link>
                                <div className="text-lg font-semibold mt-2">
                                    R$ {it.product?.basePrice?.toFixed(2).replace(".", ",")}
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <Link
                                        href={`/products/${it.product?.slug}`}
                                        className="flex-1 text-center py-2 bg-allure-black text-white hover:bg-gray-800"
                                    >
                                        Ver produto
                                    </Link>
                                    <button
                                        onClick={() => remove(it.id)}
                                        className="p-2 border border-red-500 text-red-500 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
