"use client";

import { useState, useEffect } from "react";
import { FilterDialog } from "@/components/FilterDialog";
import LocationSelector from "@/components/LocationSelector";
import { fetchConcerts } from "@/app/actions";
import { ConcertProperties } from "@/types/concert";
import { PageHeader } from "@/components/PageHeader";
import dynamic from "next/dynamic";
import { useInView } from "react-intersection-observer";
import CardSkeleton from "@/components/CardSkeleton";
import { Suspense } from "react";

const ConcertCard = dynamic(() => import("@/components/ConcertCard"), {
  loading: () => <CardSkeleton />,
  ssr: false,
});

interface Filters {
  dateRange: { from: Date | undefined; to: Date | undefined };
  location: { id: string; name: string; city: string; country: string } | null;
  city: { id: string; name: string; city: string; country: string } | null;
  genres: string[];
  eventType: string;
}

export default function DiscoverPage() {
  const [concerts, setConcerts] = useState<ConcertProperties[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCards, setVisibleCards] = useState(6);
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });
  const [filters, setFilters] = useState<Filters>({
    dateRange: { from: undefined, to: undefined },
    location: null,
    city: null,
    genres: [],
    eventType: "all",
  });

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

  // Load more cards when scrolling
  useEffect(() => {
    if (inView && !isLoading && visibleCards < concerts.length) {
      setTimeout(() => {
        setVisibleCards((prev) => Math.min(prev + 6, concerts.length));
      }, 500);
    }
  }, [inView, isLoading, visibleCards, concerts.length]);

  const handleApplyFilters = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  useEffect(() => {
    const fetchConcertsWithFilters = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { concerts, error } = await fetchConcerts({
          location: filters.location?.name,
          city: filters.city?.city,
          genre: filters.genres.join(","),
          eventType:
            filters.eventType !== "all" ? filters.eventType : undefined,
          dateFrom: filters.dateRange.from?.toISOString(),
          dateTo: filters.dateRange.to?.toISOString(),
        });

        if (error) {
          setError(error);
          setConcerts([]);
        } else {
          setConcerts(concerts);
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch concerts"
        );
        setConcerts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConcertsWithFilters();
  }, [filters]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div className="flex flex-col gap-4 mb-8">
        <PageHeader
          title="Discover Concerts"
          subtitle="Find the best concerts in your area"
        />
        <div className="flex justify-between items-center">
          <LocationSelector />
          <FilterDialog onApply={handleApplyFilters} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {isLoading ? (
          // Show 6 skeleton cards while loading
          Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))
        ) : (
          // Show actual cards with lazy loading
          <>
            {concerts.slice(0, visibleCards).map((concert) => (
              <Suspense key={concert.id} fallback={<CardSkeleton />}>
                <ConcertCard concert={concert} />
              </Suspense>
            ))}
            {visibleCards < concerts.length && (
              <div ref={ref} className="h-4" />
            )}
          </>
        )}
      </div>
    </>
  );
}
