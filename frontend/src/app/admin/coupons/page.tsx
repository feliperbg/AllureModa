"use client";

import { useState } from "react";
import { useAdminCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon, Coupon } from "@/hooks/useAdminCoupons";
import { Loader2, Plus, Edit, Trash2, TicketPercent, X } from "lucide-react";
// import { SearchInput } from "@/components/ui/search-input";

export default function AdminCouponsPage() {
    const { data: coupons = [], isLoading } = useAdminCoupons();
    const { mutate: createCoupon, isPending: creating } = useCreateCoupon();
    const { mutate: updateCoupon, isPending: updating } = useUpdateCoupon();
    const { mutate: deleteCoupon, isPending: deleting } = useDeleteCoupon();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [form, setForm] = useState<Partial<Coupon>>({
        code: "",
        type: "PERCENTAGE",
        value: 0,
        minPurchase: 0,
        expirationDate: "",
        usageLimit: 0,
        isActive: true
    });

    const openModal = (coupon?: Coupon) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setForm({
                ...coupon,
                expirationDate: coupon.expirationDate ? new Date(coupon.expirationDate).toISOString().split('T')[0] : "",
            });
        } else {
            setEditingCoupon(null);
            setForm({
                code: "",
                type: "PERCENTAGE",
                value: 0,
                minPurchase: 0,
                expirationDate: "",
                usageLimit: 0,
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        const payload: any = { ...form };
        if (payload.expirationDate) payload.expirationDate = new Date(payload.expirationDate).toISOString();
        else payload.expirationDate = null;
        if (!payload.usageLimit) payload.usageLimit = null;
        if (!payload.minPurchase) payload.minPurchase = null;

        if (editingCoupon) {
            updateCoupon({ id: editingCoupon.id, data: payload }, {
                onSuccess: () => setIsModalOpen(false)
            });
        } else {
            createCoupon(payload as any, {
                onSuccess: () => setIsModalOpen(false)
            });
        }
    };

    const filteredCoupons = coupons.filter(c =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-allure-gold" />
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-allure-black">Cupons de Desconto</h1>
                    <p className="text-allure-grey mt-1">Gerencie promoções e descontos</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-allure-gold text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all font-medium"
                >
                    <Plus size={20} /> Novo Cupom
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <input
                        placeholder="Buscar cupom..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 px-4 py-2 border rounded-lg"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Código</th>
                                <th className="px-6 py-4">Desconto</th>
                                <th className="px-6 py-4">Mínimo</th>
                                <th className="px-6 py-4">Validade</th>
                                <th className="px-6 py-4">Uso</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredCoupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                                                <TicketPercent size={18} />
                                            </div>
                                            <span className="font-medium text-gray-900">{coupon.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `R$ ${coupon.value.toFixed(2)}`}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {coupon.minPurchase ? `R$ ${coupon.minPurchase.toFixed(2)}` : "-"}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {coupon.expirationDate
                                            ? new Date(coupon.expirationDate).toLocaleDateString()
                                            : "Ilimitado"}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {coupon.usageCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ""}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${coupon.isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                            }`}>
                                            {coupon.isActive ? "Ativo" : "Inativo"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openModal(coupon)}
                                                className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-allure-gold transition-colors"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm("Excluir este cupom?")) deleteCoupon(coupon.id);
                                                }}
                                                className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingCoupon ? "Editar Cupom" : "Novo Cupom"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                                <input
                                    required
                                    value={form.code}
                                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                    className="w-full px-3 py-2 border rounded-lg uppercase"
                                    placeholder="EX: VERAO10"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                    <select
                                        value={form.type}
                                        onChange={e => setForm({ ...form, type: e.target.value as any })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option value="PERCENTAGE">Porcentagem</option>
                                        <option value="FIXED">Valor Fixo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={form.value}
                                        onChange={e => setForm({ ...form, value: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Compra Mínima (R$)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.minPurchase || ""}
                                        onChange={e => setForm({ ...form, minPurchase: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Limite de Uso</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.usageLimit || ""}
                                        onChange={e => setForm({ ...form, usageLimit: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="Ilimitado"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Validade</label>
                                <input
                                    type="date"
                                    value={form.expirationDate || ""}
                                    onChange={e => setForm({ ...form, expirationDate: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={form.isActive}
                                    onChange={e => setForm({ ...form, isActive: e.target.checked })}
                                    className="w-4 h-4 text-allure-gold rounded border-gray-300 focus:ring-allure-gold"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Cupom Ativo</label>
                            </div>

                            <button
                                type="submit"
                                disabled={creating || updating}
                                className="w-full bg-allure-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 mt-4"
                            >
                                {creating || updating ? <Loader2 className="animate-spin mx-auto" /> : "Salvar Cupom"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
