import { Suspense } from "react";
import { getAllConcerts } from "@/queries/concerts";
import { mapConcertFromApi } from "@/lib/mappers";
import { ConcertList } from "@/components/ConcertList";
import { DiscoverFilters } from "@/components/DiscoverFilters";
import CardSkeleton from "@/components/CardSkeleton";

type SearchParams = {
  city?: string;
  location?: string;
  genres?: string;
  genreFilterMode?: "any" | "all";
  eventType?: string;
  dateFrom?: string;
  dateTo?: string;
};

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  // Fetch concerts server-side
  const { concerts: apiConcerts } = await getAllConcerts({
    city: params.city || null,
    location: params.location || null,
    genres: params.genres?.split(",") || [],
    genreFilterMode: params.genreFilterMode || "any",
    eventType: params.eventType,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  });

  // Filter out concerts before today
  const today = new Date().toLocaleDateString("en-CA");
  const filteredConcerts = apiConcerts.filter(
    (concert) => concert.date >= today
  );

  console.log("Filtered concerts:", {
    before: apiConcerts.length,
    after: filteredConcerts.length,
    removed: apiConcerts
      .filter((c) => c.date < today)
      .map((c) => ({
        id: c.id,
        event: typeof c.event === "string" ? c.event : c.event.name,
        date: c.date,
      })),
  });

  const concerts = filteredConcerts.map(mapConcertFromApi);

  // Log the dates after mapping
  console.log(
    "Mapped concerts with dates:",
    concerts.map((c) => ({
      id: c.id,
      event: typeof c.event === "string" ? c.event : c.event.name,
      date: c.date,
      location: c.location.name,
      city: c.city,
    }))
  );

  return (
    <>
      <Suspense fallback={<div>Loading filters...</div>}>
        <DiscoverFilters />
      </Suspense>
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        }
      >
        <ConcertList initialConcerts={concerts} />
      </Suspense>
    </>
  );
}
