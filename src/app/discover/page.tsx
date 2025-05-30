"use client";

import { ConcertCard } from "@/components/ConcertCard";
import { FilterDialog } from "@/components/FilterDialog";
import LocationSelector from "@/components/LocationSelector";
import { PageHeader } from "@/components/PageHeader";

const DiscoverPage = () => {
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
      <ConcertCard />
      <ConcertCard />
      <ConcertCard />
    </>
  );
};

export default DiscoverPage;
