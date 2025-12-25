import { Hero, FeaturedProducts, Mission } from "@/components/shop";

export default function HomePage() {
    return (
        <div className="bg-allure-beige text-allure-black font-sans antialiased">
            <Hero />
            <FeaturedProducts type="top" />
            <FeaturedProducts type="promo" />
            <Mission />
        </div>
    );
}
