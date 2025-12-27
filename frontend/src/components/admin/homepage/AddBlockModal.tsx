"use client";

interface AddBlockModalProps {
    onClose: () => void;
    onSelect: (type: string) => void;
    blockTypes: Record<string, string>;
}

export function AddBlockModal({ onClose, onSelect, blockTypes }: AddBlockModalProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Adicionar Bloco</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(blockTypes).map(([type, label]) => (
                            <button
                                key={type}
                                onClick={() => onSelect(type)}
                                className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            >
                                <div className="text-2xl mb-2">
                                    {getBlockIcon(type)}
                                </div>
                                <div className="font-medium text-sm text-gray-900">
                                    {label}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function getBlockIcon(type: string): string {
    switch (type) {
        case "HeroBanner": return "🖼️";
        case "CollectionBanner": return "🎨";
        case "FeaturedProducts": return "⭐";
        case "ProductCarousel": return "🎠";
        case "CategoryShowcase": return "📁";
        case "PromoStrip": return "📢";
        case "TextSection": return "📝";
        case "ImageGrid": return "🖼️";
        default: return "📦";
    }
}
