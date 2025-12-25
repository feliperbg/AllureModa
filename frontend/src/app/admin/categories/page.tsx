"use client";

import { useState } from "react";
import { FolderOpen, Plus, Pencil, Trash2, X, Loader2, Save } from "lucide-react";
import {
    useCategories,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
    Category
} from "@/hooks/useProducts";

export default function CategoriesAdminPage() {
    const { data: categories = [], isLoading, isError } = useCategories();

    const { mutate: createCategory, isPending: creating } = useCreateCategory();
    const { mutate: updateCategory, isPending: updating } = useUpdateCategory();
    const { mutate: deleteCategoryMutation, isPending: deleting } = useDeleteCategory();

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [form, setForm] = useState({ name: "", slug: "", description: "", imageUrl: "" });

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
        setForm({ name: "", slug: "", description: "", imageUrl: "" });
        setShowModal(true);
        setError("");
        setSuccess("");
    };

    const openEdit = (cat: Category) => {
        setEditing(cat);
        setForm({
            name: cat.name,
            slug: cat.slug,
            description: cat.description || "",
            imageUrl: cat.imageUrl || "",
        });
        setShowModal(true);
        setError("");
        setSuccess("");
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setForm({ name: "", slug: "", description: "", imageUrl: "" });
    };

    const save = async () => {
        setError("");
        setSuccess("");

        const payload = {
            ...form,
            slug: form.slug || generateSlug(form.name),
        };

        if (editing) {
            updateCategory({ id: editing.id, data: payload }, {
                onSuccess: () => {
                    setSuccess("Categoria atualizada!");
                    setTimeout(closeModal, 1000);
                },
                onError: (err: any) => setError(err.message || "Erro ao atualizar categoria"),
            });
        } else {
            createCategory(payload, {
                onSuccess: () => {
                    setSuccess("Categoria criada!");
                    setTimeout(closeModal, 1000);
                },
                onError: (err: any) => setError(err.message || "Erro ao criar categoria"),
            });
        }
    };

    const handleDelete = (id: string) => {
        if (!confirm("Confirma exclusão da categoria?")) return;
        deleteCategoryMutation(id, {
            onError: (err: any) => alert(err.message || "Erro ao excluir categoria"),
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
        return <div className="p-10 text-center text-red-500">Falha ao carregar categorias.</div>;
    }

    const saving = creating || updating;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-serif text-allure-black">Categorias</h1>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-allure-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                >
                    <Plus className="h-5 w-5" />
                    Nova Categoria
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                    >
                        {cat.imageUrl && (
                            <img src={cat.imageUrl} alt={cat.name} className="w-full h-32 object-cover" />
                        )}
                        <div className="p-4">
                            <h3 className="font-semibold text-allure-black">{cat.name}</h3>
                            <p className="text-sm text-gray-500 font-mono">/{cat.slug}</p>
                            {cat.description && (
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{cat.description}</p>
                            )}
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => openEdit(cat)}
                                    className="flex-1 flex items-center justify-center gap-1 py-2 border rounded hover:bg-gray-50"
                                >
                                    <Pencil className="h-4 w-4" />
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    disabled={deleting}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {categories.length === 0 && (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">Nenhuma categoria cadastrada</p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold">
                                {editing ? "Editar Categoria" : "Nova Categoria"}
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
                                <label className="block text-sm font-medium mb-1">Descrição</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                    rows={3}
                                    className="w-full border p-2 rounded"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">URL da Imagem</label>
                                <input
                                    value={form.imageUrl}
                                    onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
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

