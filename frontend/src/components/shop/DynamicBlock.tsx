"use client";

import Link from "next/link";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { ProductCard } from "./ProductCard";

interface BlockConfig {
    [key: string]: unknown;
}

interface PageBlock {
    id: string;
    type: string;
    order: number;
    config: BlockConfig;
}

interface DynamicBlockProps {
    block: PageBlock;
}

export function DynamicBlock({ block }: DynamicBlockProps) {
    switch (block.type) {
        case "HeroBanner":
            return <DynamicHeroBanner config={block.config} />;
        case "FeaturedProducts":
        case "ProductCarousel":
            return <DynamicFeaturedProducts config={block.config} />;
        case "CollectionBanner":
            return <DynamicCollectionBanner config={block.config} />;
        case "PromoStrip":
            return <DynamicPromoStrip config={block.config} />;
        case "TextSection":
            return <DynamicTextSection config={block.config} />;
        case "CategoryShowcase":
            return <DynamicCategoryShowcase config={block.config} />;
        case "ImageGrid":
            return <DynamicImageGrid config={block.config} />;
        default:
            return null;
    }
}

function DynamicHeroBanner({ config }: { config: BlockConfig }) {
    const imageUrl = (config.imageUrl as string) || "";
    const title = (config.title as string) || "";
    const subtitle = (config.subtitle as string) || "";
    const buttonText = (config.buttonText as string) || "Ver Mais";
    const buttonLink = (config.buttonLink as string) || "/products";
    const overlayOpacity = (config.overlayOpacity as number) || 0.2;
    const textColor = (config.textColor as string) || "#ffffff";

    return (
        <section
            className="relative h-[80vh] w-full bg-cover bg-center"
            style={{ backgroundImage: `url('${imageUrl}')` }}
        >
            <div
                className="absolute inset-0"
                style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
            />
            <div
                className="relative z-10 flex h-full flex-col items-center justify-center text-center p-4"
                style={{ color: textColor }}
            >
                <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="mt-4 text-lg max-w-lg font-sans">
                        {subtitle}
                    </p>
                )}
                {buttonText && (
                    <Link
                        href={buttonLink}
                        className="mt-8 bg-allure-black text-white font-sans font-bold py-3 px-10 tracking-wide transition-all hover:bg-gray-800"
                    >
                        {buttonText}
                    </Link>
                )}
            </div>
        </section>
    );
}

