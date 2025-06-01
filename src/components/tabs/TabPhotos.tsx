"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LuMapPin, LuCalendar } from "react-icons/lu";
import { formatEventDate } from "@/lib/helpers";

const checkIns = [
  {
    user: {
      id: "1",
      name: "John Doe",
      username: "johndoe",
      image: "/placeholder-avatar-user.jpg",
    },
    concert: {
      id: "1",
      event: "Metallica World Tour 2024",
      location: "Sportpaleis",
      city: "Antwerp",
      country: "Belgium",
      image: "/placeholder-concert.jpg",
      date: "2024-03-15",
      rating: 5,
      artists: ["Metallica", "Five Finger Death Punch"],
      genres: ["Metal", "Heavy Metal"],
    },
    checkIn: {
      id: "1",
      date: "2024-03-15",
      comment:
        "Incredible show! The energy was amazing and the setlist was perfect. James Hetfield's voice was on point!",
      likes: 42,
      comments: [],
    },
  },
  {
    user: {
      id: "1",
      name: "John Doe",
      username: "johndoe",
      image: "/placeholder-avatar-user.jpg",
    },
    concert: {
      id: "2",
      event: "Tomorrowland 2024",
      location: "De Schorre",
      city: "Boom",
      country: "Belgium",
      image: "/summer-festival.jpg",
      date: "2024-02-20",
      rating: 4,
      artists: [
        "Johan Gielen",
        "Martin Garrix",
        "David Guetta",
        "Armin van Buuren",
      ],
      genres: ["EDM", "House", "Trance"],
    },
    checkIn: {
      id: "2",
      date: "2024-02-20",
      comment:
        "Best festival experience ever! The production was mind-blowing and the atmosphere was electric.",
      likes: 89,
      comments: [],
    },
  },
];

export function TabPhotos() {
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [selectedCheckIn, setSelectedCheckIn] = useState<
    (typeof checkIns)[0] | null
  >(null);

  const handleImageLoad = (src: string) => {
    setLoadedImages((prev) => ({ ...prev, [src]: true }));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {checkIns.map((checkIn, index) => (
          <div
            key={checkIn.checkIn.id}
            className="aspect-square bg-muted rounded-lg overflow-hidden relative group cursor-pointer"
            onClick={() => setSelectedCheckIn(checkIn)}
          >
            {/* Loading skeleton */}
            {!loadedImages[checkIn.concert.image] && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            <Image
              src={checkIn.concert.image}
              alt={checkIn.concert.event}
              fill
              className={`
                object-cover transition-all duration-500
                ${
                  loadedImages[checkIn.concert.image]
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95"
                }
                group-hover:scale-105
              `}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onLoad={() => handleImageLoad(checkIn.concert.image)}
              priority={index < 2}
            />
          </div>
        ))}
      </div>

      <Dialog
        open={!!selectedCheckIn}
        onOpenChange={() => setSelectedCheckIn(null)}
      >
        <DialogContent className="w-[95vw] max-w-[425px] p-4 sm:p-6">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg sm:text-xl">
              {selectedCheckIn?.concert.event}
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-[200px] sm:h-[250px] mb-4">
            <Image
              src={selectedCheckIn?.concert.image || ""}
              alt={selectedCheckIn?.concert.event || ""}
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 425px) 95vw, 425px"
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LuCalendar className="w-4 h-4 flex-shrink-0" />
              {formatEventDate(selectedCheckIn?.concert.date || "")}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LuMapPin className="w-4 h-4 flex-shrink-0" />
              {selectedCheckIn?.concert.location},{" "}
              {selectedCheckIn?.concert.city},{" "}
              {selectedCheckIn?.concert.country}
            </div>
            <div className="pt-1">
              <p className="text-sm text-muted-foreground font-medium mb-1">
                Review:
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {selectedCheckIn?.checkIn.comment}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
