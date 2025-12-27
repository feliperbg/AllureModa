import { Suspense } from "react";
import { Hero, FeaturedProducts, Mission } from "@/components/shop";
import { HomepageContent } from "@/components/shop/HomepageContent";

// Loading fallback that shows static content
function HomepageLoading() {
    return (
        <div className="bg-allure-beige text-allure-black font-sans antialiased">
            <Hero />
            <FeaturedProducts type="top" />
            <FeaturedProducts type="promo" />
            <Mission />
        </div>
    );
}

export default function HomePage() {
    return (
        <Suspense fallback={<HomepageLoading />}>
            <HomepageContent />
        </Suspense>
    );
}
