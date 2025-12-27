"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DynamicBlock } from "./DynamicBlock";
import { Hero } from "./Hero";
import { FeaturedProducts } from "./FeaturedProducts";
import { Mission } from "./Mission";
import { api } from "@/lib/api";

interface BlockConfig {
    [key: string]: unknown;
}

interface PageBlock {
    id: string;
    type: string;
    order: number;
    config: BlockConfig;
}

interface PageConfig {
    id: string | null;
    pageSlug: string;
    isDraft: boolean;
    updatedAt: string | null;
    blocks: PageBlock[];
}

export function HomepageContent() {
    const searchParams = useSearchParams();
    const isPreview = searchParams.get("preview") === "true";

    const [pageConfig, setPageConfig] = useState<PageConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        loadPageConfig();
    }, [isPreview]);

    const loadPageConfig = async () => {
        try {
            const endpoint = isPreview
                ? "/admin/page-config/homepage"
                : "/page-config/homepage";

            const response = await api.get<PageConfig>(endpoint);
            setPageConfig(response.data);
        } catch (err) {
            console.error("Failed to load page config:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    // Show loading skeleton
    if (loading) {
        return (
            <div className="bg-allure-beige text-allure-black font-sans antialiased">
                <div className="h-[80vh] bg-gray-200 animate-pulse" />
                <div className="py-20 container mx-auto px-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-12" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 aspect-[3/4] rounded" />
                                <div className="mt-4 h-4 bg-gray-200 rounded w-3/4" />
                                <div className="mt-2 h-4 bg-gray-200 rounded w-1/4" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Fallback to static layout if config fails or is empty
    if (error || !pageConfig || pageConfig.blocks.length === 0) {
        return (
            <div className="bg-allure-beige text-allure-black font-sans antialiased">
                <Hero />
                <FeaturedProducts type="top" />
                <FeaturedProducts type="promo" />
                <Mission />
            </div>
        );
    }

    // Render dynamic blocks
    return (
        <div className="bg-allure-beige text-allure-black font-sans antialiased">
            {/* Preview Banner */}
            {isPreview && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 text-center py-2 font-medium">
                    ⚠️ Modo Preview - Esta é a versão de rascunho. As alterações não estão publicadas.
                </div>
            )}

            <div className={isPreview ? "pt-10" : ""}>
                {pageConfig.blocks
                    .sort((a, b) => a.order - b.order)
                    .map((block) => (
                        <DynamicBlock key={block.id} block={block} />
                    ))
                }
            </div>

            {/* Always show Mission at the end */}
            <Mission />
        </div>
    );
}
