"use client";

import { Card } from "@/components/ui/card";
import { LuMapPin } from "react-icons/lu";
import Link from "next/link";
import { ArtistBadges } from "./ArtistBadges";
import { StarRating, formatRelativeTime } from "@/lib/helpers";
import { ExpandableImage } from "./ExpandableImage";
import { CheckInComment } from "./CheckInComment";
import Image from "next/image";

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

      {/* Concert Image */}
      <div className="relative w-full h-[300px]">
        <ExpandableImage src={concert.image} alt={`${concert.event} concert`} />
      </div>

      {/* Check-in Comment */}
      <CheckInComment
        comment={checkIn.comment}
        likes={checkIn.likes}
        comments={checkIn.comments}
        onLike={() => {
          // TODO: Implement like functionality
          console.log("Like clicked");
        }}
        onComment={(comment) => {
          // TODO: Implement comment functionality
          console.log("Comment added:", comment);
        }}
      />
    </Card>
  );
}

export default CheckInCard;
