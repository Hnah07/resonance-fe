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

export function formatRelativeTime(date: string, time: string): string {
  const checkInDateTime = new Date(`${date}T${time}`);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - checkInDateTime.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) {
    return "just now";
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  }

  // If more than 24 hours, return the formatted date and time
  return `${formatDate(date)} ${time}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatEventDate(dateString: string): string {
  const eventDate = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time part for date comparison
  eventDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);

  if (eventDate.getTime() === today.getTime()) {
    return "Today";
  }
  if (eventDate.getTime() === tomorrow.getTime()) {
    return "Tomorrow";
  }
  if (eventDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  // If not one of the relative dates, format as "31 May 2025"
  return eventDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
