"use client";

import { useState, useEffect } from "react";
import { makeClientRequest } from "@/lib/api";
import { toast } from "sonner";
import { X } from "lucide-react";
import Image from "next/image";

// Add formatDate utility function
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

interface CheckIn {
  user: {
    id: string;
    name?: string;
    username: string;
    image?: string;
  };
  concert: {
    id: string;
    event: string;
    location: {
      id: string;
      name: string;
    };
    city: string;
    country: string;
    image: string;
    date: string;
    rating: number;
    artists: string[];
    genres: string[];
  };
  checkIn: {
    id: string;
    date: string;
    time: string;
    comment: string;
    likes: number;
    comments: Array<{
      id: string;
      user: {
        id: string;
        name: string;
        image?: string;
      };
      text: string;
      date: string;
      time: string;
    }>;
    photos: Array<{
      id: string;
      url: string;
      caption: string | null;
    }>;
  };
}

interface TabPhotosProps {
  isActive: boolean;
  userId?: string;
  username?: string;
}

export function TabPhotos({ isActive, userId, username }: TabPhotosProps) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCheckIns = async () => {
      if (!isActive) {
        console.log("[TabPhotos] Tab is not active, skipping fetch");
        return;
      }

      try {
        setIsLoading(true);
        const endpoint = username
          ? `/api/users/${username}/check-ins`
          : userId
          ? `/api/users/${userId}/check-ins`
          : "/api/profile/check-ins";
        console.log("[TabPhotos] Fetching check-ins from endpoint:", endpoint);

        const response = await makeClientRequest<CheckIn>(endpoint);
        console.log("[TabPhotos] Raw API response:", {
          hasData: "data" in response,
          dataType: typeof response.data,
          isArray: Array.isArray(response.data),
          responseKeys: Object.keys(response),
          meta: "meta" in response ? response.meta : undefined,
          fullResponse: JSON.stringify(response, null, 2),
        });

        // Extract the check-ins data from the response
        const checkInsData = Array.isArray(response.data)
          ? response.data
          : [response.data];
        console.log(
          "[TabPhotos] First check-in details:",
          checkInsData[0]
            ? {
                checkInId: checkInsData[0].checkIn.id,
                hasPhotos: !!checkInsData[0].checkIn.photos,
                photosArray: checkInsData[0].checkIn.photos?.map((p) => ({
                  id: p.id,
                  url: p.url,
                  fullUrl: p.url.startsWith("http")
                    ? p.url
                    : `https://resonance-be.ddev.site/${p.url.replace(
                        /^\//,
                        ""
                      )}`,
                  caption: p.caption,
                })),
                photosLength: checkInsData[0].checkIn.photos?.length,
                checkInKeys: Object.keys(checkInsData[0].checkIn),
                fullCheckIn: JSON.stringify(checkInsData[0], null, 2),
              }
            : null
        );

        // Filter check-ins that have photos
        const checkInsWithPhotos = checkInsData.filter((checkIn) => {
          const hasPhotos =
            checkIn.checkIn.photos && checkIn.checkIn.photos.length > 0;
          if (!hasPhotos) {
            console.log("[TabPhotos] Check-in without photos:", {
              checkInId: checkIn.checkIn.id,
              concertName: checkIn.concert.event,
              checkInKeys: Object.keys(checkIn.checkIn),
              photosField: checkIn.checkIn.photos,
              fullCheckIn: JSON.stringify(checkIn, null, 2),
            });
          }
          return hasPhotos;
        });

        // Process photo URLs to ensure they're absolute
        const processedCheckIns = checkInsWithPhotos.map((checkIn) => ({
          ...checkIn,
          checkIn: {
            ...checkIn.checkIn,
            photos: checkIn.checkIn.photos?.map((photo) => ({
              ...photo,
              url: photo.url.startsWith("http")
                ? photo.url
                : `https://resonance-be.ddev.site/${photo.url.replace(
                    /^\//,
                    ""
                  )}`,
            })),
          },
        }));

        console.log("[TabPhotos] Final filtered check-ins:", {
          total: processedCheckIns.length,
          checkIns: processedCheckIns.map((ci) => ({
            checkInId: ci.checkIn.id,
            concertName: ci.concert.event,
            photosCount: ci.checkIn.photos?.length,
            photos: ci.checkIn.photos?.map((p) => ({
              id: p.id,
              url: p.url,
              hasCaption: !!p.caption,
            })),
          })),
        });

        setCheckIns(processedCheckIns);
      } catch (err) {
        console.error("[TabPhotos] Error fetching check-ins:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to load photos"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCheckIns();
  }, [isActive, userId, username]);

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="aspect-square bg-muted animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : checkIns.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No photos found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {checkIns.map((checkIn) =>
            checkIn.checkIn.photos?.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square group cursor-pointer"
                onClick={() => setSelectedCheckIn(checkIn)}
              >
                <Image
                  src={photo.url}
                  alt={photo.caption || "Concert photo"}
                  fill
                  className="object-cover rounded-lg transition-opacity duration-200 group-hover:opacity-90"
                  onLoad={() => {
                    setLoadedImages((prev) => new Set(prev).add(photo.url));
                  }}
                />
                {!loadedImages.has(photo.url) && (
                  <div className="absolute inset-0 bg-muted animate-pulse rounded-lg" />
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Photo Modal */}
      {selectedCheckIn && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCheckIn(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-background rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCheckIn(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              <div className="relative aspect-square">
                {selectedCheckIn.checkIn.photos?.[0] && (
                  <Image
                    src={selectedCheckIn.checkIn.photos[0].url}
                    alt={
                      selectedCheckIn.checkIn.photos[0].caption ||
                      "Concert photo"
                    }
                    fill
                    className="object-cover rounded-lg"
                  />
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedCheckIn.concert.event}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCheckIn.concert.location.name},{" "}
                    {selectedCheckIn.concert.city}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedCheckIn.concert.date)}
                  </p>
                </div>
                {selectedCheckIn.checkIn.comment && (
                  <p className="text-sm">{selectedCheckIn.checkIn.comment}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
