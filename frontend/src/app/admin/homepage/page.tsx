"use client";

import { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { SortableBlock } from "@/components/admin/homepage/SortableBlock";
import { AddBlockModal } from "@/components/admin/homepage/AddBlockModal";
import { BlockConfigModal } from "@/components/admin/homepage/BlockConfigModal";
import { api } from "@/lib/api";

interface BlockConfig {
    [key: string]: unknown;
}

interface PageBlock {
    id: string;
    type: string;
    order: number;
    config: BlockConfig;
}

interface PageConfig {
    id: string | null;
    pageSlug: string;
    isDraft: boolean;
    updatedAt: string | null;
    blocks: PageBlock[];
}

const BLOCK_TYPE_LABELS: Record<string, string> = {
    HeroBanner: "Banner Principal",
    CollectionBanner: "Banner de Coleção",
    FeaturedProducts: "Produtos em Destaque",
    ProductCarousel: "Carrossel de Produtos",
    CategoryShowcase: "Categorias",
    PromoStrip: "Faixa Promocional",
    TextSection: "Seção de Texto",
    ImageGrid: "Grade de Imagens"
};

export default function HomepageEditorPage() {
    const [blocks, setBlocks] = useState<PageBlock[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingBlock, setEditingBlock] = useState<PageBlock | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        loadDraft();
    }, []);

    const loadDraft = async () => {
        try {
            const response = await api.get<PageConfig>("/admin/page-config/homepage");
            setBlocks(response.data.blocks || []);
        } catch (error) {
            console.error("Failed to load homepage config:", error);
            toast.error("Erro ao carregar configuração");
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setBlocks((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);
                // Update order property
                return newItems.map((item, index) => ({ ...item, order: index }));
            });
            setHasChanges(true);
        }
    };

    const handleAddBlock = (type: string) => {
        const newBlock: PageBlock = {
            id: `new-${Date.now()}`,
            type,
            order: blocks.length,
            config: getDefaultConfig(type)
        };
        setBlocks([...blocks, newBlock]);
        setShowAddModal(false);
        setEditingBlock(newBlock);
        setHasChanges(true);
    };

    const handleEditBlock = (block: PageBlock) => {
        setEditingBlock(block);
    };

    const handleSaveBlockConfig = (updatedConfig: BlockConfig) => {
        if (editingBlock) {
            setBlocks(blocks.map(b =>
                b.id === editingBlock.id ? { ...b, config: updatedConfig } : b
            ));
            setEditingBlock(null);
            setHasChanges(true);
        }
    };

    const handleDeleteBlock = (blockId: string) => {
        if (confirm("Tem certeza que deseja remover este bloco?")) {
            setBlocks(blocks.filter(b => b.id !== blockId));
            setHasChanges(true);
        }
    };

    const handleSaveDraft = async () => {
        setSaving(true);
        try {
            await api.put("/admin/page-config/homepage", { blocks });
            toast.success("Rascunho salvo com sucesso!");
            setHasChanges(false);
        } catch (error) {
            console.error("Failed to save draft:", error);
            toast.error("Erro ao salvar rascunho");
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        if (hasChanges) {
            toast.error("Salve o rascunho antes de publicar");
            return;
        }

        setPublishing(true);
        try {
            await api.post("/admin/page-config/homepage/publish");
            toast.success("Publicado com sucesso!");
        } catch (error) {
            console.error("Failed to publish:", error);
            toast.error("Erro ao publicar");
        } finally {
            setPublishing(false);
        }
    };

    const handlePreview = () => {
        window.open("/?preview=true", "_blank");
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Editor da Homepage</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Arraste os blocos para reordenar. Clique em ⚙️ para editar.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handlePreview}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        👁️ Preview
                    </button>
                    <button
                        onClick={handleSaveDraft}
                        disabled={saving || !hasChanges}
                        className="px-4 py-2 text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                    >
                        {saving ? "Salvando..." : "💾 Salvar Rascunho"}
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={publishing || hasChanges}
                        className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        {publishing ? "Publicando..." : "🚀 Publicar"}
                    </button>
                </div>
            </div>

            {hasChanges && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                    ⚠️ Você tem alterações não salvas
                </div>
            )}

            {/* Block List */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {blocks.map((block) => (
                            <SortableBlock
                                key={block.id}
                                block={block}
                                label={BLOCK_TYPE_LABELS[block.type] || block.type}
                                onEdit={() => handleEditBlock(block)}
                                onDelete={() => handleDeleteBlock(block.id)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {blocks.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    Nenhum bloco configurado. Clique em "Adicionar Bloco" para começar.
                </div>
            )}

            {/* Add Block Button */}
            <button
                onClick={() => setShowAddModal(true)}
                className="mt-6 w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
            >
                + Adicionar Bloco
            </button>

            {/* Modals */}
            {showAddModal && (
                <AddBlockModal
                    onClose={() => setShowAddModal(false)}
                    onSelect={handleAddBlock}
                    blockTypes={BLOCK_TYPE_LABELS}
                />
            )}

            {editingBlock && (
                <BlockConfigModal
                    block={editingBlock}
                    onClose={() => setEditingBlock(null)}
                    onSave={handleSaveBlockConfig}
                />
            )}
        </div>
    );
}

function getDefaultConfig(type: string): BlockConfig {
    switch (type) {
        case "HeroBanner":
            return {
                imageUrl: "",
                mobileImageUrl: "",
                title: "Título do Banner",
                subtitle: "Subtítulo opcional",
                buttonText: "Ver Mais",
                buttonLink: "/products",
                overlayOpacity: 0.2,
                textColor: "#ffffff"
            };
        case "FeaturedProducts":
            return {
                title: "Produtos em Destaque",
                mode: "newest",
                productIds: [],
                limit: 4
            };
        case "CollectionBanner":
            return {
                imageUrl: "",
                title: "Nome da Coleção",
                link: "/products",
                height: "400px"
            };
        case "PromoStrip":
            return {
                text: "FRETE GRÁTIS acima de R$299",
                backgroundColor: "#1a1a1a",
                textColor: "#ffffff",
                link: ""
            };
        case "CategoryShowcase":
            return {
                title: "Compre por Categoria",
                categoryIds: []
            };
        case "TextSection":
            return {
                title: "Nosso Propósito",
                content: "Texto descritivo sobre a marca ou uma seção especial.",
                alignment: "center",
                backgroundColor: "#f5f5f0",
                textColor: "#1a1a1a"
            };
        case "ImageGrid":
            return {
                columns: 2,
                images: [
                    { url: "", link: "" },
                    { url: "", link: "" },
                    { url: "", link: "" },
                    { url: "", link: "" }
                ]
            };
        case "ProductCarousel":
            return {
                title: "Produtos em Destaque",
                mode: "newest",
                productIds: [],
                limit: 8
            };
        default:
            return {};
    }
}
