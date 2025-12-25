"use client";

import { useState, useEffect } from "react";
import { User, Save, Loader2 } from "lucide-react";
import { useUser } from "@/hooks/useAuth";
import { useUpdateProfile } from "@/hooks/useCustomer";

interface UserProfile {
    firstName: string;
    lastName: string;
    phone: string;
    cpf: string;
    birthDate: string;
    email: string;
}

export default function AccountPage() {
    const [form, setForm] = useState<UserProfile>({
        firstName: "",
        lastName: "",
        phone: "",
        cpf: "",
        birthDate: "",
        email: "",
    });

    // Fetch user data
    const { data: userData, isLoading } = useUser();

    // Update mutation
    const { mutate: updateProfile, isPending: saving } = useUpdateProfile();

    const [message, setMessage] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (userData) {
            const birthDate = userData.birthDate
                ? new Date(userData.birthDate).toISOString().split("T")[0]
                : "";
            setForm({
                firstName: userData.firstName || "",
                lastName: userData.lastName || "",
                phone: userData.phone || "",
                cpf: userData.cpf || "",
                birthDate,
                email: userData.email || "",
            });
        }
    }, [userData]);

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
        let out = p1;
        if (p2) out += `.${p2}`;
        if (p3) out += `.${p3}`;
        if (p4) out += `-${p4}`;
        return out;
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let v = value;
        if (name === "phone") v = maskPhone(value);
        if (name === "cpf") v = maskCpf(value);
        setForm((prev) => ({ ...prev, [name]: v }));
    };

    const onSave = () => {
        setMessage("");
        setErrorMsg("");

        const dataToSend: any = { ...form };
        if (dataToSend.birthDate) {
            dataToSend.birthDate = new Date(dataToSend.birthDate).toISOString();
        }

        updateProfile(dataToSend, {
            onSuccess: () => {
                setMessage("Dados atualizados com sucesso!");
            },
            onError: () => {
                setErrorMsg("Falha ao atualizar dados");
            }
        });
    };

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-allure-gold" />
                <p className="mt-2 text-gray-500">Carregando...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-6">
                <User className="h-6 w-6 text-allure-gold" />
                <h1 className="text-2xl font-semibold font-serif">Minha Conta</h1>
            </div>

            {message && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{message}</div>
            )}
            {errorMsg && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{errorMsg}</div>
            )}

            <div className="bg-white border rounded-lg p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        value={form.email}
                        disabled
                        className="w-full border p-3 rounded bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Email não pode ser alterado</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                        <input
                            name="firstName"
                            value={form.firstName}
                            onChange={onChange}
                            className="w-full border p-3 rounded focus:ring-allure-gold focus:border-allure-gold outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label>
                        <input
                            name="lastName"
                            value={form.lastName}
                            onChange={onChange}
                            className="w-full border p-3 rounded focus:ring-allure-gold focus:border-allure-gold outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={onChange}
                            placeholder="(99) 99999-9999"
                            className="w-full border p-3 rounded focus:ring-allure-gold focus:border-allure-gold outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                        <input
                            name="cpf"
                            value={form.cpf}
                            onChange={onChange}
                            placeholder="000.000.000-00"
                            className="w-full border p-3 rounded focus:ring-allure-gold focus:border-allure-gold outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data de Nascimento
                    </label>
                    <input
                        name="birthDate"
                        type="date"
                        value={form.birthDate}
                        onChange={onChange}
                        className="w-full border p-3 rounded focus:ring-allure-gold focus:border-allure-gold outline-none"
                    />
                </div>

                <button
                    onClick={onSave}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 bg-allure-black text-white py-3 rounded font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                    {saving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Save className="h-5 w-5" />
                    )}
                    {saving ? "Salvando..." : "Salvar Alterações"}
                </button>
            </div>
        </div>
    );
}
