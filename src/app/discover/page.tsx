"use client";

import { ConcertCard } from "@/components/ConcertCard";
import { FilterDialog } from "@/components/FilterDialog";
import LocationSelector from "@/components/LocationSelector";

const DiscoverPage = () => {
  const handleApplyFilters = () => {
    // TODO: Implement filter logic
    console.log("Applying filters...");
  };

  return (
    <>
      <div className="flex flex-col items-center mb-12">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold">Discover Concerts</h1>
          <p className="text-lg text-text-secondary">
            Find live music near you
          </p>
        </div>
      </div>
      <div className="flex justify-between w-full mb-12">
        <LocationSelector />
        <FilterDialog onApply={handleApplyFilters} />
      </div>
      <ConcertCard />
      <ConcertCard />
      <ConcertCard />
    </>
  );
};

export default DiscoverPage;
