"use client";

import { useState, useMemo } from "react";
import CheckInCard from "@/components/CheckInCard";
import { CheckInsFilter } from "@/components/tabs/CheckInsFilter";
import { LuTicket } from "react-icons/lu";

interface TabCheckInsProps {
  checkIns: Array<{
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
  }>;
}

export function TabCheckIns({ checkIns }: TabCheckInsProps) {
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedArtist, setSelectedArtist] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Get unique artists, genres, and locations from all check-ins
  const { uniqueArtists, uniqueGenres, uniqueLocations } = useMemo(() => {
    const artists = new Set<string>();
    const genres = new Set<string>();
    const locations = new Set<string>();

    console.log(
      "Processing check-ins for genres:",
      checkIns.map((checkIn) => ({
        event: checkIn.concert.event,
        genres: checkIn.concert.genres,
      }))
    );

    checkIns.forEach((checkIn) => {
      checkIn.concert.artists.forEach((artist) => {
        artists.add(artist);
      });
      checkIn.concert.genres.forEach((genre) => {
        genres.add(genre);
      });
      locations.add(checkIn.concert.location.name);
    });

    const sortedGenres = Array.from(genres).sort();
    console.log("Extracted unique genres:", sortedGenres);

    return {
      uniqueArtists: Array.from(artists).sort(),
      uniqueGenres: sortedGenres,
      uniqueLocations: Array.from(locations).sort(),
    };
  }, [checkIns]);

  const filteredAndSortedCheckIns = useMemo(() => {
    let filtered = [...checkIns];

    // Apply genre filter
    if (selectedGenre !== "all") {
      filtered = filtered.filter((checkIn) =>
        checkIn.concert.genres.includes(selectedGenre)
      );
    }

    // Apply artist filter
    if (selectedArtist !== "all") {
      filtered = filtered.filter((checkIn) =>
        checkIn.concert.artists.includes(selectedArtist)
      );
    }

    // Apply location filter
    if (selectedLocation !== "all") {
      filtered = filtered.filter(
        (checkIn) => checkIn.concert.location.name === selectedLocation
      );
    }

    // Apply rating filter
    if (selectedRating !== "all") {
      const minRating = parseInt(selectedRating);
      filtered = filtered.filter(
        (checkIn) => checkIn.concert.rating >= minRating
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.checkIn.date).getTime() -
            new Date(a.checkIn.date).getTime()
          );
        case "oldest":
          return (
            new Date(a.checkIn.date).getTime() -
            new Date(b.checkIn.date).getTime()
          );
        case "rating-high":
          return b.concert.rating - a.concert.rating;
        case "rating-low":
          return a.concert.rating - b.concert.rating;
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
          {filteredAndSortedCheckIns.map((checkIn) => (
            <CheckInCard
              key={checkIn.checkIn.id}
              user={checkIn.user}
              concert={checkIn.concert}
              checkIn={checkIn.checkIn}
            />
          ))}
        </div>
      )}
    </div>
  );
}
