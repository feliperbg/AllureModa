/**
 * Pre-established attributes for women's clothing e-commerce
 * These are commonly used and provide a starting point for product creation
 */

export interface PresetColor {
    value: string;
    hex: string;
}

export const PRESET_COLORS: PresetColor[] = [
    { value: "Preto", hex: "#000000" },
    { value: "Branco", hex: "#FFFFFF" },
    { value: "Off-White", hex: "#FAF9F6" },
    { value: "Vermelho", hex: "#DC2626" },
    { value: "Bordô", hex: "#800020" },
    { value: "Rosa", hex: "#EC4899" },
    { value: "Rosa Claro", hex: "#FFC0CB" },
    { value: "Nude", hex: "#E8D5B7" },
    { value: "Bege", hex: "#F5F5DC" },
    { value: "Caramelo", hex: "#C68E17" },
    { value: "Marrom", hex: "#8B4513" },
    { value: "Azul Marinho", hex: "#1E3A5F" },
    { value: "Azul Royal", hex: "#4169E1" },
    { value: "Azul Claro", hex: "#87CEEB" },
    { value: "Verde Militar", hex: "#4B5320" },
    { value: "Verde Esmeralda", hex: "#50C878" },
    { value: "Cinza", hex: "#808080" },
    { value: "Cinza Claro", hex: "#D3D3D3" },
    { value: "Dourado", hex: "#FFD700" },
    { value: "Prata", hex: "#C0C0C0" },
    { value: "Laranja", hex: "#FF8C00" },
    { value: "Amarelo", hex: "#FFD700" },
    { value: "Lilás", hex: "#C8A2C8" },
    { value: "Roxo", hex: "#800080" },
];

export const PRESET_SIZES_LETTER = ["PP", "P", "M", "G", "GG", "XG", "XXG"];

export const PRESET_SIZES_NUMERICAL = ["34", "36", "38", "40", "42", "44", "46", "48", "50"];

export const PRESET_SIZES_SHOES = ["33", "34", "35", "36", "37", "38", "39", "40", "41", "42"];

export const PRESET_MATERIALS = [
    "Algodão",
    "Poliéster",
    "Viscose",
    "Linho",
    "Seda",
    "Cetim",
    "Renda",
    "Jeans",
    "Moletom",
    "Tricô",
    "Crepe",
    "Chiffon",
    "Couro Sintético",
    "Couro Legítimo",
    "Malha",
    "Veludo",
];

/**
 * Generate a unique random SKU
 * Format: ALM-XXXXXX (7 chars total after prefix)
 * e.g., ALM-7X3K9M
 */
export function generateUniqueSKU(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed I,O,0,1 to avoid confusion
    let result = "ALM-";
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Generate SKU with variant index for batch creation
 * e.g., ALM-7X3K9M-01, ALM-7X3K9M-02
 */
export function generateVariantSKU(baseId: string, index: number): string {
    return `${baseId}-${String(index + 1).padStart(2, "0")}`;
}
