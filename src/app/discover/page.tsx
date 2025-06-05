"use client";

import { useState, useEffect } from "react";
import ConcertCard from "@/components/ConcertCard";
import { FilterDialog } from "@/components/FilterDialog";
import { fetchConcerts } from "@/app/actions";
import { ConcertProperties } from "@/types/concert";

export default function DiscoverPage() {
  const [concerts, setConcerts] = useState<ConcertProperties[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch concerts on mount
  useEffect(() => {
    const loadConcerts = async () => {
      try {
        const { concerts, error } = await fetchConcerts();
        if (error) {
          setError(error);
        } else {
          setConcerts(concerts);
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load concerts"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadConcerts();
  }, []);

  const handleApplyFilters = async (filters: {
    dateRange: { from: Date | undefined; to: Date | undefined };
    location: string;
    genre: string;
    eventType: string;
  }) => {
    setIsLoading(true);
    try {
      const { concerts: filteredConcerts, error } = await fetchConcerts();
      if (error) {
        setError(error);
        return;
      }

      let filtered = [...filteredConcerts];

      // Apply location filter
      if (filters.location !== "all") {
        filtered = filtered.filter(
          (concert) =>
            concert.city.toLowerCase() === filters.location.toLowerCase()
        );
      }

      // Apply genre filter
      if (filters.genre !== "all") {
        filtered = filtered.filter((concert) =>
          concert.genres.some(
            (genre) => genre.toLowerCase() === filters.genre.toLowerCase()
          )
        );
      }

      // Apply event type filter
      if (filters.eventType !== "all") {
        filtered = filtered.filter((concert) =>
          typeof concert.event === "string"
            ? filters.eventType === "concert"
            : concert.event.type.toLowerCase() ===
              filters.eventType.toLowerCase()
        );
      }

      // Apply date range filter
      if (filters.dateRange.from || filters.dateRange.to) {
        filtered = filtered.filter((concert) => {
          const concertDate = new Date(concert.date);
          const from = filters.dateRange.from || new Date(0);
          const to = filters.dateRange.to || new Date(8640000000000000); // Max date
          return concertDate >= from && concertDate <= to;
        });
      }

      setConcerts(filtered);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to apply filters"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Discover Concerts</h1>
        <FilterDialog onApply={handleApplyFilters} />
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {concerts.map((concert) => (
            <ConcertCard key={concert.id} concert={concert} />
          ))}
        </div>
      )}
    </div>
  );
}
