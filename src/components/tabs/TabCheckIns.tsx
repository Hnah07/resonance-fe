"use client";

import { useState, useMemo } from "react";
import CheckInCard from "@/components/CheckInCard";
import { CheckInsFilter } from "./CheckInsFilter";

interface TabCheckInsProps {
  checkIns: {
    user: {
      id: string;
      name?: string;
      username: string;
      image?: string;
    };
    concert: {
      id: string;
      event: string;
      location: string;
      city: string;
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
      comments: {
        id: string;
        user: {
          id: string;
          name: string;
          image?: string;
        };
        text: string;
        date: string;
      }[];
    };
  }[];
}

export function TabCheckIns({ checkIns }: TabCheckInsProps) {
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const filteredAndSortedCheckIns = useMemo(() => {
    let filtered = [...checkIns];

    // Apply genre filter
    if (selectedGenre !== "all") {
      filtered = filtered.filter((checkIn) =>
        checkIn.concert.genres.some(
          (genre) => genre.toLowerCase() === selectedGenre.toLowerCase()
        )
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
  }, [checkIns, selectedGenre, selectedRating, sortBy]);

  return (
    <div>
      <CheckInsFilter
        onGenreChange={setSelectedGenre}
        onRatingChange={setSelectedRating}
        onSortChange={setSortBy}
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
