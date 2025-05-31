"use client";

import { useState } from "react";
import { useBadgeCalculation } from "@/lib/hooks/useBadgeCalculation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LuX } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface ArtistBadgesProps {
  artists: string[];
  className?: string;
  showTitle?: boolean;
}

export function ArtistBadges({
  artists,
  className,
  showTitle = true,
}: ArtistBadgesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    visibleItems: visibleArtists,
    hiddenItems: hiddenArtists,
    containerRef: artistsContainerRef,
    badgeRef: artistBadgeRef,
  } = useBadgeCalculation({ items: artists });

  return (
    <div className={cn("space-y-2", className)}>
      {showTitle && <p className="text-sm text-foreground">Artists</p>}
      <div ref={artistsContainerRef} className="flex flex-wrap gap-2">
        {visibleArtists.map((artist) => (
          <span
            key={artist}
            ref={artistBadgeRef}
            className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-xs border-muted text-foreground"
          >
            {artist}
          </span>
        ))}
        {hiddenArtists.length > 0 && (
          <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
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
    </div>
  );
}
