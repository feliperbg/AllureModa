import { Navbar, Footer } from "@/components/layout";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-allure-beige">
            <Navbar />
            <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
                {children}
            </main>
            <Footer />
        </div>
    );
}
