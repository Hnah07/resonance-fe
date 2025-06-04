"use client";

import dynamic from "next/dynamic";
import { FilterDialog } from "@/components/FilterDialog";
import LocationSelector from "@/components/LocationSelector";
import { PageHeader } from "@/components/PageHeader";
import CardSkeleton from "@/components/CardSkeleton";
import { useInView } from "react-intersection-observer";
import { useEffect, useState, Suspense } from "react";
import { ConcertProperties } from "@/types/concert";
import { getAllConcerts } from "@/queries/concerts";
import { mapConcertFromApi } from "@/lib/mappers";

// Dynamically import ConcertCard with a loading placeholder
const ConcertCard = dynamic(() => import("@/components/ConcertCard"), {
  loading: () => <CardSkeleton />,
  ssr: false,
});

const DiscoverPage = () => {
  const [concerts, setConcerts] = useState<ConcertProperties[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCards, setVisibleCards] = useState(1);
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  // Fetch concerts when component mounts
  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        setLoading(true);
        const response = await getAllConcerts();
        const mappedConcerts = response.concerts.map(mapConcertFromApi);
        setConcerts(mappedConcerts);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch concerts"
        );
        console.error("Error fetching concerts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConcerts();
  }, []);

  // Handle infinite scroll
  useEffect(() => {
    if (inView && visibleCards < concerts.length) {
      // Add a small delay to make the loading state more visible
      setTimeout(() => {
        setVisibleCards((prev) => prev + 1);
      }, 500);
    }
  }, [inView, visibleCards, concerts.length]);

  const handleApplyFilters = () => {
    // TODO: Implement filter logic
  };

  if (loading) {
    return (
      <>
        <PageHeader
          title="Discover Concerts"
          subtitle="Find live music near you"
        />
        <div className="flex justify-between w-full mb-12">
          <LocationSelector />
          <FilterDialog onApply={handleApplyFilters} />
        </div>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader
          title="Discover Concerts"
          subtitle="Find live music near you"
        />
        <div className="flex justify-between w-full mb-12">
          <LocationSelector />
          <FilterDialog onApply={handleApplyFilters} />
        </div>
        <div className="text-center text-red-500 p-4">
          <p>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Discover Concerts"
        subtitle="Find live music near you"
      />
      <div className="flex justify-between w-full mb-12">
        <LocationSelector />
        <FilterDialog onApply={handleApplyFilters} />
      </div>
      <div className="space-y-6">
        {concerts.slice(0, visibleCards).map((concert) => (
          <Suspense key={concert.id} fallback={<CardSkeleton />}>
            <ConcertCard concert={concert} />
          </Suspense>
        ))}
        {visibleCards < concerts.length && (
          <div ref={ref} className="h-4" /> // Intersection observer target
        )}
      </div>
    </>
  );
};

export default DiscoverPage;
