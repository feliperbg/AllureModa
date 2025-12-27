"use client";

import { useState, useEffect } from "react";
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

interface Product {
    id: string;
    name: string;
    slug: string;
}

interface BlockConfigModalProps {
    block: PageBlock;
    onClose: () => void;
    onSave: (config: BlockConfig) => void;
}

export function BlockConfigModal({ block, onClose, onSave }: BlockConfigModalProps) {
    const [config, setConfig] = useState<BlockConfig>(block.config);
    const [products, setProducts] = useState<Product[]>([]);
    const [productSearch, setProductSearch] = useState("");

    useEffect(() => {
        if (block.type === "FeaturedProducts" || block.type === "ProductCarousel") {
            loadProducts();
        }
    }, [block.type]);

    const loadProducts = async () => {
        try {
            const response = await api.get<Product[]>("/api/products?limit=50");
            setProducts(response.data);
        } catch (error) {
            console.error("Failed to load products:", error);
        }
    };

    const handleChange = (key: string, value: unknown) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(config);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 my-8">
                <form onSubmit={handleSubmit}>
                    <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Configurar Bloco</h2>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
                        {renderConfigFields()}
                    </div>

                    <div className="p-4 border-t flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    function renderConfigFields() {
        switch (block.type) {
            case "HeroBanner":
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
                            <input
                                type="url"
                                value={(config.imageUrl as string) || ""}
                                onChange={(e) => handleChange("imageUrl", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem (Mobile)</label>
                            <input
                                type="url"
                                value={(config.mobileImageUrl as string) || ""}
                                onChange={(e) => handleChange("mobileImageUrl", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Opcional"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                            <input
                                type="text"
                                value={(config.title as string) || ""}
                                onChange={(e) => handleChange("title", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
                            <input
                                type="text"
                                value={(config.subtitle as string) || ""}
                                onChange={(e) => handleChange("subtitle", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Texto do Botão</label>
                                <input
                                    type="text"
                                    value={(config.buttonText as string) || ""}
                                    onChange={(e) => handleChange("buttonText", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Link do Botão</label>
                                <input
                                    type="text"
                                    value={(config.buttonLink as string) || ""}
                                    onChange={(e) => handleChange("buttonLink", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="/products"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cor do Texto</label>
                                <input
                                    type="color"
                                    value={(config.textColor as string) || "#ffffff"}
                                    onChange={(e) => handleChange("textColor", e.target.value)}
                                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Opacidade do Overlay</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={(config.overlayOpacity as number) || 0.2}
                                    onChange={(e) => handleChange("overlayOpacity", parseFloat(e.target.value))}
                                    className="w-full"
                                />
                                <span className="text-sm text-gray-500">{String(config.overlayOpacity || 0.2)}</span>
                            </div>
                        </div>
                    </>
                );

            case "FeaturedProducts":
            case "ProductCarousel":
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título da Seção</label>
                            <input
                                type="text"
                                value={(config.title as string) || ""}
                                onChange={(e) => handleChange("title", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Modo de Seleção</label>
                            <select
                                value={(config.mode as string) || "newest"}
                                onChange={(e) => handleChange("mode", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="newest">Mais Recentes</option>
                                <option value="bestsellers">Mais Vendidos</option>
                                <option value="promotional">Em Promoção</option>
                                <option value="manual">Seleção Manual</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Limite de Produtos</label>
                            <input
                                type="number"
                                min="1"
                                max="12"
                                value={(config.limit as number) || 4}
                                onChange={(e) => handleChange("limit", parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        {config.mode === "manual" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Selecionar Produtos</label>
                                <input
                                    type="text"
                                    placeholder="Buscar produtos..."
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 mb-2"
                                />
                                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                                    {filteredProducts.map(product => {
                                        const selected = ((config.productIds as string[]) || []).includes(product.id);
                                        return (
                                            <label
                                                key={product.id}
                                                className={`flex items-center p-2 hover:bg-gray-50 cursor-pointer ${selected ? "bg-blue-50" : ""}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selected}
                                                    onChange={(e) => {
                                                        const ids = (config.productIds as string[]) || [];
                                                        if (e.target.checked) {
                                                            handleChange("productIds", [...ids, product.id]);
                                                        } else {
                                                            handleChange("productIds", ids.filter(id => id !== product.id));
                                                        }
                                                    }}
                                                    className="mr-2"
                                                />
                                                {product.name}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                );

            case "CollectionBanner":
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
                            <input
                                type="url"
                                value={(config.imageUrl as string) || ""}
                                onChange={(e) => handleChange("imageUrl", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                            <input
                                type="text"
                                value={(config.title as string) || ""}
                                onChange={(e) => handleChange("title", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                            <input
                                type="text"
                                value={(config.link as string) || ""}
                                onChange={(e) => handleChange("link", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                placeholder="/products?category=colecao"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Altura</label>
                            <input
                                type="text"
                                value={(config.height as string) || "400px"}
                                onChange={(e) => handleChange("height", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                placeholder="400px"
                            />
                        </div>
                    </>
                );

            case "PromoStrip":
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Texto</label>
                            <input
                                type="text"
                                value={(config.text as string) || ""}
                                onChange={(e) => handleChange("text", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cor de Fundo</label>
                                <input
                                    type="color"
                                    value={(config.backgroundColor as string) || "#1a1a1a"}
                                    onChange={(e) => handleChange("backgroundColor", e.target.value)}
                                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cor do Texto</label>
                                <input
                                    type="color"
                                    value={(config.textColor as string) || "#ffffff"}
                                    onChange={(e) => handleChange("textColor", e.target.value)}
                                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Link (opcional)</label>
                            <input
                                type="text"
                                value={(config.link as string) || ""}
                                onChange={(e) => handleChange("link", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </>
                );

            case "CategoryShowcase":
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título da Seção</label>
                            <input
                                type="text"
                                value={(config.title as string) || ""}
                                onChange={(e) => handleChange("title", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">IDs das Categorias (separados por vírgula)</label>
                            <input
                                type="text"
                                value={((config.categoryIds as string[]) || []).join(", ")}
                                onChange={(e) => handleChange("categoryIds", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                placeholder="cat1, cat2, cat3"
                            />
                            <p className="mt-1 text-xs text-gray-500">Deixe vazio para mostrar todas as categorias</p>
                        </div>
                    </>
                );

            case "TextSection":
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                            <input
                                type="text"
                                value={(config.title as string) || ""}
                                onChange={(e) => handleChange("title", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
                            <textarea
                                value={(config.content as string) || ""}
                                onChange={(e) => handleChange("content", e.target.value)}
                                rows={5}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Escreva o texto aqui..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Alinhamento</label>
                            <select
                                value={(config.alignment as string) || "center"}
                                onChange={(e) => handleChange("alignment", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="left">Esquerda</option>
                                <option value="center">Centro</option>
                                <option value="right">Direita</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cor do Fundo</label>
                                <input
                                    type="color"
                                    value={(config.backgroundColor as string) || "#f5f5f0"}
                                    onChange={(e) => handleChange("backgroundColor", e.target.value)}
                                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cor do Texto</label>
                                <input
                                    type="color"
                                    value={(config.textColor as string) || "#1a1a1a"}
                                    onChange={(e) => handleChange("textColor", e.target.value)}
                                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                                />
                            </div>
                        </div>
                    </>
                );

            case "ImageGrid":
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Número de Colunas</label>
                            <select
                                value={(config.columns as number) || 2}
                                onChange={(e) => handleChange("columns", parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="2">2 Colunas</option>
                                <option value="3">3 Colunas</option>
                                <option value="4">4 Colunas</option>
                            </select>
                        </div>
                        {[0, 1, 2, 3].map((index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-3">
                                <h4 className="font-medium text-sm mb-2">Imagem {index + 1}</h4>
                                <div className="space-y-2">
                                    <input
                                        type="url"
                                        value={((config.images as Array<{ url: string, link: string }>)?.[index]?.url) || ""}
                                        onChange={(e) => {
                                            const images = [...((config.images as Array<{ url: string, link: string }>) || [])];
                                            images[index] = { ...images[index], url: e.target.value };
                                            handleChange("images", images);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="URL da imagem"
                                    />
                                    <input
                                        type="text"
                                        value={((config.images as Array<{ url: string, link: string }>)?.[index]?.link) || ""}
                                        onChange={(e) => {
                                            const images = [...((config.images as Array<{ url: string, link: string }>) || [])];
                                            images[index] = { ...images[index], link: e.target.value };
                                            handleChange("images", images);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Link (ex: /products)"
                                    />
                                </div>
                            </div>
                        ))}
                    </>
                );

            default:
                return (
                    <div className="text-gray-500">
                        Configuração não disponível para este tipo de bloco.
                    </div>
                );
        }
    }
}
