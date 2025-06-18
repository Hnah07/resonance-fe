"use client";

import { useState, useMemo } from "react";
import CheckInCard from "@/components/CheckInCard";
import { CheckInsFilter } from "@/components/tabs/CheckInsFilter";
import { LuTicket } from "react-icons/lu";

interface TabCheckInsProps {
  checkIns: Array<{
    id: string;
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
      artists: (
        | string
        | { id?: string; name: string; type?: string; image_url?: string }
      )[];
      genres: (
        | string
        | { id?: string; name: string; type?: string; image_url?: string }
      )[];
    };
    // Check-in properties are at root level, not nested
    date: string;
    time: string;
    created_at: string;
    updated_at: string;
    likes_count: number;
    comments_count: number;
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
    is_liked: boolean;
    rating: number | null;
    review: string | null;
  }>;
  showFilter?: boolean;
}

export function TabCheckIns({
  checkIns,
  showFilter = false,
}: TabCheckInsProps) {
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedArtist, setSelectedArtist] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Get unique artists, genres, and locations from all check-ins
  const { uniqueArtists, uniqueGenres, uniqueLocations } = useMemo(() => {
    // If filter is not shown, return empty arrays to avoid any object processing
    if (!showFilter) {
      return {
        uniqueArtists: [],
        uniqueGenres: [],
        uniqueLocations: [],
      };
    }

    const artists = new Set<string>();
    const genres = new Set<string>();
    const locations = new Set<string>();

    // Add null/undefined check for checkIns
    if (!checkIns || !Array.isArray(checkIns)) {
      return {
        uniqueArtists: [],
        uniqueGenres: [],
        uniqueLocations: [],
      };
    }

    checkIns.forEach((checkIn) => {
      // Add null/undefined checks for nested properties
      if (checkIn?.concert?.artists && Array.isArray(checkIn.concert.artists)) {
        checkIn.concert.artists.forEach((artist) => {
          if (typeof artist === "string" && artist) {
            artists.add(artist);
          } else if (typeof artist === "object" && artist && "name" in artist) {
            artists.add((artist as { name: string }).name);
          }
        });
      }

      if (checkIn?.concert?.genres && Array.isArray(checkIn.concert.genres)) {
        checkIn.concert.genres.forEach((genre) => {
          if (typeof genre === "string" && genre) {
            genres.add(genre);
          } else if (typeof genre === "object" && genre && "name" in genre) {
            genres.add((genre as { name: string }).name);
          }
        });
      }

      if (checkIn?.concert?.location?.name) {
        locations.add(checkIn.concert.location.name);
      }
    });

    return {
      uniqueArtists: Array.from(artists).sort(),
      uniqueGenres: Array.from(genres).sort(),
      uniqueLocations: Array.from(locations).sort(),
    };
  }, [checkIns, showFilter]);

  const filteredAndSortedCheckIns = useMemo(() => {
    // Add null/undefined check for checkIns
    if (!checkIns || !Array.isArray(checkIns)) {
      return [];
    }

    let filtered = [...checkIns];

    // Apply genre filter
    if (selectedGenre !== "all") {
      filtered = filtered.filter((checkIn) =>
        checkIn?.concert?.genres?.some((genre) => {
          if (typeof genre === "string") {
            return genre === selectedGenre;
          }
          if (typeof genre === "object" && genre && "name" in genre) {
            return (genre as { name: string }).name === selectedGenre;
          }
          return false;
        })
      );
    }

    // Apply artist filter
    if (selectedArtist !== "all") {
      filtered = filtered.filter((checkIn) =>
        checkIn?.concert?.artists?.some((artist) => {
          if (typeof artist === "string") {
            return artist === selectedArtist;
          }
          if (typeof artist === "object" && artist && "name" in artist) {
            return (artist as { name: string }).name === selectedArtist;
          }
          return false;
        })
      );
    }

    // Apply location filter
    if (selectedLocation !== "all") {
      filtered = filtered.filter(
        (checkIn) => checkIn?.concert?.location?.name === selectedLocation
      );
    }

    // Apply rating filter
    if (selectedRating !== "all") {
      const minRating = parseInt(selectedRating);
      filtered = filtered.filter(
        (checkIn) => (checkIn?.rating || 0) >= minRating
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "rating-high":
          return (b.rating || 0) - (a.rating || 0);
        case "rating-low":
          return (a.rating || 0) - (b.rating || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    checkIns,
    selectedGenre,
    selectedArtist,
    selectedRating,
    selectedLocation,
    sortBy,
  ]);

  return (
    <div>
      {showFilter ? (
        <CheckInsFilter
          onGenreChange={setSelectedGenre}
          onRatingChange={setSelectedRating}
          onSortChange={setSortBy}
          onArtistChange={setSelectedArtist}
          onLocationChange={setSelectedLocation}
          onCountryChange={() => {}}
          artists={uniqueArtists}
          genres={uniqueGenres}
          locations={uniqueLocations}
        />
      ) : null}
      {filteredAndSortedCheckIns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <LuTicket className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-2">
            No check-ins yet
          </h3>
          <p className="text-muted-foreground max-w-sm">
            Start your concert journey by checking in to your first show! Your
            check-ins will appear here and help you track your concert history.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredAndSortedCheckIns
            .filter((checkIn) => checkIn && checkIn.user && checkIn.concert) // Filter out invalid check-ins
            .map((checkIn) => {
              // Use the data as-is since it's already transformed in UserProfileContent
              const transformedCheckIn = {
                id: checkIn.id,
                date: checkIn.date || checkIn.created_at,
                time: checkIn.time || "",
                comment: checkIn.review || "",
                likes: checkIn.likes_count || 0,
                isLiked: checkIn.is_liked || false,
                comments: checkIn.comments || [],
                photos: checkIn.photos || [],
              };

              // Transform artists to strings for CheckInCard
              const transformedArtists = Array.isArray(checkIn.concert.artists)
                ? checkIn.concert.artists.map((artist) => {
                    if (typeof artist === "string") {
                      return artist;
                    }
                    if (
                      typeof artist === "object" &&
                      artist &&
                      "name" in artist
                    ) {
                      return (artist as { name: string }).name;
                    }
                    return "Unknown Artist";
                  })
                : [];

              return (
                <CheckInCard
                  key={checkIn.id}
                  user={checkIn.user}
                  concert={{
                    ...checkIn.concert,
                    // Transform event object to string if needed
                    event:
                      typeof checkIn.concert.event === "string"
                        ? checkIn.concert.event
                        : checkIn.concert.event &&
                          typeof checkIn.concert.event === "object" &&
                          "name" in checkIn.concert.event
                        ? (checkIn.concert.event as { name: string }).name
                        : "Unknown Event",
                    // Use the actual location data from the concert object
                    location: checkIn.concert.location || {
                      id: "",
                      name: "Unknown Location",
                    },
                    city: checkIn.concert.city || "Unknown City",
                    country: checkIn.concert.country || "Unknown Country",
                    // Use the rating from the check-in root level, not from concert
                    rating: checkIn.rating || 0,
                    // Transform artists to strings for CheckInCard
                    artists: transformedArtists,
                  }}
                  checkIn={transformedCheckIn}
                />
              );
            })}
        </div>
      )}
    </div>
  );
}
