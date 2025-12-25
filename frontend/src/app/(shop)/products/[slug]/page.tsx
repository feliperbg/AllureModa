"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useProduct } from "@/hooks/useProducts";
import { useAddToCart } from "@/hooks/useCart";

const isValidHex = (hex?: string) => hex && /^#[0-9A-F]{6}$/i.test(hex);

export default function ProductDetailPage() {
    const params = useParams();
    const slug = params.slug as string;

    const { data: product, isLoading: loading, isError } = useProduct(slug);
    const { mutate: addToCartMutate, isPending: addingToCart } = useAddToCart();

    const [selectedVariantId, setSelectedVariantId] = useState("");
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [message, setMessage] = useState("");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
                const attrMeta = attr.attributeValue.meta; // Make sure Product interface has meta if needed, otherwise ignore or fetch properly

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
        }

        if (compatibleVariant) {
            const updatedAttributes = compatibleVariant.attributes.reduce(
                (acc: Record<string, string>, attr) => {
                    acc[attr.attributeValue.attribute.name] = attr.attributeValue.value;
                    return acc;
                },
                {}
            );
            setSelectedAttributes(updatedAttributes);
            setSelectedVariantId(compatibleVariant.id);
        }
    };

    const handleAddToCart = () => {
        setMessage("");
        addToCartMutate(
            { productVariantId: selectedVariantId, quantity: 1 },
            {
                onSuccess: () => {
                    setMessage("Adicionado ao carrinho!");
                    setTimeout(() => setMessage(""), 3000);
                },
                onError: () => {
                    setMessage("Falha ao adicionar ao carrinho");
                }
            }
        );
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16">
                {/* ... Loading Skeleton ... */}
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-16">
                    <div className="animate-pulse bg-gray-200 aspect-[3/4] rounded-lg" />
                    <div className="mt-10 lg:mt-0 space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-3/4" />
                        <div className="h-6 bg-gray-200 rounded w-1/4" />
                        <div className="h-24 bg-gray-200 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !product) {
        return <div className="text-center p-10 text-red-500">Produto não encontrado.</div>;
    }

    const totalImages = product.images.length;
    const currentImage = product.images[currentImageIndex] || product.images[0];
    const displayPrice = product.basePrice; // product.promotionalPrice || product.basePrice;

    return (
        <div className="bg-white">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-16">
                    {/* Images */}
                    <div className="flex flex-col">
                        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-100">
                            {currentImage && (
                                <img
                                    src={currentImage.url}
                                    alt={product.name}
                                    className="h-full w-full object-cover object-center"
                                />
                            )}
                            {totalImages > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/75"
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentImageIndex((prev) => (prev + 1) % totalImages)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/75"
                                    >
                                        <ChevronRight className="h-6 w-6" />
                                    </button>
                                </>
                            )}
                        </div>

                        {totalImages > 1 && (
                            <div className="mt-4 flex space-x-4 overflow-x-auto pb-2">
                                {product.images.map((image, index) => (
                                    <button
                                        key={index} // optimizing key usage if image.id missing
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`flex-shrink-0 w-20 h-20 overflow-hidden rounded-md ${index === currentImageIndex ? "ring-2 ring-allure-gold" : "ring-1 ring-gray-300"
                                            }`}
                                    >
                                        <img src={image.url} alt="" className="h-full w-full object-cover" />
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
                                                            className={`w-8 h-8 rounded-full border-2 ${isSelected ? "ring-2 ring-allure-gold ring-offset-2" : "border-gray-300"
                                                                }`}
                                                            style={{ backgroundColor: colorHex }}
                                                            title={value}
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
                                            <h3 className="text-sm font-medium text-gray-900">Tamanho</h3>
                                            <div className="flex items-center space-x-3 mt-2">
                                                {Array.from(attributesMap.get(attributeName)!).map(([value]) => {
                                                    const available = isSizeAvailable(value);
                                                    const selected = selectedAttributes[attributeName] === value;
                                                    return (
                                                        <button
                                                            key={value}
                                                            onClick={() => handleAttributeSelect(attributeName, value)}
                                                            disabled={!colorIsSelected || !available}
                                                            className={`py-2 px-4 text-sm font-medium uppercase border rounded-md relative ${selected ? "border-allure-gold bg-allure-gold/10" : "border-gray-300"
                                                                } ${!available && colorIsSelected ? "text-gray-400 bg-gray-50" : ""} ${!colorIsSelected ? "opacity-50 cursor-not-allowed" : ""
                                                                }`}
                                                        >
                                                            {value}
                                                            {!available && colorIsSelected && (
                                                                <span className="absolute inset-0 flex items-center justify-center">
                                                                    <span className="w-full h-0.5 bg-gray-400 rotate-[-45deg]" />
                                                                </span>
                                                            )}
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
                                return null;
                            })}
                        </div>

                        {/* Actions */}
                        <div className="mt-10 flex gap-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={!selectedVariantId || addingToCart}
                                className="flex-1 bg-allure-black text-white py-3 px-8 font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {addingToCart ? "Adicionando..." : "Adicionar ao carrinho"}
                            </button>
                            <button
                                onClick={() => setMessage("Favoritar em breve!")}
                                className="p-3 border border-gray-300 hover:bg-gray-50"
                            >
                                <Heart className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Reviews Mock */}
                        {/* ... reuse existing review logic if desired ... */}
                    </div>
                </div>
            </div>
        </div>
    );
}

