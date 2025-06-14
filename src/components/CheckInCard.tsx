"use client";

import { Card } from "@/components/ui/card";
import { LuMapPin } from "react-icons/lu";
import Link from "next/link";
import { ArtistBadges } from "./ArtistBadges";
import { StarRating, formatRelativeTime } from "@/lib/helpers";
import { ExpandableImage } from "./ExpandableImage";
import { CheckInComment } from "./CheckInComment";
import Image from "next/image";
import { useState } from "react";
import { toggleCheckInLike } from "@/lib/api";
import { toast } from "sonner";

interface CheckInCardProps {
  user: {
    id: string;
    name?: string;
    username: string;
    image?: string;
  };
  concert: {
    id: string;
    event: string;
    location: {
      name: string;
    };
    city: string;
    image: string;
    date: string;
    rating: number;
    artists: string[];
    genres: string[];
  };
  checkIn: {
    id: string;
    date: string;
    time: string;
    comment: string;
    likes: number;
    isLiked?: boolean;
    comments: {
      id: string;
      user: {
        id: string;
        name: string;
        image?: string;
      };
      text: string;
      date: string;
      time: string;
    }[];
  };
}

function CheckInCard({ user, concert, checkIn }: CheckInCardProps) {
  const [isLiked, setIsLiked] = useState(checkIn.isLiked || false);
  const [likesCount, setLikesCount] = useState(checkIn.likes);

  const handleLike = async () => {
    // Optimistically update the UI
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

    try {
      await toggleCheckInLike(checkIn.id, isLiked);
    } catch (error) {
      // Revert the optimistic update on error
      setIsLiked(isLiked);
      setLikesCount((prev) => (isLiked ? prev : prev - 1));

      // Extract the actual error message from the backend
      let errorMessage = "Failed to update like";
      if (error instanceof Error) {
        const match = error.message.match(/\{.*\}/);
        if (match?.[0]) {
          try {
            const parsed = JSON.parse(match[0]);
            errorMessage = parsed.message || error.message;
          } catch {
            errorMessage = error.message;
          }
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
      console.error("Error toggling like:", error);
    }
  };

  return (
    <Card className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm gap-2 py-2">
      {/* User Profile Section */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href={`/profile/${user.id}`}
            className="hover:opacity-80 transition-opacity"
          >
            <Image
              src={user.image || "/placeholder-avatar-user.jpg"}
              alt={user.name || user.username}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#03D1FE]/20"
            />
          </Link>
          <div>
            <Link
              href={`/profile/${user.id}`}
              className="hover:opacity-80 transition-opacity"
            >
              <h3 className="font-semibold text-slate-800 dark:text-white">
                {user.name || user.username}
              </h3>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {formatRelativeTime(checkIn.date, checkIn.time)}
            </p>
          </div>
        </div>
      </div>

      {/* Concert Info Section */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-lg text-slate-800 dark:text-white">
              {concert.event}
            </h4>
            <div className="flex items-center gap-2">
              <LuMapPin className="text-sm text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {concert.location.name}, {concert.city}
              </p>
            </div>
          </div>
          <StarRating rating={concert.rating} />
        </div>
      </div>

      {/* Artists seen */}
      <div className="px-4 pb-2">
        <ArtistBadges title="Artists seen" artists={concert.artists} />
      </div>

      {/* Concert Image - Only show if there's a real image */}
      {concert.image && concert.image !== "/placeholder-concert.jpg" && (
        <div className="relative w-full h-[300px]">
          <ExpandableImage
            src={concert.image}
            alt={`${concert.event} concert`}
          />
        </div>
      )}

      {/* Check-in Comment */}
      <CheckInComment
        comment={checkIn.comment}
        likes={likesCount}
        comments={checkIn.comments}
        isLiked={isLiked}
        onLike={handleLike}
        onComment={(comment) => {
          // TODO: Implement comment functionality
          console.log("Comment added:", comment);
        }}
      />
    </Card>
  );
}

export default CheckInCard;
