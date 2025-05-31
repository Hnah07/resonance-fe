"use client";

import dynamic from "next/dynamic";
import { FilterDialog } from "@/components/FilterDialog";
import LocationSelector from "@/components/LocationSelector";
import { PageHeader } from "@/components/PageHeader";
import CardSkeleton from "@/components/CardSkeleton";
import { useInView } from "react-intersection-observer";
import { useEffect, useState, Suspense } from "react";

// Dynamically import ConcertCard with a loading placeholder
const ConcertCard = dynamic(() => import("@/components/ConcertCard"), {
  loading: () => <CardSkeleton />,
  ssr: false,
});

const DiscoverPage = () => {
  const [visibleCards, setVisibleCards] = useState(1);
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView && visibleCards < 10) {
      // Add a small delay to make the loading state more visible
      setTimeout(() => {
        setVisibleCards((prev) => prev + 1);
      }, 500);
    }
  }, [inView, visibleCards]);

  const handleApplyFilters = () => {
    // TODO: Implement filter logic
    console.log("Applying filters...");
  };

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
        {Array.from({ length: visibleCards }).map((_, index) => (
          <Suspense key={index} fallback={<CardSkeleton />}>
            <ConcertCard />
          </Suspense>
        ))}
        <div ref={ref} className="h-4" /> {/* Intersection observer target */}
      </div>
    </>
  );
};

export default DiscoverPage;
