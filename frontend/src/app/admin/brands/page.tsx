"use client";

import { useState } from "react";
import { Tag, Plus, Pencil, Trash2, X, Loader2, Save } from "lucide-react";
import {
    useBrands,
    useCreateBrand,
    useUpdateBrand,
    useDeleteBrand,
    Brand
} from "@/hooks/useProducts";

export default function BrandsAdminPage() {
    const { data: brands = [], isLoading, isError } = useBrands();

    const { mutate: createBrand, isPending: creating } = useCreateBrand();
    const { mutate: updateBrand, isPending: updating } = useUpdateBrand();
    const { mutate: deleteBrandMutation, isPending: deleting } = useDeleteBrand();

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Brand | null>(null);
    const [form, setForm] = useState({ name: "", slug: "", logoUrl: "" });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ name: "", slug: "", logoUrl: "" });
        setShowModal(true);
        setError("");
        setSuccess("");
    };

    const openEdit = (brand: Brand) => {
        // Since Brand interface in useProducts might not strictly include slug if I reused the simple one, 
        // but API returns it. I'll cast or assume it's there. 
        // In useProducts.ts: export interface Brand { id: string; name: string; logoUrl?: string; }
        // I might need to update Brand interface in useProducts.ts if I want type safety.
        // But for now, runtime it works.
        setEditing(brand);
        setForm({
            name: brand.name,
            slug: (brand as any).slug || "",
            logoUrl: brand.logoUrl || "",
        });
        setShowModal(true);
        setError("");
        setSuccess("");
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setForm({ name: "", slug: "", logoUrl: "" });
    };

    const save = async () => {
        setError("");
        setSuccess("");

        const payload = {
            ...form,
            slug: form.slug || generateSlug(form.name),
        };

        if (editing) {
            updateBrand({ id: editing.id, data: payload }, {
                onSuccess: () => {
                    setSuccess("Marca atualizada!");
                    setTimeout(closeModal, 1000);
                },
                onError: (err: any) => setError(err.message || "Erro ao atualizar marca"),
            });
        } else {
            createBrand(payload, {
                onSuccess: () => {
                    setSuccess("Marca criada!");
                    setTimeout(closeModal, 1000);
                },
                onError: (err: any) => setError(err.message || "Erro ao criar marca"),
            });
        }
    };

    const handleDelete = (id: string) => {
        if (!confirm("Confirma exclusão da marca?")) return;
        deleteBrandMutation(id, {
            onError: (err: any) => alert(err.message || "Erro ao excluir marca"),
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-allure-gold" />
            </div>
        );
    }

    if (isError) {
        return <div className="p-10 text-center text-red-500">Falha ao carregar marcas.</div>;
    }

    const saving = creating || updating;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-serif text-allure-black">Marcas</h1>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-allure-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                >
                    <Plus className="h-5 w-5" />
                    Nova Marca
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Marca
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Slug
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {brands.map((brand) => (
                            <tr key={brand.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {brand.logoUrl ? (
                                            <img
                                                src={brand.logoUrl}
                                                alt={brand.name}
                                                className="w-10 h-10 rounded object-contain bg-gray-100"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                                                <Tag className="h-5 w-5 text-gray-400" />
                                            </div>
                                        )}
                                        <span className="font-medium text-allure-black">{brand.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-sm text-gray-600">/{(brand as any).slug}</td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => openEdit(brand)}
                                        className="p-2 text-gray-600 hover:text-allure-gold"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(brand.id)}
                                        disabled={deleting}
                                        className="p-2 text-gray-600 hover:text-red-600 disabled:opacity-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {brands.length === 0 && (
                    <div className="p-12 text-center">
                        <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">Nenhuma marca cadastrada</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold">
                                {editing ? "Editar Marca" : "Nova Marca"}
                            </h2>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
                            {success && <div className="p-3 bg-green-100 text-green-700 rounded">{success}</div>}

                            <div>
                                <label className="block text-sm font-medium mb-1">Nome *</label>
                                <input
                                    value={form.name}
                                    onChange={(e) => {
                                        setForm((f) => ({
                                            ...f,
                                            name: e.target.value,
                                            slug: generateSlug(e.target.value),
                                        }));
                                    }}
                                    className="w-full border p-2 rounded"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Slug</label>
                                <input
                                    value={form.slug}
                                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                                    className="w-full border p-2 rounded font-mono text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">URL do Logo</label>
                                <input
                                    value={form.logoUrl}
                                    onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                                    placeholder="https://..."
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t">
                            <button onClick={closeModal} className="px-4 py-2 border rounded hover:bg-gray-50">
                                Cancelar
                            </button>
                            <button
                                onClick={save}
                                disabled={saving || !form.name}
                                className="flex items-center gap-2 px-4 py-2 bg-allure-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {saving ? "Salvando..." : "Salvar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

