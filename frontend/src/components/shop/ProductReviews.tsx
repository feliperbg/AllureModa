"use client";

import { useState } from "react";
import { Star, User, Loader2 } from "lucide-react";
import { useProductReviews, useCreateReview, calculateAverageRating, Review } from "@/hooks/useReviews";
import { useUser } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ProductReviewsProps {
    productId: string;
    productName?: string;
}

function StarRating({
    rating,
    onRatingChange,
    interactive = false,
    size = "md",
}: {
    rating: number;
    onRatingChange?: (rating: number) => void;
    interactive?: boolean;
    size?: "sm" | "md" | "lg";
}) {
    const [hoverRating, setHoverRating] = useState(0);

    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
    };

    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={!interactive}
                    onClick={() => onRatingChange?.(star)}
                    onMouseEnter={() => interactive && setHoverRating(star)}
                    onMouseLeave={() => interactive && setHoverRating(0)}
                    className={interactive ? "cursor-pointer" : "cursor-default"}
                >
                    <Star
                        className={`${sizeClasses[size]} ${(hoverRating || rating) >= star
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-200 text-gray-200"
                            }`}
                    />
                </button>
            ))}
        </div>
    );
}

function ReviewForm({
    productId,
    onSuccess,
}: {
    productId: string;
    onSuccess?: () => void;
}) {
    const { data: user } = useUser();
    const { mutate: createReview, isPending } = useCreateReview();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.info("Faça login para avaliar");
            return;
        }

        if (rating === 0) {
            toast.warning("Selecione uma avaliação");
            return;
        }

        createReview(
            { productId, rating, comment: comment.trim() || undefined },
            {
                onSuccess: () => {
                    setRating(0);
                    setComment("");
                    onSuccess?.();
                },
            }
        );
    };

    if (!user) {
        return (
            <div className="text-center py-4 text-gray-500">
                <a href="/login" className="text-allure-gold hover:underline">
                    Faça login
                </a>{" "}
                para deixar sua avaliação
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sua avaliação
                </label>
                <StarRating rating={rating} onRatingChange={setRating} interactive size="lg" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comentário (opcional)
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Conte sua experiência com este produto..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-allure-gold focus:border-transparent"
                />
            </div>
            <button
                type="submit"
                disabled={isPending || rating === 0}
                className="px-6 py-2 bg-allure-black text-white font-medium rounded hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
            >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Enviar Avaliação
            </button>
        </form>
    );
}

function ReviewCard({ review }: { review: Review }) {
    const formattedDate = new Date(review.createdAt).toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <div className="border-b border-gray-100 py-4 last:border-0">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900">
                            {review.user?.firstName || "Usuário"} {review.user?.lastName?.charAt(0)}.
                        </span>
                        <StarRating rating={review.rating} size="sm" />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{formattedDate}</p>
                    {review.comment && (
                        <p className="mt-2 text-gray-700 text-sm">{review.comment}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
    const { data: reviews = [], isLoading } = useProductReviews(productId);
    const averageRating = calculateAverageRating(reviews);

    return (
        <div className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-bold font-serif text-allure-black mb-6">
                Avaliações
                {reviews.length > 0 && (
                    <span className="text-lg font-normal text-gray-500 ml-2">
                        ({reviews.length})
                    </span>
                )}
            </h2>

            {/* Summary */}
            {reviews.length > 0 && (
                <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="text-4xl font-bold text-allure-black">{averageRating}</div>
                    <div>
                        <StarRating rating={Math.round(averageRating)} size="md" />
                        <p className="text-sm text-gray-500 mt-1">
                            Baseado em {reviews.length} avaliação{reviews.length !== 1 ? "ões" : ""}
                        </p>
                    </div>
                </div>
            )}

            {/* Review Form */}
            <div className="mb-8 p-4 bg-white border rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Deixe sua avaliação</h3>
                <ReviewForm productId={productId} />
            </div>

            {/* Reviews List */}
            {isLoading ? (
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/4" />
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : reviews.length > 0 ? (
                <div>
                    {reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-8">
                    Nenhuma avaliação ainda. Seja o primeiro a avaliar!
                </p>
            )}
        </div>
    );
}

export { StarRating };
