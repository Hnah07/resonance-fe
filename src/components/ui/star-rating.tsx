"use client";

import { Star, StarHalf } from "lucide-react";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
}

export function StarRating({
  rating,
  onRatingChange,
  className,
  size = "md",
  readonly = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isHoveringHalf, setIsHoveringHalf] = useState<boolean>(false);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, index: number) => {
      if (readonly) return;

      const star = e.currentTarget;
      const rect = star.getBoundingClientRect();
      const isHalf = e.clientX - rect.left < rect.width / 2;
      setIsHoveringHalf(isHalf);
      setHoverRating(isHalf ? index + 0.5 : index + 1);
    },
    [readonly]
  );

  const handleMouseLeave = useCallback(() => {
    if (readonly) return;
    setHoverRating(null);
    setIsHoveringHalf(false);
  }, [readonly]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, index: number) => {
      if (readonly || !onRatingChange) return;

      const star = e.currentTarget;
      const rect = star.getBoundingClientRect();
      const isHalf = e.clientX - rect.left < rect.width / 2;
      const newRating = isHalf ? index + 0.5 : index + 1;
      onRatingChange(newRating);
    },
    [readonly, onRatingChange]
  );

  const displayRating = hoverRating ?? rating;
  const stars = [];

  for (let i = 0; i < 5; i++) {
    const starValue = i + 1;
    const isHalfStar =
      displayRating > i &&
      displayRating < starValue &&
      (isHoveringHalf || displayRating % 1 !== 0);
    const isFullStar = displayRating >= starValue;

    stars.push(
      <div
        key={i}
        className={cn("relative cursor-pointer", readonly && "cursor-default")}
        onMouseMove={(e) => handleMouseMove(e, i)}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => handleClick(e, i)}
      >
        {isHalfStar ? (
          <StarHalf
            className={cn(sizeClasses[size], "text-yellow-400 fill-yellow-400")}
          />
        ) : (
          <Star
            className={cn(
              sizeClasses[size],
              isFullStar
                ? "text-yellow-400 fill-yellow-400"
                : "text-slate-300 dark:text-slate-600"
            )}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center space-x-0.5",
        !readonly && "cursor-pointer",
        className
      )}
    >
      {stars}
    </div>
  );
}
