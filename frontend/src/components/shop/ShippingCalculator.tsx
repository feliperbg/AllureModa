"use client";

import { useState } from "react";
import { Truck, Loader2, MapPin, Package } from "lucide-react";
import { useCalculateShipping, formatCep, ShippingOption } from "@/hooks/useShipping";

interface ShippingCalculatorProps {
    productValue?: number;
    onSelectOption?: (option: ShippingOption) => void;
    className?: string;
}

export function ShippingCalculator({
    productValue = 100,
    onSelectOption,
    className = "",
}: ShippingCalculatorProps) {
    const [cep, setCep] = useState("");
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const { mutate: calculateShipping, data, isPending, isError } = useCalculateShipping();

    const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCep(e.target.value);
        setCep(formatted);
    };

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        const digits = cep.replace(/\D/g, "");
        if (digits.length !== 8) return;

        calculateShipping({
            cepDestino: digits,
            productValue,
        });
    };

    const handleSelectOption = (option: ShippingOption) => {
        setSelectedOptionId(option.id);
        onSelectOption?.(option);
    };

    return (
        <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
            <div className="flex items-center gap-2 mb-3">
                <Truck className="h-5 w-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">Calcular Frete</h3>
            </div>

            <form onSubmit={handleCalculate} className="flex gap-2">
                <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={cep}
                        onChange={handleCepChange}
                        placeholder="00000-000"
                        maxLength={9}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-allure-gold focus:border-transparent text-sm"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isPending || cep.replace(/\D/g, "").length !== 8}
                    className="px-4 py-2 bg-allure-black text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Calcular"}
                </button>
            </form>

            <a
                href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-allure-gold hover:underline mt-2 inline-block"
            >
                Não sei meu CEP
            </a>

            {/* Results */}
            {data && data.options.length > 0 && (
                <div className="mt-4 space-y-2">
                    {data.options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleSelectOption(option)}
                            className={`w-full flex items-center justify-between p-3 border rounded-lg text-left transition-colors ${selectedOptionId === option.id
                                    ? "border-allure-gold bg-allure-gold/5"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Package className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">
                                        {option.name}
                                        <span className="text-gray-500 font-normal ml-1">
                                            ({option.company})
                                        </span>
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Entrega em até {option.deliveryDays} dias úteis
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-allure-black">
                                    R$ {option.price.toFixed(2).replace(".", ",")}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {data && data.options.length === 0 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                    Nenhuma opção de frete disponível para este CEP.
                </div>
            )}

            {isError && (
                <div className="mt-4 text-center text-sm text-red-500">
                    Erro ao calcular frete. Verifique o CEP e tente novamente.
                </div>
            )}
        </div>
    );
}
