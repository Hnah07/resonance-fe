"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { GradientButton } from "@/components/ui/gradient-button";
import { DetailsButton } from "@/components/ui/details-button";
import { InterestedCounter } from "@/components/InterestedCounter";
import { GenreBadges } from "@/components/GenreBadges";
import { ArtistBadges } from "@/components/ArtistBadges";
import Image from "next/image";
import { LuMapPin, LuX, LuCalendar } from "react-icons/lu";
import { useState } from "react";

// Example genres - these will be fetched from the database later on
const genres = [
  "Rock",
  "Indie",
  "Pop",
  "Electronic",
  "Hip Hop",
  "Jazz",
  "Blues",
];

// Example artists - these will be fetched from the database later on
const artists = [
  "Arctic Monkeys",
  "The Strokes",
  "Vampire Weekend",
  "The Maccabees",
  "Pulp",
  "Arcade Fire",
];

// TODO: if there is no concert image, use a placeholder image

export function ConcertCard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="flex justify-center w-full mb-6">
      <Card className="w-full sm:w-full max-w-sm sm:max-w-none overflow-hidden rounded-2xl shadow-lg !p-0 !gap-0">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <div
            className="relative aspect-[4/3] sm:aspect-[16/6] cursor-pointer"
            onClick={() => setIsDialogOpen(true)}
          >
            <Image
              src="/summer-festival.jpg"
              alt="Summer Music Festival"
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              priority
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-4">
              <h3 className="text-lg font-semibold">Summer Music Festival</h3>
              <div className="flex flex-row items-center gap-2">
                <LuMapPin className="text-sm" />
                <p className="text-sm">Antwerp</p>
              </div>
            </div>
          </div>
          <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
            <DialogTitle className="sr-only">
              Summer Music Festival Image
            </DialogTitle>
            <div className="relative w-full h-[80vh]">
              <Image
                src="/summer-festival.jpg"
                alt="Summer Music Festival"
                className="object-contain"
                fill
                sizes="(max-width: 1024px) 100vw, 80vw"
                priority
              />
              <DialogClose className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
                <LuX className="h-6 w-6" />
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-row items-center gap-2">
              <LuCalendar className="text-2xl stroke-accent-cyan" />
              <p>12 June 2025</p>
            </div>
            <ArtistBadges artists={artists} />
            <GenreBadges genres={genres} />
          </div>
          <div className="flex items-center justify-between pt-2">
            <InterestedCounter count={156} />
            <div className="flex space-x-2">
              <DetailsButton>Details</DetailsButton>
              <GradientButton>Check In</GradientButton>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
