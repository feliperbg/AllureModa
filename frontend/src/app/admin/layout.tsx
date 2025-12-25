"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Boxes, Users, Store, FolderOpen, Tag, Palette, TicketPercent } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Produtos", href: "/admin/products", icon: Boxes },
        { name: "Categorias", href: "/admin/categories", icon: FolderOpen },
        { name: "Marcas", href: "/admin/brands", icon: Tag },
        { name: "Atributos", href: "/admin/attributes", icon: Palette },
        { name: "Cupons", href: "/admin/coupons", icon: TicketPercent },
        { name: "Clientes", href: "/admin/customers", icon: Users },
        { name: "Voltar à Loja", href: "/", icon: Store },
    ];

    const isActive = (path: string) => {
        if (path === "/admin") return pathname === "/admin";
        return pathname.startsWith(path);
    };

    return (
        <div className="flex min-h-screen bg-allure-beige font-sans">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-allure-black text-white p-6 hidden md:block">
                <h2 className="text-2xl font-serif text-white mb-8">Admin</h2>
                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.href)
                                ? "bg-allure-gold text-allure-black font-semibold"
                                : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Mobile header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-allure-black text-white p-4 flex items-center justify-between">
                <span className="text-xl font-serif">Admin</span>
                <nav className="flex gap-4">
                    {navItems.map((item) => (
                        <Link key={item.name} href={item.href} className="text-gray-300 hover:text-white">
                            <item.icon className="w-5 h-5" />
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <main className="flex-grow p-6 md:p-10 overflow-auto md:pt-10 pt-20">
                {children}
            </main>
        </div>
    );
}
