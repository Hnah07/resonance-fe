"use client";

import { Card, CardContent } from "@/components/ui/card";
import { GradientButton } from "@/components/ui/gradient-button";
import { DetailsButton } from "@/components/ui/details-button";
import { InterestedCounter } from "@/components/InterestedCounter";
import { GenreBadges } from "@/components/GenreBadges";
import { ArtistBadges } from "@/components/ArtistBadges";
import { ExpandableImage } from "@/components/ExpandableImage";
import { LuMapPin, LuCalendar } from "react-icons/lu";

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
  return (
    <div className="flex justify-center w-full mb-6">
      <Card className="w-full sm:w-full max-w-sm sm:max-w-none overflow-hidden rounded-2xl shadow-lg !p-0 !gap-0">
        <div className="relative aspect-[4/3] sm:aspect-[16/6]">
          <ExpandableImage
            src="/summer-festival.jpg"
            alt="Summer Music Festival"
            className="object-cover"
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
