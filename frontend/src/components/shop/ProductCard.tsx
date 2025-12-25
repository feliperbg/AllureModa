import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
    id: string;
    name: string;
    slug: string;
    price: number;
    promotionalPrice?: number;
    imageUrl?: string;
}

export function ProductCard({ id, name, slug, price, promotionalPrice, imageUrl }: ProductCardProps) {
    const displayPrice = promotionalPrice || price;
    const hasPromo = promotionalPrice && promotionalPrice < price;

    return (
        <Link href={`/products/${slug}`} className="group text-left block">
            <div className="overflow-hidden bg-gray-100 relative">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        className="w-full h-auto aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full aspect-[3/4] bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Sem imagem</span>
                    </div>
                )}
                {hasPromo && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 font-semibold">
                        PROMO
                    </span>
                )}
            </div>
            <h3 className="mt-4 text-lg font-serif text-allure-black whitespace-normal line-clamp-2">
                {name}
            </h3>
            <div className="mt-1 flex items-center gap-2">
                {hasPromo && (
                    <span className="text-sm text-gray-400 line-through">
                        R$ {price.toFixed(2).replace('.', ',')}
                    </span>
                )}
                <p className="text-base font-sans font-semibold text-allure-black">
                    R$ {displayPrice.toFixed(2).replace('.', ',')}
                </p>
            </div>
        </Link>
    );
}
