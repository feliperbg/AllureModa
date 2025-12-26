"use client";

/**
 * Skeleton loading components for improved UX
 */

export function ProductCardSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="bg-gray-200 aspect-[3/4] rounded-lg" />
            <div className="mt-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
        </div>
    );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function ProductDetailSkeleton() {
    return (
        <div className="animate-pulse max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                {/* Image */}
                <div className="space-y-4">
                    <div className="bg-gray-200 aspect-square rounded-lg" />
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-gray-200 w-16 h-16 rounded" />
                        ))}
                    </div>
                </div>

                {/* Info */}
                <div className="space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-3/4" />
                    <div className="h-8 bg-gray-200 rounded w-1/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />

                    {/* Color options */}
                    <div className="pt-4">
                        <div className="h-4 bg-gray-200 rounded w-16 mb-2" />
                        <div className="flex gap-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-gray-200 w-8 h-8 rounded-full" />
                            ))}
                        </div>
                    </div>

                    {/* Size options */}
                    <div className="pt-4">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="bg-gray-200 w-12 h-10 rounded" />
                            ))}
                        </div>
                    </div>

                    {/* Button */}
                    <div className="pt-6">
                        <div className="h-12 bg-gray-200 rounded w-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function CartSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="bg-gray-200 w-20 h-20 rounded" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function NavbarSearchSkeleton() {
    return (
        <div className="animate-pulse space-y-2 p-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 items-center">
                    <div className="bg-gray-200 w-12 h-12 rounded" />
                    <div className="flex-1 space-y-1">
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function CategorySkeleton() {
    return (
        <div className="animate-pulse grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-200 aspect-square rounded-lg" />
            ))}
        </div>
    );
}
