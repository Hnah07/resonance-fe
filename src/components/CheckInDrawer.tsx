"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LuImage } from "react-icons/lu";
import { ConcertProperties } from "@/types/concert";
import { formatEventDate, getEventDisplay } from "@/lib/helpers";
import { useAuth } from "@/lib/hooks/useAuth";
import { StarRating } from "@/components/ui/star-rating";
import { UnauthenticatedCheckIn } from "@/components/UnauthenticatedCheckIn";
import { GradientButton } from "@/components/ui/gradient-button";
import { toast } from "sonner";

interface CheckInDrawerProps {
  concert: ConcertProperties;
  onSubmit: (data: {
    selectedArtists: string[];
    review?: string;
    photo?: File;
    rating?: number;
  }) => void;
}

export function CheckInDrawer({ concert, onSubmit }: CheckInDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [review, setReview] = useState<string>("");
  const [photo, setPhoto] = useState<File | undefined>();
  const [rating, setRating] = useState<number>(0);
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = () => {
    if (selectedArtists.length === 0) {
      setError("Please select at least one artist");
      return;
    }
    setError(undefined);
    onSubmit({
      selectedArtists,
      review: review.trim() || undefined,
      photo,
      rating: rating > 0 ? rating : undefined,
    });
    // Reset form
    setSelectedArtists([]);
    setReview("");
    setPhoto(undefined);
    setRating(0);
    setIsOpen(false);
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

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <GradientButton
          className="flex-1"
          onClick={() => {
            if (!isAuthenticated) {
              toast.error("Please sign in to check in");
              return;
            }
          }}
        >
          Check In
        </GradientButton>
      </DrawerTrigger>
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
            <UnauthenticatedCheckIn />
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

              {/* Rating */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                <div className="flex items-center gap-2">
                  <StarRating
                    rating={rating}
                    onRatingChange={setRating}
                    size="lg"
                  />
                  {rating > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {rating.toFixed(1)} stars
                    </span>
                  )}
                </div>
              </div>

              {/* Review */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Review</label>
                <Textarea
                  placeholder="Share your experience at this concert..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
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
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-accent-cyan/5 hover:border-accent-cyan/50 transition-colors"
                  >
                    <LuImage className="w-5 h-5" />
                    <span className="text-sm">
                      {photo ? "Change photo" : "Add a photo"}
                    </span>
                  </label>
                  {photo && (
                    <span className="text-sm text-muted-foreground">
                      {photo.name}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {isAuthenticated && (
          <DrawerFooter>
            <Button onClick={handleSubmit}>Check In</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
