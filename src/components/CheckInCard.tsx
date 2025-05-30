"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LuMapPin } from "react-icons/lu";
import { MoreHorizontal } from "lucide-react";
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
    location: string;
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
    }[];
  };
}

export function CheckInCard({ user, concert, checkIn }: CheckInCardProps) {
  // Mock comments data for now
  const mockComments = [
    {
      id: "1",
      user: {
        id: "user1",
        name: "John Doe",
        image: "/placeholder-avatar-user.jpg",
      },
      text: "Amazing show! The energy was incredible.",
      date: "2 hours ago",
    },
    {
      id: "2",
      user: {
        id: "user2",
        name: "Jane Smith",
        image: "/placeholder-avatar-user.jpg",
      },
      text: "Best concert of the year!",
      date: "3 hours ago",
    },
  ];

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
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Concert Info Section */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-lg text-slate-800 dark:text-white">
              {concert.event}
            </h4>
            <div className="flex items-center space-x-1">
              <LuMapPin className="w-4 h-4" />
              <p className="text-slate-600 dark:text-slate-400">
                {concert.location}, {concert.city}
              </p>
            </div>
          </div>
          <StarRating rating={concert.rating} />
        </div>
      </div>

      {/* Artists seen */}
      <div className="px-4 pb-2">
        <ArtistBadges artists={concert.artists} />
      </div>

      {/* Concert Image */}
      <ExpandableImage src={concert.image} alt={`${concert.event} concert`} />

      {/* Check-in Comment */}
      <CheckInComment
        comment={checkIn.comment}
        likes={checkIn.likes}
        comments={mockComments}
        onLike={() => {
          // TODO: Implement like functionality
          console.log("Like clicked");
        }}
        onComment={() => {
          // TODO: Implement comment functionality
          console.log("Comment clicked");
        }}
      />
    </Card>
  );
}
