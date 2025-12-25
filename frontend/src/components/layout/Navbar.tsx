"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, User, ShoppingBag, Heart, LayoutDashboard, Menu, LogOut, X } from "lucide-react";
import { useUser, useLogout } from "@/hooks/useAuth";

export function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const cartCount = 0; // Placeholder for cart count

    const { data: user } = useUser();
    const { mutate: logout } = useLogout();

    const categories: any[] = []; // Placeholder for categories from API

    const handleLogout = () => {
        logout();
    };

    return (
        <nav className="bg-white sticky top-0 z-50 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center h-16">
                    <div className="flex items-center">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="md:hidden text-gray-900"
                            aria-label="Menu"
                        >
                            {menuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>

                    <Link
                        href="/"
                        className="justify-self-center select-none block w-full max-w-[58vw] md:max-w-none text-center"
                    >
                        <span className="truncate md:whitespace-normal text-base sm:text-2xl md:text-3xl tracking-wide sm:tracking-widest font-semibold text-gray-900">
                            ALLURE MODA
                        </span>
                    </Link>

                    <div className="flex items-center justify-self-end gap-3 sm:gap-4 text-gray-900">
                        <Link href="/search" aria-label="Buscar" title="Buscar" className="hover:opacity-70">
                            <Search size={20} />
                        </Link>
                        <Link href="/wishlist" aria-label="Favoritos" title="Favoritos" className="hover:opacity-70">
                            <Heart size={20} />
                        </Link>
                        {user ? (
                            <>
                                <Link href="/account" aria-label="Meus dados" title="Meus dados" className="hover:opacity-70">
                                    <User size={20} />
                                </Link>
                                {user.role === 'ADMIN' && (
                                    <Link href="/admin" aria-label="Admin" title="Admin" className="hover:opacity-70">
                                        <LayoutDashboard size={20} />
                                    </Link>
                                )}
                                <button onClick={handleLogout} aria-label="Sair" title="Sair" className="hover:opacity-70">
                                    <LogOut size={20} />
                                </button>
                            </>
                        ) : (
                            <Link href="/login" aria-label="Entrar" title="Entrar" className="hover:opacity-70">
                                <User size={20} />
                            </Link>
                        )}
                        <Link href="/cart" aria-label="Carrinho" title="Carrinho" className="hover:opacity-70">
                            <div className="relative">
                                <ShoppingBag size={20} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full">
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Desktop Categories */}
                <div className="hidden md:flex h-12 items-center justify-center gap-6">
                    {categories.map((c: any) => (
                        <Link
                            key={c.id}
                            href={`/products?categorySlug=${encodeURIComponent(c.slug)}`}
                            className="font-sansSerif text-[13px] tracking-wide font-semibold text-gray-800 hover:text-black uppercase"
                        >
                            {c.name}
                        </Link>
                    ))}
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden pb-3">
                        <div className="grid grid-cols-2 gap-2">
                            {categories.map((c: any) => (
                                <Link
                                    key={c.id}
                                    href={`/products?categorySlug=${encodeURIComponent(c.slug)}`}
                                    className="text-sm py-2 text-gray-800"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {c.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
