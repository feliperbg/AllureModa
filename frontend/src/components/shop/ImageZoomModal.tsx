"use client";

import { useEffect, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { getImageUrl } from "@/components/shop/ProductImage";

interface ProductImage {
    url: string;
    thumbnailUrl?: string;
    mediumUrl?: string;
    largeUrl?: string;
    altText?: string;
}

interface ImageZoomModalProps {
    images: ProductImage[];
    initialIndex?: number;
    isOpen: boolean;
    onClose: () => void;
    productName?: string;
}

export function ImageZoomModal({ images, initialIndex = 0, isOpen, onClose, productName }: ImageZoomModalProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isZoomed, setIsZoomed] = useState(false);
    const [position, setPosition] = useState({ x: 50, y: 50 });

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "Escape":
                    onClose();
                    break;
                case "ArrowLeft":
                    goToPrevious();
                    break;
                case "ArrowRight":
                    goToNext();
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, currentIndex]);

    const goToPrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
        setIsZoomed(false);
    }, [images.length]);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
        setIsZoomed(false);
    }, [images.length]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isZoomed) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setPosition({ x, y });
    };

    if (!isOpen || images.length === 0) return null;

    const currentImage = images[currentIndex];

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
                aria-label="Fechar"
            >
                <X className="h-6 w-6" />
            </button>

            {/* Image counter */}
            <div className="absolute top-4 left-4 text-white/70 text-sm">
                {currentIndex + 1} / {images.length}
            </div>

            {/* Zoom toggle */}
            <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="absolute top-4 left-1/2 -translate-x-1/2 p-2 text-white/70 hover:text-white transition-colors z-10 flex items-center gap-2"
            >
                {isZoomed ? (
                    <>
                        <ZoomOut className="h-5 w-5" />
                        <span className="text-sm">Reduzir</span>
                    </>
                ) : (
                    <>
                        <ZoomIn className="h-5 w-5" />
                        <span className="text-sm">Ampliar</span>
                    </>
                )}
            </button>

            {/* Previous button */}
            {images.length > 1 && (
                <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Anterior"
                >
                    <ChevronLeft className="h-6 w-6 text-white" />
                </button>
            )}

            {/* Main image */}
            <div
                className={`relative max-w-[90vw] max-h-[85vh] overflow-hidden ${isZoomed ? "cursor-move" : "cursor-zoom-in"}`}
                onClick={() => !isZoomed && setIsZoomed(true)}
                onMouseMove={handleMouseMove}
            >
                <img
                    src={getImageUrl(currentImage, "large")}
                    alt={currentImage.altText || productName || "Imagem do produto"}
                    className={`transition-transform duration-200 ${isZoomed ? "scale-[2]" : "scale-100"} max-w-[90vw] max-h-[85vh] object-contain`}
                    style={isZoomed ? { transformOrigin: `${position.x}% ${position.y}%` } : undefined}
                    draggable={false}
                />
            </div>

            {/* Next button */}
            {images.length > 1 && (
                <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Próxima"
                >
                    <ChevronRight className="h-6 w-6 text-white" />
                </button>
            )}

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setCurrentIndex(idx);
                                setIsZoomed(false);
                            }}
                            className={`w-16 h-16 rounded overflow-hidden border-2 transition-colors ${idx === currentIndex ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
                                }`}
                        >
                            <img
                                src={getImageUrl(img, "thumbnail")}
                                alt={`Miniatura ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
