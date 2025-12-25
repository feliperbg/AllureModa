import { Navbar, Footer } from "@/components/layout";

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-allure-beige">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
