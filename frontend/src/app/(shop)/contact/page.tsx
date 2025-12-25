"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { useContact } from "@/hooks/useCustomer";

export default function ContactPage() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const { mutate: sendMessage, isPending: loading } = useContact();

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccess(false);

        sendMessage(form, {
            onSuccess: () => {
                setSuccess(true);
                setForm({ name: "", email: "", subject: "", message: "" });
            },
            onError: () => {
                setErrorMsg("Falha ao enviar mensagem. Tente novamente.");
            }
        });
    };

    return (
        <div className="bg-white">
            {/* Hero */}
            <div className="bg-allure-black text-white py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-serif mb-4">Fale Conosco</h1>
                    <p className="text-gray-300">Estamos aqui para ajudar</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div>
                        <h2 className="text-2xl font-serif text-allure-black mb-6">
                            Informações de Contato
                        </h2>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-allure-beige rounded-full">
                                    <Mail className="h-6 w-6 text-allure-gold" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-allure-black">Email</h3>
                                    <p className="text-gray-600">contato@alluremoda.com.br</p>
                                    <p className="text-gray-600">suporte@alluremoda.com.br</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-allure-beige rounded-full">
                                    <Phone className="h-6 w-6 text-allure-gold" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-allure-black">Telefone</h3>
                                    <p className="text-gray-600">(11) 99999-9999</p>
                                    <p className="text-sm text-gray-400">Seg a Sex, 9h às 18h</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-allure-beige rounded-full">
                                    <MapPin className="h-6 w-6 text-allure-gold" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-allure-black">Endereço</h3>
                                    <p className="text-gray-600">
                                        Av. Paulista, 1000<br />
                                        São Paulo - SP<br />
                                        CEP 01310-100
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-allure-beige rounded-lg p-8">
                        <h2 className="text-2xl font-serif text-allure-black mb-6">
                            Envie sua mensagem
                        </h2>

                        {success && (
                            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                                Mensagem enviada com sucesso! Responderemos em breve.
                            </div>
                        )}
                        {errorMsg && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{errorMsg}</div>
                        )}

                        <form onSubmit={onSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={onChange}
                                    required
                                    className="w-full border p-3 rounded focus:ring-allure-gold focus:border-allure-gold outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={onChange}
                                    required
                                    className="w-full border p-3 rounded focus:ring-allure-gold focus:border-allure-gold outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
                                <select
                                    name="subject"
                                    value={form.subject}
                                    onChange={onChange}
                                    required
                                    className="w-full border p-3 rounded focus:ring-allure-gold focus:border-allure-gold outline-none bg-white"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="duvida">Dúvida sobre produto</option>
                                    <option value="pedido">Acompanhar pedido</option>
                                    <option value="troca">Troca ou devolução</option>
                                    <option value="outro">Outro assunto</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                                <textarea
                                    name="message"
                                    value={form.message}
                                    onChange={onChange}
                                    required
                                    rows={5}
                                    className="w-full border p-3 rounded focus:ring-allure-gold focus:border-allure-gold outline-none resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-allure-black text-white py-3 rounded font-medium hover:bg-gray-800 disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                                {loading ? "Enviando..." : "Enviar Mensagem"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
