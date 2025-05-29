"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { LuMapPin, LuX, LuCalendar, LuUsers } from "react-icons/lu";
import { useState, useRef, useEffect } from "react";

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
const artists = ["Arctic Monkeys", "The Strokes", "Vampire Weekend"];

export function ConcertCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [isArtistsOpen, setIsArtistsOpen] = useState(false);
  const [visibleArtistCount, setVisibleArtistCount] = useState(2);
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const calculateVisibleBadges = () => {
      if (!containerRef.current || !badgeRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const badgeWidth = badgeRef.current.offsetWidth;
      const gap = 8; // 2rem gap (gap-2 = 0.5rem = 8px)
      const maxBadges = Math.floor((containerWidth + gap) / (badgeWidth + gap));

      // Always show at least 2 badges, and at most all badges
      setVisibleArtistCount(Math.max(2, Math.min(maxBadges, artists.length)));
    };

    calculateVisibleBadges();
    window.addEventListener("resize", calculateVisibleBadges);
    return () => window.removeEventListener("resize", calculateVisibleBadges);
  }, []);

  const visibleArtists = artists.slice(0, visibleArtistCount);
  const hiddenArtists = artists.slice(visibleArtistCount);

  return (
    <div className="flex justify-center w-full mb-6">
      <Card className="w-full sm:w-full max-w-sm sm:max-w-none overflow-hidden rounded-2xl shadow-lg !p-0 !gap-0">
        <div className="relative aspect-[4/3] sm:aspect-[16/6]">
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
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <LuCalendar className="text-accent-pink" />
            <p className="text-sm text-foreground">12 June 2025</p>
          </div>
          <p className="text-sm mb-2 text-foreground">Artists</p>
          <div ref={containerRef} className="flex flex-wrap gap-2 mb-4">
            {visibleArtists.map((artist, index) => (
              <span
                key={artist}
                ref={index === 0 ? badgeRef : undefined}
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-xs border-muted text-foreground"
              >
                {artist}
              </span>
            ))}
            {hiddenArtists.length > 0 && (
              <AlertDialog open={isArtistsOpen} onOpenChange={setIsArtistsOpen}>
                <AlertDialogTrigger asChild>
                  <button className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-xs border-muted text-foreground hover:bg-muted">
                    +{hiddenArtists.length}
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <AlertDialogTitle>All Artists</AlertDialogTitle>
                      <AlertDialogCancel className="rounded-full p-1 hover:bg-muted">
                        <LuX className="h-4 w-4" />
                      </AlertDialogCancel>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {artists.map((artist) => (
                        <span
                          key={artist}
                          className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-xs border-muted text-foreground"
                        >
                          {artist}
                        </span>
                      ))}
                    </div>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <p className="text-sm mb-2 text-foreground">Genres</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {genres.map((genre) => (
              <span
                key={genre}
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-xs bg-gradient-to-r from-accent-pink/20 to-accent-cyan/20 text-accent-pink border-accent-pink/30"
              >
                {genre}
              </span>
            ))}
            {genres.length > 3 && (
              <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                <AlertDialogTrigger asChild>
                  <button className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-xs bg-gradient-to-r from-accent-pink/20 to-accent-cyan/20 text-accent-pink border-accent-pink/30 hover:from-accent-pink/30 hover:to-accent-cyan/30">
                    +{genres.length - 3}
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <AlertDialogTitle>All Genres</AlertDialogTitle>
                      <AlertDialogCancel className="rounded-full p-1 hover:bg-muted">
                        <LuX className="h-4 w-4" />
                      </AlertDialogCancel>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {genres.map((genre) => (
                        <span
                          key={genre}
                          className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-xs bg-gradient-to-r from-accent-pink/20 to-accent-cyan/20 text-accent-pink border-accent-pink/30"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2 text-foreground text-sm">
              <LuUsers className="w-4 h-4" />
              <span>156 interested</span>
            </div>
            <div className="flex space-x-2">
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background hover:text-accent-foreground h-9 rounded-md px-3 border-accent-cyan/50 text-accent-cyan hover:bg-accent-cyan/10">
                Details
              </button>
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary hover:bg-primary/90 h-9 rounded-md px-3 bg-gradient-to-r from-accent-pink/80 to-accent-cyan/80 hover:from-accent-pink/90 hover:to-accent-cyan/90 text-white">
                Check In
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
