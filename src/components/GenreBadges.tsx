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

interface GenreBadgesProps {
  genres: (
    | string
    | { id?: string; name: string; type?: string; image_url?: string }
  )[];
  className?: string;
  showTitle?: boolean;
}

export function GenreBadges({
  genres,
  className,
  showTitle = true,
}: GenreBadgesProps) {
  const [isOpen, setIsOpen] = useState(false);

  console.log("GenreBadges - Received props:", {
    genres,
    genresType: typeof genres,
    genresIsArray: Array.isArray(genres),
    genresLength: genres?.length,
    genresContent: JSON.stringify(genres),
  });

  // Safety check: ensure genres are strings
  const safeGenres = Array.isArray(genres)
    ? genres.map((genre) => {
        console.log("GenreBadges - Processing genre:", {
          genre,
          type: typeof genre,
          isObject: typeof genre === "object",
          hasName: genre && typeof genre === "object" && "name" in genre,
        });

        if (typeof genre === "string") return genre;
        if (genre && typeof genre === "object" && "name" in genre) {
          return (genre as { name: string }).name;
        }
        return "Unknown Genre";
      })
    : [];

  console.log("GenreBadges - Safe genres:", {
    safeGenres,
    safeGenresContent: JSON.stringify(safeGenres),
  });

  const {
    visibleItems: visibleGenres,
    hiddenItems: hiddenGenres,
    containerRef: genresContainerRef,
    badgeRef: genreBadgeRef,
  } = useBadgeCalculation({ items: safeGenres });

  return (
    <div className={cn("space-y-2", className)}>
      {showTitle && <p className="text-sm mb-2 text-foreground">Genres</p>}
      <div ref={genresContainerRef} className="flex flex-wrap gap-2">
        {visibleGenres.map((genre) => (
          <span
            key={genre}
            ref={genreBadgeRef}
            className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-xs bg-gradient-to-r from-accent-pink/20 to-accent-cyan/20 text-accent-pink border-accent-pink/30"
          >
            {genre}
          </span>
        ))}
        {hiddenGenres.length > 0 && (
          <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
              <button className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-xs bg-gradient-to-r from-accent-pink/20 to-accent-cyan/20 text-accent-pink border-accent-pink/30 hover:from-accent-pink/30 hover:to-accent-cyan/30">
                +{hiddenGenres.length}
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
                  {safeGenres.map((genre) => (
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
    </div>
  );
}
