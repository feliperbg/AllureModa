"use client";

import { useState } from "react";

export type ImageSize = "thumbnail" | "medium" | "large";

export interface ProductImageData {
    url: string;
    thumbnailUrl?: string;
    mediumUrl?: string;
    largeUrl?: string;
    altText?: string;
}

interface ProductImageProps {
    image: ProductImageData | null | undefined;
    alt: string;
    size?: ImageSize;
    className?: string;
    aspectRatio?: "square" | "portrait" | "auto";
    priority?: boolean;
}

/**
 * Utility to get the best available URL for a given size preference
 */
export function getImageUrl(image: ProductImageData | null | undefined, size: ImageSize = "medium"): string {
    if (!image) return "";

    let url = "";
    // Try to get the requested size, fallback to url (medium), then any available
    switch (size) {
        case "thumbnail":
            url = image.thumbnailUrl || image.url || "";
            break;
        case "medium":
            url = image.mediumUrl || image.url || "";
            break;
        case "large":
            url = image.largeUrl || image.mediumUrl || image.url || "";
            break;
        default:
            url = image.url || "";
    }

    // Apply CDN if configured and URL is relative
    const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
    if (cdnUrl && url.startsWith("/")) {
        // Remove trailing slash from CDN and leading slash from URL to avoid double //
        const cleanCdn = cdnUrl.replace(/\/$/, "");
        const cleanUrl = url.replace(/^\//, "");
        return `${cleanCdn}/${cleanUrl}`;
    }

    return url;
}

/**
 * Responsive product image component that selects the right size
 */
export function ProductImage({
    image,
    alt,
    size = "medium",
    className = "",
    aspectRatio = "portrait",
    priority = false,
}: ProductImageProps) {
    const [hasError, setHasError] = useState(false);
    const imageUrl = getImageUrl(image, size);

    const aspectClasses = {
        square: "aspect-square",
        portrait: "aspect-[3/4]",
        auto: "",
    };

    if (!imageUrl || hasError) {
        return (
            <div
                className={`bg-gray-200 flex items-center justify-center ${aspectClasses[aspectRatio]} ${className}`}
            >
                <span className="text-gray-400 text-sm">Sem imagem</span>
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt={alt || "Imagem do produto"}
            className={`object-cover ${aspectClasses[aspectRatio]} ${className}`}
            onError={() => setHasError(true)}
            loading={priority ? "eager" : "lazy"}
        />
    );
}

/**
 * Hook to get srcSet for responsive images
 */
export function getImageSrcSet(image: ProductImageData | null | undefined): string {
    if (!image) return "";

    const sources: string[] = [];

    if (image.thumbnailUrl) sources.push(`${image.thumbnailUrl} 200w`);
    if (image.mediumUrl) sources.push(`${image.mediumUrl} 600w`);
    if (image.largeUrl) sources.push(`${image.largeUrl} 1200w`);

    return sources.join(", ");
}
