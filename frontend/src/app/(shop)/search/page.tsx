import { Suspense } from "react";
import SearchContent from "./SearchContent";

export default function SearchPage() {
    return (
        <Suspense fallback={<SearchLoading />}>
            <SearchContent />
        </Suspense>
    );
}

function SearchLoading() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="h-8 w-48 bg-gray-200 rounded mb-6 animate-pulse" />
            <div className="flex gap-2 mb-6">
                <div className="flex-1 h-12 bg-gray-200 rounded animate-pulse" />
                <div className="w-24 h-12 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
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
