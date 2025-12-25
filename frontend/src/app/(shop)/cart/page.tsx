"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCart, useUpdateCartItem, useRemoveFromCart } from "@/hooks/useCart";
import { useAddresses, useCreateAddress, useCep } from "@/hooks/useAddresses";

// Types extracted or imported from hooks if shared
// Using inferred types from hooks mostly, but re-defining form types locally

export default function CartPage() {
    // Cart Hooks
    const { data: items = [], isLoading: loadingCart } = useCart();
    const { mutate: updateItem } = useUpdateCartItem();
    const { mutate: removeItem } = useRemoveFromCart();

    // Address Hooks
    const { data: addresses = [] } = useAddresses();
    const { mutate: saveAddress, isPending: savingAddress } = useCreateAddress();

    // Local State
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [addrForm, setAddrForm] = useState({
        cep: "",
        street: "",
        city: "",
        state: "",
        addressLine2: "",
    });
    const [error, setError] = useState("");

    // Hook for CEP
    const { data: cepData } = useCep(addrForm.cep);

    // Auto-select first address if available and none selected
    useEffect(() => {
        if (!selectedAddressId && addresses.length > 0) {
            setSelectedAddressId(addresses[0].id);
        }
    }, [addresses, selectedAddressId]);

    // CEP Lookup Effect
    useEffect(() => {
        if (cepData && !cepData.erro) {
            setAddrForm((prev) => ({
                ...prev,
                street: cepData.logradouro || prev.street,
                city: cepData.localidade || prev.city,
                state: cepData.uf || prev.state,
            }));
        }
    }, [cepData]);

    const handleUpdateQuantity = (item: any, delta: number) => {
        const newQty = Math.max(1, item.quantity + delta);
        updateItem({ productVariantId: item.productVariantId, quantity: delta });
    };

    const handleRemoveItem = (item: any) => {
        removeItem({ productVariantId: item.productVariantId, quantity: item.quantity });
    };

    const total = items.reduce((sum, it) => {
        const price = Number(it.variant?.price || it.product?.basePrice || 0);
        return sum + price * it.quantity;
    }, 0);

    const maskCep = (v: string) => {
        const d = (v || "").replace(/\D/g, "").slice(0, 8);
        const p1 = d.slice(0, 5);
        const p2 = d.slice(5, 8);
        return p2 ? `${p1}-${p2}` : p1;
    };

    const onAddrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const v = name === "cep" ? maskCep(value) : value;
        setAddrForm((prev) => ({ ...prev, [name]: v }));
    };

    const handleSaveAddress = () => {
        if (!addrForm.cep || !addrForm.street || !addrForm.city || !addrForm.state) {
            setError("Endereço incompleto.");
            return;
        }

        saveAddress({
            postalCode: addrForm.cep.replace(/\D/g, ""),
            street: addrForm.street,
            city: addrForm.city,
            state: addrForm.state,
            country: "Brazil",
            addressLine2: addrForm.addressLine2 || undefined,
        }, {
            onSuccess: (newAddr) => {
                setSelectedAddressId(newAddr.id);
                setError("");
                setAddrForm({ cep: "", street: "", city: "", state: "", addressLine2: "" });
            },
            onError: () => setError("Falha ao salvar endereço.")
        });
    };

    const handleCheckout = () => {
        if (!selectedAddressId) {
            setError("Selecione ou cadastre um endereço.");
            return;
        }
        window.location.href = `/checkout?addressId=${selectedAddressId}`;
    };

    if (loadingCart) {
        return <div className="max-w-7xl mx-auto px-4 py-16 text-center">Carregando carrinho...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
            <h1 className="text-2xl font-semibold mb-6 font-serif">Seu Carrinho</h1>

            {items.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">Seu carrinho está vazio.</p>
                    <Link
                        href="/products"
                        className="inline-block bg-allure-black text-white px-6 py-3 hover:bg-gray-800"
                    >
                        Continuar comprando
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between border p-4 rounded">
                                <div className="flex-1">
                                    <div className="text-sm text-gray-500">{item.product?.brand?.name}</div>
                                    <div className="font-medium">{item.product?.name}</div>
                                    <div className="text-sm text-gray-600">
                                        {item.variant?.attributes
                                            ?.map((a) => `${a.attributeValue.attribute.name}: ${a.attributeValue.value}`)
                                            .join(" / ")}
                                    </div>
                                    <div className="text-sm text-gray-500">SKU: {item.variant?.sku}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleUpdateQuantity(item, -1)}
                                        className="p-1 border rounded hover:bg-gray-50"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-8 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => handleUpdateQuantity(item, 1)}
                                        className="p-1 border rounded hover:bg-gray-50"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="w-24 text-right font-medium">
                                    R$ {Number(item.variant?.price || item.product?.basePrice || 0).toFixed(2)}
                                </div>
                                <button
                                    onClick={() => handleRemoveItem(item)}
                                    className="ml-4 text-red-600 hover:text-red-800"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="border p-4 rounded space-y-4 h-fit">
                        <div>
                            <h2 className="font-semibold mb-3">Endereço de entrega</h2>
                            {addresses.length > 0 && (
                                <select
                                    value={selectedAddressId}
                                    onChange={(e) => setSelectedAddressId(e.target.value)}
                                    className="w-full border p-2 mb-3 rounded"
                                >
                                    {addresses.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.street}, {a.city} - {a.state}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    name="cep"
                                    value={addrForm.cep}
                                    onChange={onAddrChange}
                                    placeholder="CEP"
                                    className="border p-2 rounded"
                                />
                                <input
                                    name="street"
                                    value={addrForm.street}
                                    onChange={onAddrChange}
                                    placeholder="Rua"
                                    className="border p-2 rounded col-span-2"
                                />
                                <input
                                    name="city"
                                    value={addrForm.city}
                                    onChange={onAddrChange}
                                    placeholder="Cidade"
                                    className="border p-2 rounded"
                                />
                                <input
                                    name="state"
                                    value={addrForm.state}
                                    onChange={onAddrChange}
                                    placeholder="Estado"
                                    className="border p-2 rounded"
                                />
                                <input
                                    name="addressLine2"
                                    value={addrForm.addressLine2}
                                    onChange={onAddrChange}
                                    placeholder="Complemento"
                                    className="border p-2 rounded col-span-2"
                                />
                            </div>
                            <button
                                onClick={handleSaveAddress}
                                disabled={savingAddress}
                                className="mt-3 w-full border p-2 rounded hover:bg-gray-50 disabled:opacity-50"
                            >
                                {savingAddress ? "Salvando..." : "Salvar novo endereço"}
                            </button>
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between text-lg font-semibold">
                                <span>Subtotal</span>
                                <span>R$ {total.toFixed(2)}</span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                className="mt-4 w-full bg-allure-black text-white py-3 font-medium hover:bg-gray-800"
                            >
                                Finalizar compra
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
