"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface BlockConfig {
    [key: string]: unknown;
}

interface PageBlock {
    id: string;
    type: string;
    order: number;
    config: BlockConfig;
}

interface SortableBlockProps {
    block: PageBlock;
    label: string;
    onEdit: () => void;
    onDelete: () => void;
}

export function SortableBlock({ block, label, onEdit, onDelete }: SortableBlockProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const getBlockPreview = () => {
        const config = block.config;
        switch (block.type) {
            case "HeroBanner":
                return config.title as string || "Sem título";
            case "FeaturedProducts":
                return `${config.mode === "manual" ? "Manual" : config.mode} - ${config.limit || 4} produtos`;
            case "CollectionBanner":
                return config.title as string || "Sem título";
            case "PromoStrip":
                return config.text as string || "Sem texto";
            default:
                return JSON.stringify(config).slice(0, 50);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex items-center p-4">
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="mr-3 p-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                    title="Arraste para reordenar"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                </button>

                {/* Block Info */}
                <div className="flex-1">
                    <div className="font-medium text-gray-900">{label}</div>
                    <div className="text-sm text-gray-500 truncate max-w-md">
                        {getBlockPreview()}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onEdit}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar bloco"
                    >
                        ⚙️
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover bloco"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    );
}
