import { Suspense } from "react";
import { getAllConcerts } from "@/queries/concerts";
import { mapConcertFromApi } from "@/lib/mappers";
import { ConcertList } from "@/components/ConcertList";
import { DiscoverFilters } from "@/components/DiscoverFilters";
import CardSkeleton from "@/components/CardSkeleton";

type SearchParams = {
  city?: string;
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
    genres: params.genres?.split(",") || [],
    genreFilterMode: params.genreFilterMode || "any",
    eventType: params.eventType,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  });

  const concerts = apiConcerts.map(mapConcertFromApi);

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
