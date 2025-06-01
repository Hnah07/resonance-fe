"use client";

import { Card, CardContent } from "@/components/ui/card";
import { GradientButton } from "@/components/ui/gradient-button";
import { DetailsButton } from "@/components/ui/details-button";
import { InterestedCounter } from "@/components/InterestedCounter";
import { GenreBadges } from "@/components/GenreBadges";
import { ArtistBadges } from "@/components/ArtistBadges";
import { ExpandableImage } from "@/components/ExpandableImage";
import { LuMapPin, LuCalendar } from "react-icons/lu";

// TODO: if there is no concert image, use a placeholder image

interface ConcertCardProps {
  concert: {
    id: string;
    event: string;
    location: string;
    city: string;
    country: string;
    image: string;
    date: string;
    artists: string[];
    genres: string[];
    interestedCount: number;
  };
}

function ConcertCard({ concert }: ConcertCardProps) {
  return (
    <div className="flex justify-center w-full mb-6">
      <Card className="w-full sm:w-full max-w-sm sm:max-w-none overflow-hidden rounded-2xl shadow-lg !p-0 !gap-0">
        <div className="relative w-full h-[300px] sm:h-[400px] md:h-[400px]">
          <ExpandableImage
            src={concert.image}
            alt={concert.event}
            className="object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-4">
            <h3 className="text-lg font-semibold">{concert.event}</h3>
            <div className="flex flex-row items-center gap-2">
              <LuMapPin className="text-sm" />
              <p className="text-sm">
                {concert.location}, {concert.country}
              </p>
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-row items-center gap-2">
              <LuCalendar className="text-2xl stroke-accent-cyan" />
              <p>{concert.date}</p>
            </div>
            <ArtistBadges title="Artists" artists={concert.artists} />
            <GenreBadges genres={concert.genres} />
          </div>
          <div className="flex items-center justify-between pt-2">
            <InterestedCounter count={concert.interestedCount} />
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

export default ConcertCard;
