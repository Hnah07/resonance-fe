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

const concert = {
  id: "1",
  event: "Summer Music Festival",
  location: "Antwerp",
  city: "Antwerp",
  country: "Belgium",
  image: "/summer-festival.jpg",
  date: "12 June 2025",
  artists: [
    "Arctic Monkeys",
    "The Strokes",
    "Vampire Weekend",
    "The Maccabees",
    "Pulp",
    "Arcade Fire",
  ],
  genres: ["Rock", "Indie", "Pop", "Electronic", "Hip Hop", "Jazz", "Blues"],
  interestedCount: 156,
};

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
            <ConcertCard concert={concert} />
          </Suspense>
        ))}
        <div ref={ref} className="h-4" /> {/* Intersection observer target */}
      </div>
    </>
  );
};

export default DiscoverPage;
