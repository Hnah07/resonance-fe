"use client";

import { useState, useMemo } from "react";
import CheckInCard from "@/components/CheckInCard";
import { CheckInsFilter } from "@/components/tabs/CheckInsFilter";

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
    };
  }>;
}

export function TabCheckIns({ checkIns }: TabCheckInsProps) {
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedArtist, setSelectedArtist] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Get unique artists and genres from all check-ins
  const { uniqueArtists, uniqueGenres } = useMemo(() => {
    const artists = new Set<string>();
    const genres = new Set<string>();

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
    });

    const sortedGenres = Array.from(genres).sort();
    console.log("Extracted unique genres:", sortedGenres);

    return {
      uniqueArtists: Array.from(artists).sort(),
      uniqueGenres: sortedGenres,
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
  }, [checkIns, selectedGenre, selectedArtist, selectedRating, sortBy]);

  return (
    <div>
      <CheckInsFilter
        onGenreChange={setSelectedGenre}
        onRatingChange={setSelectedRating}
        onSortChange={setSortBy}
        onArtistChange={setSelectedArtist}
        onLocationChange={() => {}}
        onCountryChange={() => {}}
        artists={uniqueArtists}
        genres={uniqueGenres}
      />
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
    </div>
  );
}
