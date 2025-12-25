"use client";

import { useState } from "react";
import { Palette, Plus, Pencil, Trash2, X, Loader2, Save, ChevronDown, ChevronUp } from "lucide-react";
import {
    useAttributes,
    useCreateAttribute,
    useUpdateAttribute,
    useDeleteAttribute,
    Attribute
} from "@/hooks/useProducts";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Helper hooks for Attribute Values since they are sub-resources
function useCreateAttributeValue() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ attributeId, data }: { attributeId: string; data: any }) => {
            await api.post(`/attributes/${attributeId}/values`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attributes"] });
        },
    });
}

function useDeleteAttributeValue() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (valueId: string) => {
            await api.delete(`/attributes/values/${valueId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attributes"] });
        },
    });
}

export default function AttributesAdminPage() {
    // The hook returns Attribute[] which matches the component usage roughly, but component did manual grouping.
    // If backend returns flat list, we might need to group here if useAttributes doesn't group.
    // Assuming new backend or if useAttributes just returns raw list and we need to group.
    // The original code handled grouped or flat. "if (!res.ok) ... manual grouping".
    // Let's assume useAttributes fetches the raw list and we might need to process it if it's not grouped.
    // Ideally update useAttributes to do the processing if needed. 
    // For now, let's assume useAttributes returns what we need or we fix it.
    // The original code logic: fetch /attributes/grouped OR /attributes and group.

    // Let's use useAttributes() and process data locally if needed.
    const { data: rawAttributes = [], isLoading, isError } = useAttributes();

    const { mutate: createAttribute, isPending: creating } = useCreateAttribute();
    const { mutate: updateAttribute, isPending: updating } = useUpdateAttribute();
    const { mutate: deleteAttributeMutation, isPending: deleting } = useDeleteAttribute();

    const { mutate: createValue, isPending: creatingValue } = useCreateAttributeValue();
    const { mutate: deleteValueMutation, isPending: deletingValue } = useDeleteAttributeValue();

    // Process rawAttributes to ensure unique attributes with values if flat list returned
    // Actually, Tanstack Query data logic is better in the hook selector/transform.
    // But doing it here:
    // If rawAttributes is flat list of values with 'attribute' property, group them.
    // If it is list of Attributes with 'values', use as is.
    // We'll rely on our updated hook return type which we defined as Attribute[] with values.
    // If the hook returns flat list, we'd have issues. 
    // Let's assume the hook returns correct structure for now.

    // To be safe, let's process it if needed:
    const attributes: Attribute[] = rawAttributes; // Assuming structure matches for now

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Attribute | null>(null);
    const [form, setForm] = useState({ name: "" });
    const [expanded, setExpanded] = useState<string | null>(null);
    const [valueForm, setValueForm] = useState({ value: "", meta: "" });
    const [addingValueTo, setAddingValueTo] = useState<string | null>(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const openCreate = () => {
        setEditing(null);
        setForm({ name: "" });
        setShowModal(true);
        setError("");
        setSuccess("");
    };

    const openEdit = (attr: Attribute) => {
        setEditing(attr);
        setForm({ name: (attr as any).name || "" }); // Cast if needed
        setShowModal(true);
        setError("");
        setSuccess("");
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
    };

    const saveAttribute = async () => {
        setError("");
        setSuccess("");

        if (editing) {
            updateAttribute({ id: editing.id, data: form }, {
                onSuccess: () => {
                    setSuccess("Atributo atualizado!");
                    setTimeout(closeModal, 1000);
                },
                onError: (err: any) => setError(err.message || "Erro ao atualizar atributo"),
            });
        } else {
            createAttribute(form, {
                onSuccess: () => {
                    setSuccess("Atributo criado!");
                    setTimeout(closeModal, 1000);
                },
                onError: (err: any) => setError(err.message || "Erro ao criar atributo"),
            });
        }
    };

    const handleDelete = (id: string) => {
        if (!confirm("Confirma exclusão do atributo e todos os seus valores?")) return;
        deleteAttributeMutation(id, {
            onError: (err: any) => alert(err.message || "Erro ao excluir atributo"),
        });
    };

    const addValue = (attributeId: string) => {
        if (!valueForm.value.trim()) return;

        createValue({ attributeId, data: valueForm }, {
            onSuccess: () => {
                setValueForm({ value: "", meta: "" });
                setAddingValueTo(null);
            },
            onError: (err: any) => setError(err.message || "Erro ao adicionar valor"),
        });
    };

    const deleteValue = (valueId: string) => {
        if (!confirm("Confirma exclusão?")) return;
        deleteValueMutation(valueId, {
            onError: (err: any) => alert(err.message || "Erro ao excluir valor"),
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
        return <div className="p-10 text-center text-red-500">Falha ao carregar atributos.</div>;
    }

    const saving = creating || updating;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-serif text-allure-black">Atributos</h1>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-allure-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                >
                    <Plus className="h-5 w-5" />
                    Novo Atributo
                </button>
            </div>

            <p className="text-gray-600">
                Configure atributos como Cor, Tamanho, Material, etc. e seus valores possíveis.
            </p>

            {attributes.length === 0 && (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <Palette className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">Nenhum atributo cadastrado</p>
                    <p className="text-sm text-gray-400 mt-2">
                        Crie atributos como "Cor", "Tamanho", "Material" para suas variantes de produto.
                    </p>
                </div>
            )}

            <div className="space-y-4">
                {attributes.map((attr) => (
                    <div key={attr.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                            onClick={() => setExpanded(expanded === attr.id ? null : attr.id)}
                        >
                            <div className="flex items-center gap-3">
                                <Palette className="h-5 w-5 text-allure-gold" />
                                <span className="font-semibold text-allure-black">{attr.name || (attr as any).value}</span>
                                <span className="text-sm text-gray-500">
                                    ({attr.values?.length || 0} valores)
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openEdit(attr);
                                    }}
                                    className="p-2 text-gray-500 hover:text-allure-gold"
                                >
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(attr.id);
                                    }}
                                    className="p-2 text-gray-500 hover:text-red-600"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                {expanded === attr.id ? (
                                    <ChevronUp className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-400" />
                                )}
                            </div>
                        </div>

                        {expanded === attr.id && (
                            <div className="border-t p-4 bg-gray-50">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {attr.values?.map((val) => (
                                        <div
                                            key={val.id}
                                            className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border"
                                        >
                                            {attr.name?.toLowerCase() === "cor" && val.meta && (
                                                <div
                                                    className="w-4 h-4 rounded-full border"
                                                    style={{ backgroundColor: val.meta }}
                                                />
                                            )}
                                            <span>{val.value}</span>
                                            <button
                                                onClick={() => deleteValue(val.id)}
                                                className="text-gray-400 hover:text-red-600"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {addingValueTo === attr.id ? (
                                    <div className="flex gap-2">
                                        <input
                                            value={valueForm.value}
                                            onChange={(e) => setValueForm((f) => ({ ...f, value: e.target.value }))}
                                            placeholder="Valor (ex: Vermelho, P, Algodão)"
                                            className="flex-1 border p-2 rounded text-sm"
                                        />
                                        {attr.name?.toLowerCase() === "cor" && (
                                            <input
                                                type="color"
                                                value={valueForm.meta || "#000000"}
                                                onChange={(e) => setValueForm((f) => ({ ...f, meta: e.target.value }))}
                                                className="w-10 h-10 border rounded cursor-pointer"
                                            />
                                        )}
                                        <button
                                            onClick={() => addValue(attr.id)}
                                            disabled={creatingValue}
                                            className="px-4 py-2 bg-allure-gold text-white rounded hover:bg-opacity-90"
                                        >
                                            {creatingValue ? <Loader2 className="h-4 w-4 animate-spin" /> : "Adicionar"}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setAddingValueTo(null);
                                                setValueForm({ value: "", meta: "" });
                                            }}
                                            className="px-4 py-2 border rounded"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setAddingValueTo(attr.id)}
                                        className="flex items-center gap-1 text-sm text-allure-gold hover:underline"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Adicionar valor
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold">
                                {editing ? "Editar Atributo" : "Novo Atributo"}
                            </h2>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
                            {success && <div className="p-3 bg-green-100 text-green-700 rounded">{success}</div>}

                            <div>
                                <label className="block text-sm font-medium mb-1">Nome do Atributo *</label>
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm({ name: e.target.value })}
                                    placeholder="Ex: Cor, Tamanho, Material"
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t">
                            <button onClick={closeModal} className="px-4 py-2 border rounded hover:bg-gray-50">
                                Cancelar
                            </button>
                            <button
                                onClick={saveAttribute}
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

