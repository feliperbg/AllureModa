"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useLogin, useRegister } from "@/hooks/useAuth";
import { useCep } from "@/hooks/useAddresses";

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        phone: "",
        cpf: "",
        cep: "",
        street: "",
        city: "",
        state: "",
        addressLine2: "",
    });

    // Formatting Helpers matching Auth.jsx
    const maskPhone = (v: string) => {
        const d = (v || "").replace(/\D/g, "");
        if (d.length <= 2) return d;
        if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
        return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
    };

    const maskCpf = (v: string) => {
        const d = (v || "").replace(/\D/g, "").slice(0, 11);
        const p1 = d.slice(0, 3);
        const p2 = d.slice(3, 6);
        const p3 = d.slice(6, 9);
        const p4 = d.slice(9, 11);
        let out = "";
        if (p1) out = p1;
        if (p2) out = `${out}.${p2}`;
        if (p3) out = `${out}.${p3}`;
        if (p4) out = `${out}-${p4}`;
        return out;
    };

    const maskCep = (v: string) => {
        const d = (v || "").replace(/\D/g, "").slice(0, 8);
        const p1 = d.slice(0, 5);
        const p2 = d.slice(5, 8);
        return p2 ? `${p1}-${p2}` : p1;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let v = value;
        if (name === "phone") v = maskPhone(value);
        if (name === "cpf") v = maskCpf(value);
        if (name === "cep") v = maskCep(value);
        setFormData((prev) => ({ ...prev, [name]: v }));
        setError("");
    };

    const { data: cepData } = useCep(formData.cep);

    useEffect(() => {
        if (!isLogin && cepData && !cepData.erro) {
            setFormData((prev) => ({
                ...prev,
                street: cepData.logradouro || prev.street,
                city: cepData.localidade || prev.city,
                state: cepData.uf || prev.state,
            }));
        }
    }, [cepData, isLogin]);

    const validateForm = () => {
        if (!formData.email || !formData.password) {
            setError("Email e senha são obrigatórios.");
            return false;
        }
        if (!isLogin && (!formData.firstName || !formData.lastName)) {
            setError("Nome e sobrenome são obrigatórios.");
            return false;
        }
        if (!isLogin && formData.password !== formData.confirmPassword) {
            setError("As senhas não coincidem.");
            return false;
        }
        if (formData.password.length < 6) {
            setError("A senha deve ter no mínimo 6 caracteres.");
            return false;
        }
        return true;
    };

    const { mutate: login } = useLogin();
    const { mutate: register } = useRegister();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        if (isLogin) {
            login(
                { email: formData.email, password: formData.password },
                {
                    onError: (err: any) => {
                        setError(err.response?.data?.message || "E-mail ou senha incorretos.");
                        setLoading(false);
                    },
                    onSuccess: () => {
                        setLoading(false);
                    }
                }
            );
        } else {
            register(
                {
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone.replace(/\D/g, "") || undefined,
                    cpf: formData.cpf.replace(/\D/g, ""),
                    address: {
                        postalCode: formData.cep.replace(/\D/g, ""),
                        street: formData.street,
                        city: formData.city,
                        state: formData.state,
                        country: "Brazil",
                        addressLine2: formData.addressLine2 || undefined,
                    },
                },
                {
                    onSuccess: () => {
                        setSuccess("Cadastro realizado com sucesso! Redirecionando para login...");
                        setTimeout(() => { setIsLogin(true); setSuccess(""); }, 2000);
                        setLoading(false);
                    },
                    onError: (err: any) => {
                        setError(err.response?.data?.message || "Erro ao registrar. Tente novamente.");
                        setLoading(false);
                    }
                }
            );
        }
    };

    return (
        <div className="w-full max-w-md bg-white rounded-lg shadow-md my-10 overflow-hidden">
            <div className="p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 font-sans">
                        {isLogin ? "Entrar" : "Registrar"}
                    </h2>
                    <p className="mt-2 text-gray-600">
                        {isLogin ? "Acesse sua conta AllureModa" : "Crie sua conta AllureModa"}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                        {success}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Nome</label>
                                <div className="mt-1 relative">
                                    <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none"
                                        placeholder="Seu nome"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Sobrenome</label>
                                <div className="mt-1 relative">
                                    <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none"
                                        placeholder="Seu sobrenome"
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="text"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none"
                                    placeholder="(99) 99999-9999"
                                />
                            </div>
                            <div>
                                <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">CPF</label>
                                <input
                                    id="cpf"
                                    name="cpf"
                                    type="text"
                                    value={formData.cpf}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none"
                                    placeholder="000.000.000-00"
                                />
                            </div>
                            <div>
                                <label htmlFor="cep" className="block text-sm font-medium text-gray-700">CEP</label>
                                <input
                                    id="cep"
                                    name="cep"
                                    type="text"
                                    value={formData.cep}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none"
                                    placeholder="00000-000"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="street" className="block text-sm font-medium text-gray-700">Rua</label>
                                <input
                                    id="street"
                                    name="street"
                                    type="text"
                                    value={formData.street}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none"
                                />
                            </div>
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700">Cidade</label>
                                <input
                                    id="city"
                                    name="city"
                                    type="text"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none"
                                />
                            </div>
                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700">Estado</label>
                                <input
                                    id="state"
                                    name="state"
                                    type="text"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">Complemento</label>
                                <input
                                    id="addressLine2"
                                    name="addressLine2"
                                    type="text"
                                    value={formData.addressLine2}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <div className="mt-1 relative">
                            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none"
                                placeholder="seu@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Senha
                        </label>
                        <div className="mt-1 relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="pl-10 pr-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none"
                                placeholder="Mínimo 6 caracteres"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {!isLogin && (
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirmar Senha
                            </label>
                            <div className="mt-1 relative">
                                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="pl-10 pr-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-allure-gold focus:border-allure-gold outline-none"
                                    placeholder="Confirme a senha"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-allure-gold text-white py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? "Processando..." : (isLogin ? "Entrar" : "Registrar")}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm">
                        {isLogin ? "Não tem conta?" : "Já tem uma conta?"}
                        {" "}
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError("");
                                setSuccess("");
                            }}
                            className="text-allure-gold font-semibold hover:underline"
                        >
                            {isLogin ? "Registre-se" : "Faça login"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
