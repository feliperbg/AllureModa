"use client";

import { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp, Filter, SlidersHorizontal } from "lucide-react";
import { useBrands, useCategories } from "@/hooks/useProducts";
import { PRESET_COLORS, PRESET_SIZES_LETTER, PresetColor } from "@/constants/productAttributes";

export interface FilterState {
    colors: string[];
    sizes: string[];
    priceMin: number | null;
    priceMax: number | null;
    brandId: string;
    categorySlug: string;
    search: string;
}

const defaultFilters: FilterState = {
    colors: [],
    sizes: [],
    priceMin: null,
    priceMax: null,
    brandId: "",
    categorySlug: "",
    search: "",
};

interface ProductFiltersProps {
    filters: FilterState;
    onChange: (filters: FilterState) => void;
    onClear: () => void;
    totalProducts?: number;
}

export function ProductFilters({ filters, onChange, onClear, totalProducts }: ProductFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["colors", "sizes"]));

    const { data: brands = [] } = useBrands();
    const { data: categories = [] } = useCategories();

    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(section)) {
            newExpanded.delete(section);
        } else {
            newExpanded.add(section);
        }
        setExpandedSections(newExpanded);
    };

    const toggleColor = (color: string) => {
        const newColors = filters.colors.includes(color)
            ? filters.colors.filter((c) => c !== color)
            : [...filters.colors, color];
        onChange({ ...filters, colors: newColors });
    };

    const toggleSize = (size: string) => {
        const newSizes = filters.sizes.includes(size)
            ? filters.sizes.filter((s) => s !== size)
            : [...filters.sizes, size];
        onChange({ ...filters, sizes: newSizes });
    };

    const activeFiltersCount =
        filters.colors.length +
        filters.sizes.length +
        (filters.priceMin ? 1 : 0) +
        (filters.priceMax ? 1 : 0) +
        (filters.brandId ? 1 : 0);

    const FilterContent = () => (
        <div className="space-y-6">
            {/* Colors */}
            <div>
                <button
                    onClick={() => toggleSection("colors")}
                    className="flex items-center justify-between w-full text-sm font-medium text-gray-900"
                >
                    Cores {filters.colors.length > 0 && `(${filters.colors.length})`}
                    {expandedSections.has("colors") ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                </button>
                {expandedSections.has("colors") && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {PRESET_COLORS.slice(0, 12).map((color) => (
                            <button
                                key={color.value}
                                onClick={() => toggleColor(color.value)}
                                className={`relative w-8 h-8 rounded-full border-2 transition-all ${filters.colors.includes(color.value)
                                        ? "border-allure-gold ring-2 ring-allure-gold ring-offset-1"
                                        : "border-gray-200 hover:border-gray-400"
                                    }`}
                                style={{ backgroundColor: color.hex }}
                                title={color.value}
                            >
                                {filters.colors.includes(color.value) && (
                                    <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold drop-shadow">
                                        ✓
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Sizes */}
            <div>
                <button
                    onClick={() => toggleSection("sizes")}
                    className="flex items-center justify-between w-full text-sm font-medium text-gray-900"
                >
                    Tamanhos {filters.sizes.length > 0 && `(${filters.sizes.length})`}
                    {expandedSections.has("sizes") ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                </button>
                {expandedSections.has("sizes") && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {PRESET_SIZES_LETTER.map((size) => (
                            <button
                                key={size}
                                onClick={() => toggleSize(size)}
                                className={`px-3 py-1.5 text-sm border rounded transition-all ${filters.sizes.includes(size)
                                        ? "border-allure-gold bg-allure-gold/10 text-allure-black font-medium"
                                        : "border-gray-200 text-gray-600 hover:border-gray-400"
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Price Range */}
            <div>
                <button
                    onClick={() => toggleSection("price")}
                    className="flex items-center justify-between w-full text-sm font-medium text-gray-900"
                >
                    Preço
                    {expandedSections.has("price") ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                </button>
                {expandedSections.has("price") && (
                    <div className="mt-3 flex gap-2 items-center">
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.priceMin || ""}
                            onChange={(e) =>
                                onChange({ ...filters, priceMin: e.target.value ? Number(e.target.value) : null })
                            }
                            className="w-24 border border-gray-200 rounded px-2 py-1.5 text-sm"
                        />
                        <span className="text-gray-400">—</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters.priceMax || ""}
                            onChange={(e) =>
                                onChange({ ...filters, priceMax: e.target.value ? Number(e.target.value) : null })
                            }
                            className="w-24 border border-gray-200 rounded px-2 py-1.5 text-sm"
                        />
                    </div>
                )}
            </div>

            {/* Brand */}
            <div>
                <button
                    onClick={() => toggleSection("brand")}
                    className="flex items-center justify-between w-full text-sm font-medium text-gray-900"
                >
                    Marca {filters.brandId && "(1)"}
                    {expandedSections.has("brand") ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                </button>
                {expandedSections.has("brand") && (
                    <div className="mt-3 space-y-1">
                        {brands.map((brand) => (
                            <button
                                key={brand.id}
                                onClick={() =>
                                    onChange({
                                        ...filters,
                                        brandId: filters.brandId === brand.id ? "" : brand.id,
                                    })
                                }
                                className={`block w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${filters.brandId === brand.id
                                        ? "bg-allure-gold/10 text-allure-black font-medium"
                                        : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                {brand.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
                <button
                    onClick={onClear}
                    className="w-full py-2 text-sm text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
                >
                    Limpar filtros ({activeFiltersCount})
                </button>
            )}
        </div>
    );

    return (
        <>
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm"
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtros
                    {activeFiltersCount > 0 && (
                        <span className="bg-allure-gold text-white px-2 py-0.5 rounded-full text-xs">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-24">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Filtros</h2>
                    <FilterContent />
                </div>
            </aside>

            {/* Mobile Drawer */}
            {isOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-medium text-gray-900">Filtros</h2>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <FilterContent />
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full mt-6 py-3 bg-allure-black text-white rounded font-medium"
                        >
                            Ver {totalProducts} produtos
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export { defaultFilters };
