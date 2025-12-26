"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";

interface CheckoutLayoutProps {
    children: ReactNode;
}

const steps = [
    { id: 1, name: "Carrinho", path: "/checkout" },
    { id: 2, name: "Endereço", path: "/checkout/address" },
    { id: 3, name: "Frete", path: "/checkout/shipping" },
    { id: 4, name: "Pagamento", path: "/checkout/payment" },
];

export default function CheckoutLayout({ children }: CheckoutLayoutProps) {
    const pathname = usePathname();

    const getCurrentStep = () => {
        if (pathname.includes("/confirmation")) return 5;
        const step = steps.find((s) => s.path === pathname);
        return step?.id || 1;
    };

    const currentStep = getCurrentStep();
    const isConfirmation = pathname.includes("/confirmation");

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Progress Bar */}
                {!isConfirmation && (
                    <nav className="mb-8">
                        <ol className="flex items-center justify-center">
                            {steps.map((step, index) => {
                                const isCompleted = step.id < currentStep;
                                const isCurrent = step.id === currentStep;

                                return (
                                    <li key={step.id} className="flex items-center">
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${isCompleted
                                                        ? "bg-green-500 text-white"
                                                        : isCurrent
                                                            ? "bg-allure-gold text-white"
                                                            : "bg-gray-200 text-gray-400"
                                                    }`}
                                            >
                                                {isCompleted ? <Check className="h-5 w-5" /> : step.id}
                                            </div>
                                            <span
                                                className={`mt-2 text-xs hidden sm:block ${isCurrent ? "text-allure-black font-medium" : "text-gray-500"
                                                    }`}
                                            >
                                                {step.name}
                                            </span>
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div
                                                className={`w-12 sm:w-20 h-0.5 mx-2 ${step.id < currentStep ? "bg-green-500" : "bg-gray-200"
                                                    }`}
                                            />
                                        )}
                                    </li>
                                );
                            })}
                        </ol>
                    </nav>
                )}

                {/* Content */}
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">{children}</div>

                {/* Security Badge */}
                <div className="mt-6 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Compra 100% segura
                </div>
            </div>
        </div>
    );
}
