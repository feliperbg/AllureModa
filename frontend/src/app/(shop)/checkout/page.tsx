"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useAddresses, useCreateAddress, useProcessCheckout } from "@/hooks/useCheckout";
import { CheckoutResponse } from "@/hooks/useCheckout";
import { Loader2, CheckCircle, CreditCard, ScanLine, FileText, Plus, MapPin, Lock } from "lucide-react";
import Link from "next/link";
import { useCep } from "@/hooks/useAddresses";

export default function CheckoutPage() {
    const router = useRouter();

    // Data Hooks
    const { data: cartItems = [], isLoading: loadingCart } = useCart();
    const { data: addresses = [], isLoading: loadingAddr } = useAddresses();

    // Mutation Hooks
    const { mutate: processCheckout, isPending: processingCheckout } = useProcessCheckout();
    const { mutate: saveAddress, isPending: savingAddress } = useCreateAddress();

    // Local State
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"PIX" | "BOLETO" | "CREDIT_CARD">("PIX");
    const [isNewAddress, setIsNewAddress] = useState(false);

    // Credit Card Form
    const [ccForm, setCcForm] = useState({
        holderName: "",
        number: "",
        expiry: "",
        cvv: "",
    });

    // New Address Form
    const [addrForm, setAddrForm] = useState({
        cep: "",
        street: "",
        number: "",
        city: "",
        state: "",
        addressLine2: "",
    });
    const { data: cepData } = useCep(addrForm.cep);

    // Error/Status
    const [error, setError] = useState("");

    // Effects
    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            setSelectedAddressId(addresses[0].id);
        }
    }, [addresses]);

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

    const total = cartItems.reduce((sum, item) => {
        const price = item.variant?.price || item.product?.basePrice || 0;
        return sum + price * item.quantity;
    }, 0);

    const handleCreateOrder = () => {
        setError("");

        if (!selectedAddressId) {
            setError("Selecione um endereço de entrega.");
            return;
        }

        if (paymentMethod === "CREDIT_CARD") {
            // Basic validation
            if (!ccForm.number || !ccForm.holderName || !ccForm.expiry || !ccForm.cvv) {
                setError("Preencha os dados do cartão.");
                return;
            }
            if (!ccForm.expiry.includes("/") || ccForm.expiry.length < 5) {
                setError("Validade inválida. Use o formato MM/AA");
                return;
            }
        }

        const checkoutPayload = {
            shippingAddressId: selectedAddressId,
            shippingCost: 0, // Free shipping logical
            paymentMethod: paymentMethod as "PIX" | "BOLETO" | "CREDIT_CARD",
            creditCard: paymentMethod === "CREDIT_CARD" ? {
                holderName: ccForm.holderName,
                number: ccForm.number.replace(/\s/g, ""), // Remove spaces
                expiryMonth: ccForm.expiry.split("/")[0],
                expiryYear: `20${ccForm.expiry.split("/")[1]}`, // Assume 20xx
                ccv: ccForm.cvv
            } : undefined
        };

        processCheckout(checkoutPayload, {
            onSuccess: (data: CheckoutResponse) => {
                // Success! Redirect to order tracking
                router.push(`/account/orders/${data.orderId}`); // Or wherever we show success
            },
            onError: (err: any) => {
                setError(err.response?.data?.message || "Erro ao processar compra.");
            }
        });
    };

    const handleSaveAddress = () => {
        if (!addrForm.cep || !addrForm.street || !addrForm.city || !addrForm.state) {
            setError("Endereço incompleto.");
            return;
        }

        saveAddress({
            postalCode: addrForm.cep.replace(/\D/g, ""),
            street: addrForm.street,
            number: addrForm.number,
            city: addrForm.city,
            state: addrForm.state,
            country: "Brazil",
            addressLine2: addrForm.addressLine2 || undefined,
        }, {
            onSuccess: (newAddr) => {
                setSelectedAddressId(newAddr.id);
                setIsNewAddress(false);
                setAddrForm({ cep: "", street: "", number: "", city: "", state: "", addressLine2: "" });
            },
            onError: () => setError("Falha ao salvar endereço.")
        });
    }

    if (loadingCart || loadingAddr) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-allure-gold" />
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <p className="text-gray-600 mb-4">Seu carrinho está vazio.</p>
                <Link href="/products" className="text-allure-gold hover:underline">
                    Continuar comprando
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-serif text-allure-black mb-8">Finalizar Compra</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Address & Payment */}
                <div className="lg:col-span-2 space-y-8">

                    {error && (
                        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Address Section */}
                    <div className="bg-white border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-allure-gold" /> Endereço de Entrega
                            </h2>
                            <button
                                onClick={() => setIsNewAddress(!isNewAddress)}
                                className="text-sm text-allure-gold hover:underline flex items-center gap-1"
                            >
                                <Plus className="h-4 w-4" /> {isNewAddress ? "Cancelar" : "Novo Endereço"}
                            </button>
                        </div>

                        {isNewAddress ? (
                            <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                                <input
                                    value={addrForm.cep}
                                    onChange={e => setAddrForm({ ...addrForm, cep: e.target.value })}
                                    placeholder="CEP"
                                    className="border p-2 rounded"
                                />
                                <input
                                    value={addrForm.street}
                                    onChange={e => setAddrForm({ ...addrForm, street: e.target.value })}
                                    placeholder="Rua"
                                    className="border p-2 rounded col-span-1"
                                />
                                <input
                                    value={addrForm.number}
                                    onChange={e => setAddrForm({ ...addrForm, number: e.target.value })}
                                    placeholder="Número"
                                    className="border p-2 rounded col-span-1"
                                />
                                <input
                                    value={addrForm.city}
                                    onChange={e => setAddrForm({ ...addrForm, city: e.target.value })}
                                    placeholder="Cidade"
                                    className="border p-2 rounded"
                                />
                                <input
                                    value={addrForm.state}
                                    onChange={e => setAddrForm({ ...addrForm, state: e.target.value })}
                                    placeholder="Estado"
                                    className="border p-2 rounded"
                                />
                                <input
                                    value={addrForm.addressLine2}
                                    onChange={e => setAddrForm({ ...addrForm, addressLine2: e.target.value })}
                                    placeholder="Complemento"
                                    className="border p-2 rounded col-span-2"
                                />
                                <button
                                    onClick={handleSaveAddress}
                                    disabled={savingAddress}
                                    className="col-span-2 bg-black text-white p-2 rounded mt-2 disabled:opacity-50"
                                >
                                    {savingAddress ? "Salvando..." : "Salvar Endereço"}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {addresses.map(addr => (
                                    <label key={addr.id} className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="address"
                                            value={addr.id}
                                            checked={selectedAddressId === addr.id}
                                            onChange={() => setSelectedAddressId(addr.id)}
                                            className="mt-1"
                                        />
                                        <div>
                                            <div className="font-medium">{addr.street}</div>
                                            <div className="text-sm text-gray-500">{addr.city} - {addr.state}, {addr.postalCode}</div>
                                        </div>
                                    </label>
                                ))}
                                {addresses.length === 0 && <p className="text-gray-500 italic">Nenhum endereço cadastrado.</p>}
                            </div>
                        )}
                    </div>

                    {/* Payment Section */}
                    <div className="bg-white border rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-allure-gold" /> Pagamento
                        </h2>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <button
                                onClick={() => setPaymentMethod("PIX")}
                                className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${paymentMethod === "PIX" ? "border-allure-gold bg-allure-beige/20 text-allure-gold ring-1 ring-allure-gold" : "hover:bg-gray-50"}`}
                            >
                                <ScanLine className="h-6 w-6" />
                                <span className="font-medium">Pix</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod("CREDIT_CARD")}
                                className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${paymentMethod === "CREDIT_CARD" ? "border-allure-gold bg-allure-beige/20 text-allure-gold ring-1 ring-allure-gold" : "hover:bg-gray-50"}`}
                            >
                                <CreditCard className="h-6 w-6" />
                                <span className="font-medium">Cartão</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod("BOLETO")}
                                className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${paymentMethod === "BOLETO" ? "border-allure-gold bg-allure-beige/20 text-allure-gold ring-1 ring-allure-gold" : "hover:bg-gray-50"}`}
                            >
                                <FileText className="h-6 w-6" />
                                <span className="font-medium">Boleto</span>
                            </button>
                        </div>

                        {paymentMethod === "PIX" && (
                            <div className="p-4 bg-blue-50 text-blue-800 rounded text-sm">
                                O código Pix será gerado na próxima etapa. O pagamento é aprovado instantaneamente.
                            </div>
                        )}

                        {paymentMethod === "BOLETO" && (
                            <div className="p-4 bg-gray-50 text-gray-800 rounded text-sm">
                                O boleto será gerado na próxima etapa. A compensação pode levar até 3 dias úteis.
                            </div>
                        )}

                        {paymentMethod === "CREDIT_CARD" && (
                            <div className="space-y-4 animate-in fade-in">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nome no Cartão</label>
                                    <input
                                        value={ccForm.holderName}
                                        onChange={e => setCcForm({ ...ccForm, holderName: e.target.value })}
                                        className="w-full border p-2 rounded"
                                        placeholder="Como impresso no cartão"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Número do Cartão</label>
                                    <input
                                        value={ccForm.number}
                                        onChange={e => setCcForm({ ...ccForm, number: e.target.value })}
                                        className="w-full border p-2 rounded"
                                        placeholder="0000 0000 0000 0000"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Validade</label>
                                        <input
                                            value={ccForm.expiry}
                                            onChange={e => setCcForm({ ...ccForm, expiry: e.target.value })}
                                            className="w-full border p-2 rounded"
                                            placeholder="MM/AA"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">CVV</label>
                                        <input
                                            value={ccForm.cvv}
                                            onChange={e => setCcForm({ ...ccForm, cvv: e.target.value })}
                                            className="w-full border p-2 rounded"
                                            placeholder="123"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> Seus dados são processados de forma segura.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Summary */}
                <div className="h-fit space-y-6">
                    <div className="bg-white border rounded-lg p-6 shadow-sm sticky top-24">
                        <h2 className="text-xl font-semibold mb-4">Resumo do Pedido</h2>

                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-800 line-clamp-1">{item.product?.name}</div>
                                        <div className="text-gray-500">Qtd: {item.quantity}</div>
                                    </div>
                                    <div className="font-medium">
                                        R$ {((item.variant?.price || item.product?.basePrice || 0) * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-4 space-y-2 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>R$ {total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Frete</span>
                                <span className="text-green-600 font-medium">Grátis</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-allure-black pt-2">
                                <span>Total</span>
                                <span>R$ {total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCreateOrder}
                            disabled={processingCheckout}
                            className="w-full bg-allure-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {(processingCheckout) ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <CheckCircle className="h-5 w-5" />
                            )}
                            {processingCheckout ? "Processando..." : "Finalizar Compra"}
                        </button>

                        <p className="text-xs text-center text-gray-500 mt-4">
                            Ao finalizar, você concorda com nossos termos de serviço.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
