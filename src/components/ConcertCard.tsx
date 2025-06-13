"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DetailsButton } from "@/components/ui/details-button";
import { GenreBadges } from "@/components/GenreBadges";
import { ArtistBadges } from "@/components/ArtistBadges";
import { ExpandableImage } from "@/components/ExpandableImage";
import { LuMapPin, LuCalendar } from "react-icons/lu";
import { ConcertProperties } from "@/types/concert";
import { formatEventDate, getEventDisplay } from "@/lib/helpers";
import { CheckInDrawer } from "@/components/CheckInDrawer";
import { toast } from "sonner";
import {
  createCheckIn,
  createArtistCheckIn,
  searchArtists,
  createCheckInReview,
  uploadFile,
  createPhoto,
} from "@/lib/api";
import { useAuth } from "@/lib/hooks/useAuth";

// Extend ConcertProperties to include optional distance
interface ConcertCardProps {
  concert: ConcertProperties & { distance?: number };
}

interface CheckInData {
  selectedArtists: string[];
  review?: string;
  photo?: File;
  rating?: number;
}

function ConcertCard({ concert }: ConcertCardProps) {
  const { isAuthenticated } = useAuth();

  const handleCheckIn = async (data: CheckInData) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to check in");
      return;
    }

    try {
      // First create the check-in
      const checkIn = await createCheckIn(concert.id);

      // Search for each artist to get their IDs
      const artistSearchPromises = data.selectedArtists.map(
        async (artistName) => {
          const searchResult = await searchArtists(artistName);
          const artist = searchResult.data.find(
            (a) => a.name.toLowerCase() === artistName.toLowerCase()
          );
          if (!artist) {
            throw new Error(`Artist not found: ${artistName}`);
          }
          return artist;
        }
      );

      const artists = await Promise.all(artistSearchPromises);

      // Create artist check-ins
      const artistCheckInPromises = artists.map((artist) =>
        createArtistCheckIn(checkIn.id, artist.id)
      );

      // Create review if provided
      const reviewPromise = data.review
        ? createCheckInReview(checkIn.id, data.review)
        : Promise.resolve();

      // Create rating if provided
      const ratingPromise = data.rating
        ? fetch("/api/checkin-ratings", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              checkin_id: checkIn.id,
              rating: data.rating,
            }),
          }).then((res) => {
            if (!res.ok) {
              throw new Error("Failed to create rating");
            }
          })
        : Promise.resolve();

      // Handle photo if provided
      let photoPromise = Promise.resolve();
      const photo = data.photo;
      if (photo instanceof File) {
        const file = photo; // Type is now narrowed to File
        photoPromise = (async () => {
          // Upload the photo first
          const uploadResult = await uploadFile(file, "checkin-photos");
          // Then create the photo record
          await createPhoto(checkIn.id, uploadResult.url);
        })();
      }

      // Wait for all operations to complete
      await Promise.all([
        ...artistCheckInPromises,
        reviewPromise,
        ratingPromise,
        photoPromise,
      ]);

      toast.success("Check-in successful!");
    } catch (error) {
      console.error("Check-in error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to check in. Please try again."
      );
    }
  };

  console.log("ConcertCard rendering with concert:", {
    city: concert.city,
    distance: concert.distance,
    hasDistance: concert.distance !== undefined,
  });

  return (
    <>
      <div className="flex justify-center w-full mb-6">
        <Card className="w-full sm:w-full max-w-sm sm:max-w-none overflow-hidden rounded-2xl shadow-lg !p-0 !gap-0">
          <div className="relative w-full h-[300px] sm:h-[250px] md:h-[280px] bg-gray-800">
            {concert.distance !== undefined && (
              <div className="absolute top-4 right-4 z-10 bg-black/80 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                {concert.distance === 0
                  ? "Here"
                  : `${concert.distance.toFixed(1)} km`}
              </div>
            )}
            <ExpandableImage
              src={concert.image}
              alt={`${getEventDisplay(concert.event, concert.date)} at ${
                concert.location.name
              }`}
              className="object-cover w-full h-full"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent text-white p-4">
              <h3 className="text-lg font-semibold text-white">
                {getEventDisplay(concert.event, concert.date)}
              </h3>
              <div className="flex flex-row items-center gap-2">
                <LuMapPin className="text-sm text-white" />
                <p className="text-sm text-white">
                  {concert.location.name}, {concert.city}, {concert.country}
                </p>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-row items-center gap-2">
                <LuCalendar className="text-2xl stroke-accent-cyan" />
                <p>{formatEventDate(concert.date)}</p>
              </div>
              {concert.artists.length > 0 && (
                <ArtistBadges title="Artists" artists={concert.artists} />
              )}
              {concert.genres.length > 0 && (
                <GenreBadges genres={concert.genres} />
              )}
              <div className="flex space-x-2 pt-2">
                <DetailsButton className="flex-1">Details</DetailsButton>
                <CheckInDrawer concert={concert} onSubmit={handleCheckIn} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default ConcertCard;
