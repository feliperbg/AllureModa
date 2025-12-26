"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, X, Palette, Ruler, Shirt } from "lucide-react";
import {
    PRESET_COLORS,
    PRESET_SIZES_LETTER,
    PRESET_SIZES_NUMERICAL,
    PRESET_MATERIALS,
    PresetColor,
    generateUniqueSKU,
} from "@/constants/productAttributes";

export interface VariantData {
    sku: string;
    color: string;
    colorHex?: string;
    size: string;
    material?: string;
    price: number;
    stock: number;
}

interface VariantMatrixEditorProps {
    basePrice: number;
    variants: VariantData[];
    onChange: (variants: VariantData[]) => void;
    onMaterialChange?: (material: string) => void;
}

export function VariantMatrixEditor({ basePrice, variants, onChange, onMaterialChange }: VariantMatrixEditorProps) {
    // Selected options
    const [selectedColors, setSelectedColors] = useState<PresetColor[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedMaterial, setSelectedMaterial] = useState("");
    const [sizeType, setSizeType] = useState<"letter" | "numerical">("letter");
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showMaterialPicker, setShowMaterialPicker] = useState(false);
    const [customColor, setCustomColor] = useState({ value: "", hex: "#000000" });
    const [customMaterial, setCustomMaterial] = useState("");

    // Matrix data: colorValue -> sizeValue -> { price, stock }
    const [matrixData, setMatrixData] = useState<Record<string, Record<string, { price: number; stock: number }>>>({});

    // Initialize from existing variants
    useEffect(() => {
        if (variants.length > 0 && selectedColors.length === 0) {
            const colorsFromVariants: PresetColor[] = [];
            const sizesFromVariants: string[] = [];
            const newMatrixData: Record<string, Record<string, { price: number; stock: number }>> = {};
            let materialFromVariants = "";

            variants.forEach((v) => {
                if (!colorsFromVariants.find((c) => c.value === v.color)) {
                    colorsFromVariants.push({ value: v.color, hex: v.colorHex || "#808080" });
                }
                if (!sizesFromVariants.includes(v.size)) {
                    sizesFromVariants.push(v.size);
                }
                if (v.material && !materialFromVariants) {
                    materialFromVariants = v.material;
                }
                if (!newMatrixData[v.color]) {
                    newMatrixData[v.color] = {};
                }
                newMatrixData[v.color][v.size] = { price: v.price, stock: v.stock };
            });

            setSelectedColors(colorsFromVariants);
            setSelectedSizes(sizesFromVariants);
            setSelectedMaterial(materialFromVariants);
            setMatrixData(newMatrixData);
        }
    }, [variants]);

    // Rebuild variants when matrix changes
    useEffect(() => {
        if (selectedColors.length === 0 || selectedSizes.length === 0) return;

        const newVariants: VariantData[] = [];
        const baseSku = generateUniqueSKU();

        selectedColors.forEach((color, colorIdx) => {
            selectedSizes.forEach((size, sizeIdx) => {
                const cellData = matrixData[color.value]?.[size] || { price: basePrice, stock: 0 };
                const variantIndex = colorIdx * selectedSizes.length + sizeIdx;

                newVariants.push({
                    sku: `${baseSku}-${String(variantIndex + 1).padStart(2, "0")}`,
                    color: color.value,
                    colorHex: color.hex,
                    size: size,
                    material: selectedMaterial,
                    price: cellData.price,
                    stock: cellData.stock,
                });
            });
        });

        onChange(newVariants);
    }, [selectedColors, selectedSizes, selectedMaterial, matrixData, basePrice]);

    // Notify parent of material change
    useEffect(() => {
        if (onMaterialChange && selectedMaterial) {
            onMaterialChange(selectedMaterial);
        }
    }, [selectedMaterial, onMaterialChange]);

    const availableSizes = sizeType === "letter" ? PRESET_SIZES_LETTER : PRESET_SIZES_NUMERICAL;

    const toggleColor = (color: PresetColor) => {
        if (selectedColors.find((c) => c.value === color.value)) {
            setSelectedColors(selectedColors.filter((c) => c.value !== color.value));
            const newMatrix = { ...matrixData };
            delete newMatrix[color.value];
            setMatrixData(newMatrix);
        } else {
            setSelectedColors([...selectedColors, color]);
            const newMatrix = { ...matrixData };
            newMatrix[color.value] = {};
            selectedSizes.forEach((size) => {
                newMatrix[color.value][size] = { price: basePrice, stock: 0 };
            });
            setMatrixData(newMatrix);
        }
    };

    const toggleSize = (size: string) => {
        if (selectedSizes.includes(size)) {
            setSelectedSizes(selectedSizes.filter((s) => s !== size));
            const newMatrix = { ...matrixData };
            Object.keys(newMatrix).forEach((color) => {
                delete newMatrix[color][size];
            });
            setMatrixData(newMatrix);
        } else {
            setSelectedSizes([...selectedSizes, size]);
            const newMatrix = { ...matrixData };
            selectedColors.forEach((color) => {
                if (!newMatrix[color.value]) newMatrix[color.value] = {};
                newMatrix[color.value][size] = { price: basePrice, stock: 0 };
            });
            setMatrixData(newMatrix);
        }
    };

    const updateCell = (color: string, size: string, field: "price" | "stock", value: number) => {
        setMatrixData((prev) => ({
            ...prev,
            [color]: {
                ...prev[color],
                [size]: {
                    ...prev[color]?.[size],
                    [field]: value,
                },
            },
        }));
    };

    const addCustomColor = () => {
        if (!customColor.value.trim()) return;
        if (selectedColors.find((c) => c.value === customColor.value)) return;

        const newColor = { value: customColor.value, hex: customColor.hex };
        setSelectedColors([...selectedColors, newColor]);

        const newMatrix = { ...matrixData };
        newMatrix[newColor.value] = {};
        selectedSizes.forEach((size) => {
            newMatrix[newColor.value][size] = { price: basePrice, stock: 0 };
        });
        setMatrixData(newMatrix);

        setCustomColor({ value: "", hex: "#000000" });
    };

    const addCustomMaterial = () => {
        if (!customMaterial.trim()) return;
        setSelectedMaterial(customMaterial);
        setCustomMaterial("");
        setShowMaterialPicker(false);
    };

    const totalStock = useMemo(() => {
        let total = 0;
        Object.values(matrixData).forEach((sizes) => {
            Object.values(sizes).forEach((cell) => {
                total += cell.stock || 0;
            });
        });
        return total;
    }, [matrixData]);

    return (
        <div className="space-y-6">
            {/* Material Selector */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Shirt className="h-4 w-4" />
                        Material do Produto
                    </label>
                    <button
                        type="button"
                        onClick={() => setShowMaterialPicker(!showMaterialPicker)}
                        className="text-sm text-allure-gold hover:underline"
                    >
                        {showMaterialPicker ? "Fechar" : "+ Selecionar Material"}
                    </button>
                </div>

                {selectedMaterial ? (
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white px-3 py-1 rounded-full border shadow-sm text-sm">
                            {selectedMaterial}
                        </span>
                        <button
                            type="button"
                            onClick={() => setSelectedMaterial("")}
                            className="text-gray-400 hover:text-red-500"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <span className="text-sm text-gray-400">Nenhum material selecionado</span>
                )}

                {showMaterialPicker && (
                    <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
                        <div className="flex flex-wrap gap-2">
                            {PRESET_MATERIALS.map((material) => (
                                <button
                                    key={material}
                                    type="button"
                                    onClick={() => {
                                        setSelectedMaterial(material);
                                        setShowMaterialPicker(false);
                                    }}
                                    className={`px-3 py-1 rounded-full border text-sm transition-all ${selectedMaterial === material
                                            ? "border-allure-gold bg-allure-gold/10"
                                            : "border-gray-300 hover:border-gray-400"
                                        }`}
                                >
                                    {material}
                                </button>
                            ))}
                        </div>

                        {/* Custom Material */}
                        <div className="flex gap-2 pt-2 border-t">
                            <input
                                value={customMaterial}
                                onChange={(e) => setCustomMaterial(e.target.value)}
                                placeholder="Material personalizado"
                                className="flex-1 border p-2 rounded text-sm"
                            />
                            <button
                                type="button"
                                onClick={addCustomMaterial}
                                className="px-4 py-2 bg-allure-black text-white rounded text-sm hover:bg-gray-800"
                            >
                                Adicionar
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Color Selector */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Cores Disponíveis
                    </label>
                    <button
                        type="button"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="text-sm text-allure-gold hover:underline"
                    >
                        {showColorPicker ? "Fechar" : "+ Selecionar Cores"}
                    </button>
                </div>

                {/* Selected Colors */}
                <div className="flex flex-wrap gap-2 mb-2">
                    {selectedColors.map((color) => (
                        <div
                            key={color.value}
                            className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border shadow-sm"
                        >
                            <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-sm">{color.value}</span>
                            <button
                                type="button"
                                onClick={() => toggleColor(color)}
                                className="text-gray-400 hover:text-red-500"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                    {selectedColors.length === 0 && (
                        <span className="text-sm text-gray-400">Nenhuma cor selecionada</span>
                    )}
                </div>

                {/* Color Picker */}
                {showColorPicker && (
                    <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
                        <div className="flex flex-wrap gap-2">
                            {PRESET_COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => toggleColor(color)}
                                    className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm transition-all ${selectedColors.find((c) => c.value === color.value)
                                            ? "border-allure-gold bg-allure-gold/10"
                                            : "border-gray-300 hover:border-gray-400"
                                        }`}
                                >
                                    <div
                                        className="w-4 h-4 rounded-full border"
                                        style={{ backgroundColor: color.hex }}
                                    />
                                    {color.value}
                                </button>
                            ))}
                        </div>

                        {/* Custom Color */}
                        <div className="flex gap-2 pt-2 border-t">
                            <input
                                type="color"
                                value={customColor.hex}
                                onChange={(e) => setCustomColor((c) => ({ ...c, hex: e.target.value }))}
                                className="w-10 h-10 rounded cursor-pointer"
                            />
                            <input
                                value={customColor.value}
                                onChange={(e) => setCustomColor((c) => ({ ...c, value: e.target.value }))}
                                placeholder="Nome da cor personalizada"
                                className="flex-1 border p-2 rounded text-sm"
                            />
                            <button
                                type="button"
                                onClick={addCustomColor}
                                className="px-4 py-2 bg-allure-black text-white rounded text-sm hover:bg-gray-800"
                            >
                                Adicionar
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Size Selector */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Tamanhos Disponíveis
                    </label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setSizeType("letter")}
                            className={`text-xs px-2 py-1 rounded ${sizeType === "letter" ? "bg-allure-gold text-white" : "bg-gray-100"
                                }`}
                        >
                            P/M/G
                        </button>
                        <button
                            type="button"
                            onClick={() => setSizeType("numerical")}
                            className={`text-xs px-2 py-1 rounded ${sizeType === "numerical" ? "bg-allure-gold text-white" : "bg-gray-100"
                                }`}
                        >
                            34-50
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => (
                        <button
                            key={size}
                            type="button"
                            onClick={() => toggleSize(size)}
                            className={`px-4 py-2 rounded border text-sm font-medium transition-all ${selectedSizes.includes(size)
                                    ? "border-allure-gold bg-allure-gold/10 text-allure-black"
                                    : "border-gray-300 text-gray-600 hover:border-gray-400"
                                }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            {/* Variant Matrix */}
            {selectedColors.length > 0 && selectedSizes.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Estoque e Preço por Variante</label>
                        <span className="text-sm text-gray-500">
                            Total em estoque: <strong>{totalStock}</strong> unidades
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border p-2 text-left text-sm font-medium">Cor</th>
                                    {selectedSizes.map((size) => (
                                        <th key={size} className="border p-2 text-center text-sm font-medium min-w-[100px]">
                                            {size}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {selectedColors.map((color) => (
                                    <tr key={color.value}>
                                        <td className="border p-2">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-4 h-4 rounded-full border"
                                                    style={{ backgroundColor: color.hex }}
                                                />
                                                <span className="text-sm">{color.value}</span>
                                            </div>
                                        </td>
                                        {selectedSizes.map((size) => {
                                            const cell = matrixData[color.value]?.[size] || { price: basePrice, stock: 0 };
                                            return (
                                                <td key={size} className="border p-1">
                                                    <div className="flex flex-col gap-1">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={cell.stock}
                                                            onChange={(e) =>
                                                                updateCell(color.value, size, "stock", parseInt(e.target.value) || 0)
                                                            }
                                                            placeholder="Qtd"
                                                            className="w-full border p-1 rounded text-sm text-center"
                                                        />
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={cell.price}
                                                            onChange={(e) =>
                                                                updateCell(color.value, size, "price", parseFloat(e.target.value) || 0)
                                                            }
                                                            placeholder="R$"
                                                            className="w-full border p-1 rounded text-xs text-center text-gray-600"
                                                        />
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Primeira linha: quantidade em estoque | Segunda linha: preço (R$)
                    </p>
                </div>
            )}
        </div>
    );
}
