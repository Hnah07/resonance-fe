"use client";

import { Card } from "@/components/ui/card";
import { LuMapPin } from "react-icons/lu";
import Link from "next/link";
import { ArtistBadges } from "@/components/ArtistBadges";
import { StarRating, formatRelativeTime } from "@/lib/helpers";
import { ExpandableImage } from "@/components/ExpandableImage";
import { CheckInComment } from "@/components/CheckInComment";
import { useState } from "react";
import { toggleCheckInLike } from "@/lib/api";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
      id: string;
      name: string;
    };
    city: string;
    country: string;
    image: string;
    date: string;
    rating: number;
    artists: string[];
  };
  checkIn: {
    id: string;
    date: string;
    time: string;
    comment: string;
    likes: number;
    isLiked?: boolean;
    comments: Array<{
      id: string;
      user: {
        id: string;
        name: string;
        image?: string;
      };
      text: string;
      date: string;
      time: string;
    }>;
    photos: Array<{
      id: string;
      url: string;
      caption: string | null;
    }>;
  };
}

function CheckInCard({ user, concert, checkIn }: CheckInCardProps) {
  const [isLiked, setIsLiked] = useState(checkIn.isLiked || false);
  const [likesCount, setLikesCount] = useState(checkIn.likes);
  const [comments, setComments] = useState(checkIn.comments);

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
            href={`/profile/${user.username}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image} />
              <AvatarFallback>
                {user.name?.charAt(0) || user.username.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-800 dark:text-white">
                {user.name || "Anonymous"}
              </span>
              <span className="text-xs text-muted-foreground">
                @{user.username}
              </span>
            </div>
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {formatRelativeTime(checkIn.date, checkIn.time)}
          </p>
        </div>
      </div>

      {/* Concert Info Section */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-lg text-slate-800 dark:text-white">
              {concert.event || "Unknown Event"}
            </h4>
            <div className="flex items-center gap-2">
              <LuMapPin className="text-sm text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {concert.location?.name || "Unknown Location"},{" "}
                {concert.city || "Unknown City"},{" "}
                {concert.country || "Unknown Country"}
              </p>
            </div>
          </div>
          <StarRating rating={concert.rating || 0} />
        </div>
      </div>

      {/* Artists seen */}
      <div className="px-4 pb-2">
        <ArtistBadges title="Artists" artists={concert.artists} />
      </div>

      {/* Check-in Photos */}
      {checkIn.photos && checkIn.photos.length > 0 && (
        <div className="relative w-full">
          {checkIn.photos.length === 1 ? (
            <div className="relative w-full h-[300px]">
              <ExpandableImage
                src={checkIn.photos[0].url}
                alt={
                  checkIn.photos[0].caption ||
                  `${concert.event || "Concert"} photo`
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1">
              {checkIn.photos.slice(0, 4).map((photo, index) => (
                <div
                  key={photo.id}
                  className={`relative ${
                    index === 0 ? "col-span-2 h-[300px]" : "h-[150px]"
                  }`}
                >
                  <ExpandableImage
                    src={photo.url}
                    alt={
                      photo.caption ||
                      `${concert.event || "Concert"} photo ${index + 1}`
                    }
                  />
                  {index === 3 && checkIn.photos.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">
                        +{checkIn.photos.length - 4} more
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Check-in Comment */}
      <CheckInComment
        comment={checkIn.comment}
        likes={likesCount}
        comments={comments}
        isLiked={isLiked}
        onLike={handleLike}
        onComment={(comment) => {
          // Update comments state with the new comment
          setComments((prevComments) => [...prevComments, comment]);
        }}
        onUpdateComments={(updatedComments) => {
          // Update comments state with the new list
          setComments(updatedComments);
        }}
        checkInId={checkIn.id}
      />
    </Card>
  );
}

export default CheckInCard;
