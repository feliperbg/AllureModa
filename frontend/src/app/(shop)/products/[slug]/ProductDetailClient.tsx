"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { Heart, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { useProduct } from "@/hooks/useProducts";
import { useAddToCart } from "@/hooks/useCart";
import { getImageUrl } from "@/components/shop/ProductImage";
import { ImageZoomModal } from "@/components/shop/ImageZoomModal";
import { ProductDetailSkeleton } from "@/components/ui/Skeletons";
import { ProductReviews } from "@/components/shop/ProductReviews";
import { ShippingCalculator } from "@/components/shop/ShippingCalculator";
import { WishlistButton } from "@/components/shop/WishlistButton";
import { ProductSchema } from "@/components/seo/ProductSchema";

const isValidHex = (hex?: string) => hex && /^#[0-9A-F]{6}$/i.test(hex);

interface ProductDetailClientProps {
    initialSlug?: string;
}

export default function ProductDetailClient({ initialSlug }: ProductDetailClientProps) {
    const params = useParams();
    const slug = initialSlug || (params.slug as string);

    const { data: product, isLoading: loading, isError } = useProduct(slug);
    const { mutate: addToCartMutate, isPending: addingToCart } = useAddToCart();

    const [selectedVariantId, setSelectedVariantId] = useState("");
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [message, setMessage] = useState("");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isZoomOpen, setIsZoomOpen] = useState(false);

    // Initial Attribute Selection
    useEffect(() => {
        if (product?.variants?.[0] && !selectedVariantId) {
            const firstVariant = product.variants[0];
            setSelectedVariantId(firstVariant.id);
            const initialAttributes = firstVariant.attributes.reduce(
                (acc: Record<string, string>, attr: any) => {
                    acc[attr.attributeValue.attribute.name] = attr.attributeValue.value;
                    return acc;
                },
                {}
            );
            setSelectedAttributes(initialAttributes);
        }
    }, [product, selectedVariantId]);

    // Build attributes map
    const attributesMap = useMemo(() => {
        const map = new Map<string, Map<string, string | undefined>>();
        product?.variants.forEach((variant) => {
            variant.attributes.forEach((attr) => {
                const attrName = attr.attributeValue.attribute.name;
                const attrValue = attr.attributeValue.value;
                const attrMeta = attr.attributeValue.meta;

                if (!map.has(attrName)) {
                    map.set(attrName, new Map());
                }
                if (!map.get(attrName)!.has(attrValue)) {
                    map.get(attrName)!.set(attrValue, attrMeta);
                }
            });
        });
        return map;
    }, [product]);

    const isSizeAvailable = useCallback(
        (sizeValue: string) => {
            const selectedColor = selectedAttributes["Cor"];
            if (!selectedColor || !product) return false;

            return product.variants.some((variant) => {
                const hasColor = variant.attributes.some(
                    (a) => a.attributeValue.attribute.name === "Cor" && a.attributeValue.value === selectedColor
                );
                const hasSize = variant.attributes.some(
                    (a) => a.attributeValue.attribute.name === "Tamanho" && a.attributeValue.value === sizeValue
                );
                return hasColor && hasSize;
            });
        },
        [product, selectedAttributes]
    );

    const handleAttributeSelect = (attributeName: string, value: string) => {
        if (!product) return;

        const newAttributes = { ...selectedAttributes, [attributeName]: value };
        if (attributeName === "Cor") {
            delete newAttributes["Tamanho"];
        }

        const matchingVariants = product.variants.filter((v) =>
            v.attributes.some(
                (a) => a.attributeValue.attribute.name === attributeName && a.attributeValue.value === value
            )
        );

        let compatibleVariant = matchingVariants.find((v) =>
            Object.entries(newAttributes).every(([key, val]) =>
                v.attributes.some(
                    (a) => a.attributeValue.attribute.name === key && a.attributeValue.value === val
                )
            )
        );

        if (!compatibleVariant && matchingVariants.length > 0) {
            compatibleVariant = matchingVariants[0];
            const variantAttrs = compatibleVariant.attributes.reduce(
                (acc: Record<string, string>, attr: any) => {
                    acc[attr.attributeValue.attribute.name] = attr.attributeValue.value;
                    return acc;
                },
                {}
            );
            Object.assign(newAttributes, variantAttrs);
        }

        setSelectedAttributes(newAttributes);
        if (compatibleVariant) {
            setSelectedVariantId(compatibleVariant.id);
        }
    };

    const handleAddToCart = () => {
        if (!selectedVariantId) {
            setMessage("Selecione todas as opções.");
            return;
        }
        addToCartMutate({ productVariantId: selectedVariantId, quantity: 1 });
    };

    if (loading) {
        return <ProductDetailSkeleton />;
    }

    if (isError || !product) {
        return <div className="text-center p-10 text-red-500">Produto não encontrado.</div>;
    }

    const totalImages = product.images.length;
    const currentImage = product.images[currentImageIndex] || product.images[0];
    const displayPrice = product.basePrice;

    return (
        <div className="bg-white">
            {/* Schema.org for SEO */}
            <ProductSchema product={product} />

            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-16">
                    {/* Images */}
                    <div className="flex flex-col">
                        <div
                            className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-100 cursor-pointer group"
                            onClick={() => setIsZoomOpen(true)}
                        >
                            {currentImage && (
                                <>
                                    <img
                                        src={getImageUrl(currentImage, "large")}
                                        alt={product.name}
                                        className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                                        <ZoomIn className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </>
                            )}
                            {totalImages > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages); }}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/75"
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % totalImages); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/75"
                                    >
                                        <ChevronRight className="h-6 w-6" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {totalImages > 1 && (
                            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`flex-shrink-0 w-16 h-20 rounded overflow-hidden border-2 transition-colors ${idx === currentImageIndex ? "border-allure-gold" : "border-transparent"
                                            }`}
                                    >
                                        <img
                                            src={getImageUrl(img, "thumbnail")}
                                            alt={`${product.name} - ${idx + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="mt-10 lg:mt-0">
                        <h1 className="text-3xl font-bold text-allure-black font-serif">{product.name}</h1>
                        <p className="mt-4 text-3xl text-allure-black">R$ {displayPrice.toFixed(2).replace(".", ",")}</p>
                        {message && <div className="mt-4 text-sm font-medium text-allure-gold">{message}</div>}

                        <div className="mt-6 text-base text-gray-700">
                            <p>{product.description}</p>
                        </div>

                        {/* Attributes */}
                        <div className="mt-10 space-y-6">
                            {Array.from(attributesMap.keys()).map((attributeName) => {
                                if (attributeName.toLowerCase() === "cor") {
                                    return (
                                        <div key={attributeName}>
                                            <h3 className="text-sm font-medium text-gray-900">
                                                Cor: <span className="font-normal">{selectedAttributes["Cor"]}</span>
                                            </h3>
                                            <div className="flex items-center space-x-3 mt-2">
                                                {Array.from(attributesMap.get(attributeName)!).map(([value, meta]) => {
                                                    const colorHex = isValidHex(meta) ? meta : "#cccccc";
                                                    const isSelected = selectedAttributes[attributeName] === value;
                                                    return (
                                                        <button
                                                            key={value}
                                                            onClick={() => handleAttributeSelect(attributeName, value)}
                                                            title={value}
                                                            className={`relative h-10 w-10 rounded-full border-2 transition-all ${isSelected
                                                                    ? "ring-2 ring-allure-gold ring-offset-2 border-allure-gold"
                                                                    : "border-gray-300 hover:border-gray-500"
                                                                }`}
                                                            style={{ backgroundColor: colorHex }}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                }

                                if (attributeName.toLowerCase() === "tamanho") {
                                    const colorIsSelected = !!selectedAttributes["Cor"];
                                    return (
                                        <div key={attributeName}>
                                            <h3 className="text-sm font-medium text-gray-900">
                                                Tamanho: <span className="font-normal">{selectedAttributes["Tamanho"]}</span>
                                            </h3>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {Array.from(attributesMap.get(attributeName)!.keys()).map((sizeValue) => {
                                                    const isAvailable = isSizeAvailable(sizeValue);
                                                    const isSelected = selectedAttributes["Tamanho"] === sizeValue;
                                                    return (
                                                        <button
                                                            key={sizeValue}
                                                            onClick={() => handleAttributeSelect(attributeName, sizeValue)}
                                                            disabled={!colorIsSelected || !isAvailable}
                                                            className={`px-4 py-2 text-sm border rounded transition-all ${isSelected
                                                                    ? "border-allure-gold bg-allure-gold/10 text-allure-black font-medium"
                                                                    : isAvailable
                                                                        ? "border-gray-300 text-gray-700 hover:border-gray-500"
                                                                        : "border-gray-200 text-gray-300 cursor-not-allowed line-through"
                                                                }`}
                                                        >
                                                            {sizeValue}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {!colorIsSelected && (
                                                <p className="mt-2 text-xs text-gray-500">Selecione uma cor primeiro.</p>
                                            )}
                                        </div>
                                    );
                                }

                                if (attributeName.toLowerCase() === "material") {
                                    const materials = Array.from(attributesMap.get(attributeName)!.keys());
                                    return (
                                        <div key={attributeName} className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-900">Material:</span>
                                            <div className="flex flex-wrap gap-2">
                                                {materials.map((material) => (
                                                    <span
                                                        key={material}
                                                        className="px-3 py-1 bg-allure-beige text-allure-black text-sm rounded-full"
                                                    >
                                                        {material}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }

                                return null;
                            })}
                        </div>

                        {/* Product Details Summary */}
                        {product.brand && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Detalhes do Produto</h3>
                                <dl className="grid grid-cols-2 gap-2 text-sm">
                                    <dt className="text-gray-500">Marca</dt>
                                    <dd className="text-gray-900">{product.brand.name}</dd>
                                    {product.category && (
                                        <>
                                            <dt className="text-gray-500">Categoria</dt>
                                            <dd className="text-gray-900">{product.category.name}</dd>
                                        </>
                                    )}
                                    {selectedAttributes["Material"] && (
                                        <>
                                            <dt className="text-gray-500">Material</dt>
                                            <dd className="text-gray-900">{selectedAttributes["Material"]}</dd>
                                        </>
                                    )}
                                </dl>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-10 flex gap-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={!selectedVariantId || addingToCart}
                                className="flex-1 bg-allure-black text-white py-3 px-8 font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {addingToCart ? "Adicionando..." : "Adicionar ao carrinho"}
                            </button>
                            <WishlistButton productId={product.id} size="lg" className="border border-gray-300" />
                        </div>

                        {/* Shipping Calculator */}
                        <ShippingCalculator productValue={displayPrice} className="mt-6" />
                    </div>
                </div>

                {/* Product Reviews */}
                <ProductReviews productId={product.id} productName={product.name} />
            </div>

            {/* Image Zoom Modal */}
            <ImageZoomModal
                images={product.images}
                initialIndex={currentImageIndex}
                isOpen={isZoomOpen}
                onClose={() => setIsZoomOpen(false)}
                productName={product.name}
            />
        </div>
    );
}
