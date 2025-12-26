"use client";

import { Heart, Loader2 } from "lucide-react";
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from "@/hooks/useWishlist";
import { useUser } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface WishlistButtonProps {
    productId: string;
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function WishlistButton({ productId, className = "", size = "md" }: WishlistButtonProps) {
    const router = useRouter();
    const { data: user } = useUser();
    const { data: wishlist = [] } = useWishlist();
    const { mutate: addToWishlist, isPending: adding } = useAddToWishlist();
    const { mutate: removeFromWishlist, isPending: removing } = useRemoveFromWishlist();

    const wishlistItem = wishlist.find((item) => item.productId === productId);
    const isInWishlist = !!wishlistItem;
    const isPending = adding || removing;

    const sizeClasses = {
        sm: "p-1.5",
        md: "p-2",
        lg: "p-3",
    };

    const iconSizes = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
    };

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.info("Faça login para adicionar aos favoritos");
            router.push("/login");
            return;
        }

        if (isInWishlist && wishlistItem) {
            removeFromWishlist(wishlistItem.id);
        } else {
            addToWishlist(productId);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className={`rounded-full transition-all ${sizeClasses[size]} ${isInWishlist
                    ? "bg-red-50 text-red-500 hover:bg-red-100"
                    : "bg-white/90 text-gray-600 hover:bg-gray-100 hover:text-red-500"
                } ${className}`}
            title={isInWishlist ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
            {isPending ? (
                <Loader2 className={`${iconSizes[size]} animate-spin`} />
            ) : (
                <Heart
                    className={iconSizes[size]}
                    fill={isInWishlist ? "currentColor" : "none"}
                />
            )}
        </button>
    );
}
