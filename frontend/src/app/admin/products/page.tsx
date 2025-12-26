"use client";

import { useState } from "react";
import { Package, Plus, Pencil, Trash2, X, Loader2, Save, Upload } from "lucide-react";
import {
    useProducts,
    useCategories,
    useBrands,
    useAttributes,
    useCreateProduct,
    useUpdateProduct,
    useDeleteProduct,
    Product
} from "@/hooks/useProducts";
import { useImageUpload } from "@/hooks/useImageUpload";
import { VariantMatrixEditor, VariantData } from "@/components/admin/VariantMatrixEditor";
// import { toast } from "sonner";

// Form interface with matrix-based variants
interface FormData {
    name: string;
    description: string;
    basePrice: string;
    promotionalPrice: string;
    categoryId: string;
    brandId: string;
    isActive: boolean;
    images: { url: string; altText: string }[];
    variants: VariantData[];
}

const emptyForm: FormData = {
    name: "",
    description: "",
    basePrice: "",
    promotionalPrice: "",
    categoryId: "",
    brandId: "",
    isActive: true,
    images: [],
    variants: [],
};

export default function ProductsAdminPage() {
    const { data: products = [], isLoading: loadingProducts, isError } = useProducts();
    const { data: categories = [] } = useCategories();
    const { data: brands = [] } = useBrands();
    const { data: attributes = [] } = useAttributes();

    const { mutate: createProduct, isPending: creating } = useCreateProduct();
    const { mutate: updateProduct, isPending: updating } = useUpdateProduct();
    const { mutate: deleteProductMutation, isPending: deleting } = useDeleteProduct();
    const { mutate: uploadImage, isPending: uploading } = useImageUpload();

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [form, setForm] = useState<FormData>(emptyForm);

    // UI Local State for messages
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setShowModal(true);
        setError("");
        setSuccess("");
    };

    const openEdit = (p: Product) => {
        setEditing(p);
        setForm({
            name: p.name,
            description: p.description || "",
            basePrice: String(p.basePrice),
            promotionalPrice: p.promotionalPrice ? String(p.promotionalPrice) : "",
            categoryId: p.categoryId || p.category?.id || "",
            brandId: p.brandId || p.brand?.id || "",
            isActive: p.isActive,
            images: p.images.map((i) => ({ url: i.url, altText: i.altText || "" })),
            variants: p.variants.map((v) => {
                // Extract color and size from variant attributes
                let color = "";
                let colorHex = "";
                let size = "";
                v.attributes.forEach((a) => {
                    const attrName = a.attributeValue.attribute.name.toLowerCase();
                    if (attrName === "cor") {
                        color = a.attributeValue.value;
                        colorHex = a.attributeValue.meta || "#808080";
                    } else if (attrName === "tamanho") {
                        size = a.attributeValue.value;
                    }
                });
                return {
                    sku: v.sku,
                    color,
                    colorHex,
                    size,
                    price: v.price || p.basePrice,
                    stock: v.stockQuantity,
                };
            }),
        });
        setShowModal(true);
        setError("");
        setSuccess("");
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setForm(emptyForm);
    };

    const save = async () => {
        setError("");
        setSuccess("");

        const payload = {
            name: form.name,
            description: form.description,
            basePrice: Number(form.basePrice),
            promotionalPrice: form.promotionalPrice ? Number(form.promotionalPrice) : null,
            categoryId: form.categoryId || null,
            brandId: form.brandId || null,
            isActive: form.isActive,
            images: form.images,
            variants: form.variants.map((v) => ({
                sku: v.sku,
                price: v.price,
                stockQuantity: v.stock,
                attributes: [
                    // Map color and size to attribute values (will need backend attribute IDs)
                    // For now, we pass the variant data as-is and let backend handle
                ],
            })),
        };

        if (editing) {
            updateProduct({ id: editing.id, data: payload }, {
                onSuccess: () => {
                    setSuccess("Produto atualizado!");
                    setTimeout(closeModal, 1000);
                },
                onError: (err: any) => setError(err.message || "Erro ao atualizar produto"),
            });
        } else {
            createProduct(payload, {
                onSuccess: () => {
                    setSuccess("Produto criado!");
                    setTimeout(closeModal, 1000);
                },
                onError: (err: any) => setError(err.message || "Erro ao criar produto"),
            });
        }
    };

    const handleDelete = (id: string) => {
        if (!confirm("Confirma exclusão do produto?")) return;
        deleteProductMutation(id, {
            onError: (err: any) => alert(err.message || "Erro ao excluir produto"),
        });
    };

    // addVariant is now handled by VariantMatrixEditor

    const addImage = () => {
        setForm((f) => ({
            ...f,
            images: [...f.images, { url: "", altText: "" }],
        }));
    };

    if (loadingProducts) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-allure-gold" />
            </div>
        );
    }

    if (isError) {
        return <div className="p-10 text-center text-red-500">Falha ao carregar produtos.</div>;
    }

    const saving = creating || updating;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-serif text-allure-black">Produtos</h1>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-allure-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                >
                    <Plus className="h-5 w-5" />
                    Novo Produto
                </button>
            </div>

            {/* Products Grid */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Produto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Categoria
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Preço
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {products.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {p.images?.[0]?.url && (
                                            <img
                                                src={p.images[0].url}
                                                alt={p.name}
                                                className="w-10 h-10 rounded object-cover"
                                            />
                                        )}
                                        <div>
                                            <div className="font-medium text-allure-black">{p.name}</div>
                                            <div className="text-sm text-gray-500">{p.variants?.length || 0} variantes</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {p.category?.name || "-"}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium">
                                        R$ {p.basePrice.toFixed(2)}
                                    </div>
                                    {p.promotionalPrice && (
                                        <div className="text-xs text-green-600">
                                            Promo: R$ {p.promotionalPrice.toFixed(2)}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`px-2 py-1 text-xs rounded-full ${p.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                                            }`}
                                    >
                                        {p.isActive ? "Ativo" : "Inativo"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => openEdit(p)}
                                        className="p-2 text-gray-600 hover:text-allure-gold"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.id)}
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

                {products.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhum produto cadastrado</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold">
                                {editing ? "Editar Produto" : "Novo Produto"}
                            </h2>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
                            {success && <div className="p-3 bg-green-100 text-green-700 rounded">{success}</div>}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nome *</label>
                                    <input
                                        value={form.name}
                                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                        className="w-full border p-2 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Preço Base *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.basePrice}
                                        onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
                                        className="w-full border p-2 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Preço Promocional</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.promotionalPrice}
                                        onChange={(e) => setForm((f) => ({ ...f, promotionalPrice: e.target.value }))}
                                        className="w-full border p-2 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Categoria</label>
                                    <select
                                        value={form.categoryId}
                                        onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                                        className="w-full border p-2 rounded bg-white"
                                    >
                                        <option value="">Selecione...</option>
                                        {categories.map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Marca</label>
                                    <select
                                        value={form.brandId}
                                        onChange={(e) => setForm((f) => ({ ...f, brandId: e.target.value }))}
                                        className="w-full border p-2 rounded bg-white"
                                    >
                                        <option value="">Selecione...</option>
                                        {brands.map((b: any) => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.isActive}
                                        onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                                        className="rounded"
                                    />
                                    <label className="text-sm">Produto ativo</label>
                                </div>
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

                            {/* Images */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium">Imagens</label>
                                </div>

                                {/* Uploaded Images Preview */}
                                <div className="flex flex-wrap gap-3 mb-3">
                                    {form.images.map((img, idx) => (
                                        <div key={idx} className="relative group">
                                            <img
                                                src={img.url}
                                                alt={img.altText || `Imagem ${idx + 1}`}
                                                className="w-20 h-20 object-cover rounded-lg border"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const imgs = form.images.filter((_, i) => i !== idx);
                                                    setForm((f) => ({ ...f, images: imgs }));
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Upload Button */}
                                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-allure-gold hover:bg-gray-50 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        disabled={uploading}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            uploadImage(file, {
                                                onSuccess: (data) => {
                                                    setForm((f) => ({
                                                        ...f,
                                                        images: [...f.images, { url: data.url, altText: "" }],
                                                    }));
                                                },
                                                onError: (err: any) => {
                                                    setError(err?.response?.data?.message || "Erro ao fazer upload");
                                                },
                                            });
                                            e.target.value = ""; // Reset input
                                        }}
                                    />
                                    {uploading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin text-allure-gold" />
                                            <span className="text-sm text-gray-600">Enviando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-5 w-5 text-gray-400" />
                                            <span className="text-sm text-gray-600">Clique para adicionar imagem</span>
                                        </>
                                    )}
                                </label>
                            </div>

                            {/* Variants - Matrix Editor */}
                            <div className="border-t pt-4">
                                <VariantMatrixEditor
                                    basePrice={Number(form.basePrice) || 0}
                                    variants={form.variants}
                                    onChange={(variants) => setForm((f) => ({ ...f, variants }))}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t">
                            <button onClick={closeModal} className="px-4 py-2 border rounded hover:bg-gray-50">
                                Cancelar
                            </button>
                            <button
                                onClick={save}
                                disabled={saving || !form.name || !form.basePrice}
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

