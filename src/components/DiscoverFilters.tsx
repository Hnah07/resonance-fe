"use client";

import { FilterDialog } from "@/components/FilterDialog";
import LocationSelector from "@/components/LocationSelector";
import { PageHeader } from "@/components/PageHeader";
import { useRouter, useSearchParams } from "next/navigation";

interface Filters {
  dateRange: { from: Date | undefined; to: Date | undefined };
  location: { id: string; name: string; city: string; country: string } | null;
  city: string | null;
  genres: string[];
  genreFilterMode: "any" | "all";
  eventType: string;
}

export function DiscoverFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleApplyFilters = (newFilters: Filters) => {
    // Update URL with new filters
    const params = new URLSearchParams(searchParams.toString());

    if (newFilters.city) {
      params.set("city", newFilters.city);
    } else {
      params.delete("city");
    }

    if (newFilters.location) {
      params.set("location", newFilters.location.name);
    } else {
      params.delete("location");
    }

    if (newFilters.genres.length > 0) {
      params.set("genres", newFilters.genres.join(","));
      params.set("genreFilterMode", newFilters.genreFilterMode);
    } else {
      params.delete("genres");
      params.delete("genreFilterMode");
    }

    if (newFilters.eventType !== "all") {
      params.set("eventType", newFilters.eventType);
    } else {
      params.delete("eventType");
    }

    if (newFilters.dateRange.from) {
      params.set("dateFrom", newFilters.dateRange.from.toISOString());
    } else {
      params.delete("dateFrom");
    }

    if (newFilters.dateRange.to) {
      params.set("dateTo", newFilters.dateRange.to.toISOString());
    } else {
      params.delete("dateTo");
    }

    router.push(`/discover?${params.toString()}`);
  };

  return (
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
  );
}
