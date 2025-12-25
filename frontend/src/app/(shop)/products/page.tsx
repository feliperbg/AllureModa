import { Suspense } from "react";
import ProductsContent from "./ProductsContent";

export default function ProductsPage() {
    return (
        <Suspense fallback={<ProductsLoading />}>
            <ProductsContent />
        </Suspense>
    );
}

function ProductsLoading() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 aspect-[3/4] rounded" />
                        <div className="mt-4 h-4 bg-gray-200 rounded w-3/4" />
                        <div className="mt-2 h-4 bg-gray-200 rounded w-1/4" />
                    </div>
                ))}
            </div>
        </div>
    );
}
