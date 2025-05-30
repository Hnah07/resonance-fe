import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  rating: number;
  className?: string;
}

export function StarRating({ rating, className }: StarRatingProps) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star
        key={`full-${i}`}
        className="w-4 h-4 text-yellow-400 fill-yellow-400"
      />
    );
  }

  // Add half star if needed
  if (hasHalfStar) {
    stars.push(
      <StarHalf
        key="half"
        className="w-4 h-4 text-yellow-400 fill-yellow-400"
      />
    );
  }

  // Add empty stars
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Star
        key={`empty-${i}`}
        className="w-4 h-4 text-slate-300 dark:text-slate-600"
      />
    );
  }

  return (
    <div className={`flex items-center space-x-0.5 ${className || ""}`}>
      {stars}
    </div>
  );
}
