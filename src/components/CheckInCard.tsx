"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LuHeart, LuMessageCircle, LuStar } from "react-icons/lu";
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArtistBadges } from "./ArtistBadges";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface CheckInCardProps {
  user: {
    id: string;
    name: string;
    image: string;
  };
  concert: {
    id: string;
    name: string;
    venue: string;
    image: string;
    date: string;
    rating: number;
    artists: string[];
    genres: string[];
  };
  checkIn: {
    id: string;
    date: string;
    comment: string;
    likes: number;
    comments: number;
  };
}

export function CheckInCard({ user, concert, checkIn }: CheckInCardProps) {
  return (
    <Card className=" rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm gap-2 py-2">
      {/* User Profile Section */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href={`/profile/${user.id}`}
            className="hover:opacity-80 transition-opacity"
          >
            <Image
              src={user.image}
              alt={user.name}
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
                {user.name}
              </h3>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {formatDate(checkIn.date)}
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
              {concert.name}
            </h4>
            <p className="text-slate-600 dark:text-slate-400">
              {concert.venue}
            </p>
          </div>
          <div className="flex items-center space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <LuStar
                key={i}
                className={cn(
                  "w-4 h-4",
                  i < concert.rating
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-slate-300 dark:text-slate-600"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Artists seen */}
      <div className="px-4 pb-2">
        <ArtistBadges artists={concert.artists} />
      </div>

      {/* Concert Image */}
      <div className="relative">
        <Image
          src={concert.image}
          alt={`${concert.name} concert`}
          width={600}
          height={400}
          className="w-full h-80 object-cover"
        />
      </div>

      {/* Check-in Content */}
      <div className="p-4">
        <p className="text-slate-700 dark:text-slate-300 mb-4">
          {checkIn.comment}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 text-slate-500 hover:text-[#FF0086] transition-colors">
              <LuHeart className="w-5 h-5 text-[#FF0086] fill-[#FF0086]" />
              <span className="text-sm">{checkIn.likes}</span>
            </button>
            <button className="flex items-center space-x-2 text-slate-500 hover:text-[#03D1FE] transition-colors">
              <LuMessageCircle className="w-5 h-5" />
              <span className="text-sm">{checkIn.comments}</span>
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
