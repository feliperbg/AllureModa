"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

const faqs = [
    {
        question: "Como faço para rastrear meu pedido?",
        answer: "Após a confirmação do envio, você receberá um email com o código de rastreamento. Você também pode acompanhar na página 'Meus Pedidos' em sua conta.",
    },
    {
        question: "Qual o prazo de entrega?",
        answer: "O prazo varia de acordo com sua localização. Em geral, entregamos em 3 a 10 dias úteis para capitais e até 15 dias úteis para outras regiões.",
    },
    {
        question: "Como funciona a política de troca e devolução?",
        answer: "Você tem até 30 dias após o recebimento para solicitar troca ou devolução. O produto deve estar sem uso, com etiquetas e na embalagem original. Entre em contato conosco pelo email ou WhatsApp.",
    },
    {
        question: "Quais formas de pagamento são aceitas?",
        answer: "Aceitamos PIX, boleto bancário e cartões de crédito (Visa, Mastercard, Elo, American Express). Parcelamos em até 6x sem juros.",
    },
    {
        question: "O site é seguro para compras?",
        answer: "Sim! Utilizamos certificado SSL e todos os dados de pagamento são processados de forma segura pelo gateway Asaas. Seus dados pessoais são protegidos conforme a LGPD.",
    },
    {
        question: "Como sei qual tamanho escolher?",
        answer: "Em cada produto você encontra uma tabela de medidas detalhada. Se ainda tiver dúvidas, entre em contato conosco pelo WhatsApp para ajudarmos na escolha.",
    },
    {
        question: "Posso cancelar um pedido?",
        answer: "Sim, você pode cancelar em até 24 horas após a compra, desde que ainda não tenha sido despachado. Após esse prazo, será necessário aguardar o recebimento para solicitar devolução.",
    },
    {
        question: "Vocês têm loja física?",
        answer: "Atualmente operamos apenas online, o que nos permite oferecer preços mais competitivos. Mas trabalhamos para garantir a mesma experiência de uma loja física através do nosso atendimento personalizado.",
    },
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="bg-white">
            {/* Hero */}
            <div className="bg-allure-black text-white py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <HelpCircle className="h-12 w-12 mx-auto mb-4 text-allure-gold" />
                    <h1 className="text-4xl font-serif mb-4">Perguntas Frequentes</h1>
                    <p className="text-gray-300">Encontre respostas para as dúvidas mais comuns</p>
                </div>
            </div>

            {/* FAQ List */}
            <div className="max-w-3xl mx-auto px-4 py-16">
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="border rounded-lg overflow-hidden"
                        >
                            <button
                                onClick={() => toggle(index)}
                                className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50"
                            >
                                <span className="font-medium text-allure-black">{faq.question}</span>
                                {openIndex === index ? (
                                    <ChevronUp className="h-5 w-5 text-allure-gold flex-shrink-0" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                )}
                            </button>
                            {openIndex === index && (
                                <div className="px-4 pb-4 text-gray-600 border-t bg-gray-50">
                                    <p className="pt-4">{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="mt-12 text-center p-8 bg-allure-beige rounded-lg">
                    <h3 className="text-xl font-serif text-allure-black mb-2">
                        Não encontrou sua resposta?
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Entre em contato conosco que teremos prazer em ajudar.
                    </p>
                    <a
                        href="/contact"
                        className="inline-block bg-allure-black text-white px-6 py-3 rounded hover:bg-gray-800"
                    >
                        Fale Conosco
                    </a>
                </div>
            </div>
        </div>
    );
}