function DynamicFeaturedProducts({ config }: { config: BlockConfig }) {
    const title = (config.title as string) || "Produtos em Destaque";
    const mode = (config.mode as string) || "newest";
    const productIds = (config.productIds as string[]) || [];
    const limit = (config.limit as number) || 4;

    // Choose the right hook based on mode
    const isManual = mode === "manual" && productIds.length > 0;

    // For automatic modes, we'll use the appropriate hook
    // This is a simplified version - in production you might want separate hooks
    const { data: autoProducts = [], isLoading: autoLoading } = useFeaturedProducts();
    const { data: promoProducts = [], isLoading: promoLoading } = usePromotionalProducts();

    // For manual selection, filter by IDs
    let products = autoProducts;
    let loading = autoLoading;

    if (mode === "promotional") {
        products = promoProducts;
        loading = promoLoading;
    } else if (isManual) {
        // Filter products by selected IDs
        products = autoProducts.filter(p => productIds.includes(p.id));
        loading = autoLoading;
    }

    // Apply limit
    products = products.slice(0, limit);

    if (loading) {
        return (
            <section className="py-20 bg-allure-beige">
                <div className="container mx-auto px-4">
                    <h2 className="text-center font-serif text-4xl mb-12 text-allure-black">{title}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {Array.from({ length: limit }).map((_, i) => (
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
                <h2 className="text-center font-serif text-4xl mb-12 text-allure-black">{title}</h2>
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
                {products.length === 0 && (
                    <p className="text-center text-gray-500">Nenhum produto encontrado.</p>
                )}
            </div>
        </section>
    );
}

function DynamicCollectionBanner({ config }: { config: BlockConfig }) {
    const imageUrl = (config.imageUrl as string) || "";
    const title = (config.title as string) || "";
    const link = (config.link as string) || "/products";
    const height = (config.height as string) || "400px";

    return (
        <Link href={link} className="block">
            <section
                className="relative w-full bg-cover bg-center flex items-center justify-center"
                style={{ backgroundImage: `url('${imageUrl}')`, height }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-30" />
                <h2 className="relative z-10 font-serif text-4xl md:text-5xl text-white font-bold text-center">
                    {title}
                </h2>
            </section>
        </Link>
    );
}

function DynamicPromoStrip({ config }: { config: BlockConfig }) {
    const text = (config.text as string) || "";
    const backgroundColor = (config.backgroundColor as string) || "#1a1a1a";
    const textColor = (config.textColor as string) || "#ffffff";
    const link = (config.link as string) || "";

    const content = (
        <div
            className="py-3 text-center font-sans text-sm font-medium"
            style={{ backgroundColor, color: textColor }}
        >
            {text}
        </div>
    );

    if (link) {
        return <Link href={link}>{content}</Link>;
    }

    return content;
}

function DynamicTextSection({ config }: { config: BlockConfig }) {
    const title = (config.title as string) || "";
    const content = (config.content as string) || "";
    const alignment = (config.alignment as string) || "center";
    const backgroundColor = (config.backgroundColor as string) || "#f5f5f0";
    const textColor = (config.textColor as string) || "#1a1a1a";

    const alignmentClass = {
        left: "text-left",
        center: "text-center",
        right: "text-right"
    }[alignment] || "text-center";

    return (
        <section
            className="py-16"
            style={{ backgroundColor, color: textColor }}
        >
            <div className={`container mx-auto px-4 max-w-3xl ${alignmentClass}`}>
                {title && (
                    <h2 className="font-serif text-3xl md:text-4xl mb-6">{title}</h2>
                )}
                {content && (
                    <p className="font-sans text-lg leading-relaxed whitespace-pre-line">{content}</p>
                )}
            </div>
        </section>
    );
}

function DynamicCategoryShowcase({ config }: { config: BlockConfig }) {
    const title = (config.title as string) || "Compre por Categoria";
    // For now, show a placeholder - you could fetch categories from API
    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-center font-serif text-3xl mb-12 text-allure-black">{title}</h2>
                <p className="text-center text-gray-500">Categorias em breve...</p>
            </div>
        </section>
    );
}

function DynamicImageGrid({ config }: { config: BlockConfig }) {
    const columns = (config.columns as number) || 2;
    const images = (config.images as Array<{ url: string, link: string }>) || [];

    const gridCols = {
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4"
    }[columns] || "grid-cols-2";

    const validImages = images.filter(img => img?.url);

    if (validImages.length === 0) {
        return null;
    }

    return (
        <section className="py-8">
            <div className={`grid ${gridCols} gap-4`}>
                {validImages.map((image, index) => {
                    const imageEl = (
                        <div key={index} className="aspect-square overflow-hidden">
                            <img
                                src={image.url}
                                alt=""
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    );

                    if (image.link) {
                        return <Link key={index} href={image.link}>{imageEl}</Link>;
                    }
                    return imageEl;
                })}
            </div>
        </section>
    );
}

// Hook exports for use in dynamic blocks
export function usePromotionalProducts() {
    // This is a placeholder - you would implement the actual API call
    return useFeaturedProducts(); // Reuse for now
}

export function useNewestProducts() {
    return useFeaturedProducts(); // Reuse for now
}

export function useProductsByIds(ids: string[]) {
    // Placeholder - would filter by IDs
    const result = useFeaturedProducts();
    return {
        ...result,
        data: result.data?.filter(p => ids.includes(p.id))
    };
}
