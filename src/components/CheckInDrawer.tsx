"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LuImage, LuStar, LuStarHalf, LuLock } from "react-icons/lu";
import { ConcertProperties } from "@/types/concert";
import { formatEventDate, getEventDisplay } from "@/lib/helpers";
import { useAuth } from "@/lib/hooks/useAuth";
import Link from "next/link";

interface CheckInDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  concert: ConcertProperties;
  onSubmit: (data: {
    selectedArtists: string[];
    comment?: string;
    rating?: number;
    photo?: File;
  }) => void;
}

export function CheckInDrawer({
  isOpen,
  onClose,
  concert,
  onSubmit,
}: CheckInDrawerProps) {
  const { isAuthenticated } = useAuth();
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState<number | undefined>();
  const [photo, setPhoto] = useState<File | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [hoverRating, setHoverRating] = useState<number | undefined>();

  const handleSubmit = () => {
    if (selectedArtists.length === 0) {
      setError("Please select at least one artist");
      return;
    }
    setError(undefined);
    onSubmit({
      selectedArtists,
      comment: comment || undefined,
      rating,
      photo,
    });
    // Reset form
    setSelectedArtists([]);
    setComment("");
    setRating(undefined);
    setPhoto(undefined);
    onClose();
  };

  const handleArtistClick = (artist: string) => {
    setSelectedArtists((prev) =>
      prev.includes(artist)
        ? prev.filter((a) => a !== artist)
        : [...prev, artist]
    );
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
    }
  };

  const handleStarInteraction = (
    star: number,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    const newRating = isHalf ? star - 0.5 : star;

    if (event.type === "mouseenter") {
      setHoverRating(newRating);
    } else if (event.type === "click") {
      if (rating === newRating) {
        setRating(undefined);
      } else {
        setRating(newRating);
      }
      setHoverRating(undefined);
    }
  };

  const handleStarLeave = () => {
    setHoverRating(undefined);
  };

  const getStarFill = (star: number, isHalf: boolean) => {
    const currentRating = hoverRating ?? rating;
    if (!currentRating) return false;

    if (isHalf) {
      return currentRating === star - 0.5;
    }
    return currentRating >= star;
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Check In</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 space-y-6 overflow-y-auto flex-1">
          {/* Concert Info (Read-only) */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">
              {getEventDisplay(concert.event, concert.date)}
            </h3>
            <p className="text-sm text-muted-foreground">
              {concert.location.name}, {concert.city}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatEventDate(concert.date)}
            </p>
          </div>

          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-accent-cyan/10 flex items-center justify-center">
                <LuLock className="w-6 h-6 text-accent-cyan" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Sign in to check in</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Create an account or sign in to share your concert experience
                  with the community
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Link href="/login">
                  <Button variant="outline" onClick={onClose}>
                    Sign in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button onClick={onClose}>Create account</Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Artist Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Artists Seen *</label>
                <div className="flex flex-wrap gap-2">
                  {concert.artists.map((artist) => (
                    <button
                      key={artist}
                      onClick={() => handleArtistClick(artist)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        selectedArtists.includes(artist)
                          ? "bg-accent-cyan/30 border-accent-cyan text-accent-cyan font-medium shadow-sm"
                          : "border-slate-200 dark:border-slate-700 hover:border-accent-cyan/50 hover:bg-accent-cyan/5"
                      }`}
                    >
                      {artist}
                    </button>
                  ))}
                </div>
                {error && (
                  <p className="text-sm text-destructive mt-1">{error}</p>
                )}
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Comment</label>
                <Input
                  type="text"
                  placeholder="Share your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                <p className="text-sm text-muted-foreground">
                  Click on the left side of a star for half ratings. Click the
                  same star again to clear your rating.
                </p>
                <div className="flex flex-col gap-2">
                  <div
                    className="flex items-center gap-3"
                    onMouseLeave={handleStarLeave}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className="relative cursor-pointer w-12 h-12 flex items-center justify-center"
                        onMouseEnter={(e) => handleStarInteraction(star, e)}
                        onClick={(e) => handleStarInteraction(star, e)}
                      >
                        {/* Half star - only show when selected */}
                        {getStarFill(star, true) && (
                          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                            <div className="w-1/2 h-full flex items-center justify-center">
                              <LuStarHalf className="w-[44px] h-[44px] -ml-[1px] text-yellow-400 fill-yellow-400 scale-110 transition-all duration-200" />
                            </div>
                          </div>
                        )}
                        {/* Base star (empty) */}
                        <div className="relative flex items-center justify-center">
                          <LuStar
                            className={`w-10 h-10 transition-all duration-200 ${
                              getStarFill(star, false)
                                ? "text-yellow-400 fill-yellow-400 scale-110"
                                : "text-slate-300 dark:text-slate-600"
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {rating && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">
                        Your rating:
                      </span>
                      <span className="font-medium">
                        {rating} {rating === 1 ? "star" : "stars"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Photo</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer hover:bg-accent-cyan/5 border-slate-200 dark:border-slate-700"
                  >
                    <LuImage className="w-5 h-5" />
                    <span className="text-sm">
                      {photo ? "Change photo" : "Add a photo"}
                    </span>
                  </label>
                  {photo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPhoto(undefined)}
                      className="text-destructive hover:text-destructive/90"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {isAuthenticated && (
          <DrawerFooter>
            <div className="flex gap-2">
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>
              <Button onClick={handleSubmit} className="flex-1">
                Submit Check-in
              </Button>
            </div>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
