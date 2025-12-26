"use client";

import Link from "next/link";
import { Heart, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { useWishlist, useRemoveFromWishlist } from "@/hooks/useWishlist";
import { useAddToCart } from "@/hooks/useCart";
import { getImageUrl } from "@/components/shop/ProductImage";
import { ProductGridSkeleton } from "@/components/ui/Skeletons";

export default function WishlistPage() {
    const { data: wishlist = [], isLoading, isError } = useWishlist();
    const { mutate: removeFromWishlist, isPending: removing } = useRemoveFromWishlist();
    const { mutate: addToCart, isPending: addingToCart } = useAddToCart();

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold font-serif text-allure-black mb-8">Meus Favoritos</h1>
                <ProductGridSkeleton count={4} />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 text-center">
                <h1 className="text-3xl font-bold font-serif text-allure-black mb-4">Meus Favoritos</h1>
                <p className="text-red-500">Erro ao carregar favoritos. Por favor, tente novamente.</p>
            </div>
        );
    }

    if (wishlist.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h1 className="text-3xl font-bold font-serif text-allure-black mb-4">Sua lista está vazia</h1>
                <p className="text-gray-600 mb-8">
                    Adicione produtos aos favoritos para encontrá-los facilmente depois.
                </p>
                <Link
                    href="/products"
                    className="inline-block px-8 py-3 bg-allure-black text-white font-medium hover:bg-gray-800"
                >
                    Explorar Produtos
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold font-serif text-allure-black mb-8">
                Meus Favoritos ({wishlist.length})
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlist.map((item) => {
                    const product = item.product;
                    if (!product) return null;

                    const mainImage = product.images?.[0];
                    const hasVariants = product.variants?.length > 0;
                    const firstVariant = product.variants?.[0];

                    return (
                        <div key={item.id} className="group relative bg-white rounded-lg overflow-hidden shadow-sm">
                            {/* Image */}
                            <Link href={`/products/${product.slug}`} className="block">
                                <div className="relative aspect-[3/4] overflow-hidden">
                                    {mainImage ? (
                                        <img
                                            src={getImageUrl(mainImage, "medium")}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                            <span className="text-gray-400">Sem imagem</span>
                                        </div>
                                    )}
                                </div>
                            </Link>

                            {/* Remove button */}
                            <button
                                onClick={() => removeFromWishlist(item.id)}
                                disabled={removing}
                                className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow hover:bg-red-50 transition-colors"
                                title="Remover dos favoritos"
                            >
                                <Trash2 className="h-4 w-4 text-gray-600 hover:text-red-500" />
                            </button>

                            {/* Info */}
                            <div className="p-4">
                                <Link href={`/products/${product.slug}`}>
                                    <h3 className="font-medium text-gray-900 hover:text-allure-gold transition-colors line-clamp-2">
                                        {product.name}
                                    </h3>
                                </Link>
                                <p className="mt-1 text-lg font-semibold text-allure-black">
                                    R$ {product.basePrice.toFixed(2).replace(".", ",")}
                                </p>

                                {/* Add to Cart */}
                                {hasVariants && firstVariant && (
                                    <button
                                        onClick={() => addToCart({ productVariantId: firstVariant.id, quantity: 1 })}
                                        disabled={addingToCart}
                                        className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-allure-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                                    >
                                        {addingToCart ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <ShoppingBag className="h-4 w-4" />
                                        )}
                                        Adicionar ao Carrinho
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
