import { Suspense } from "react";
import { getAllConcerts } from "@/queries/concerts";
import { mapConcertFromApi } from "@/lib/mappers";
import { ConcertList } from "@/components/ConcertList";
import { DiscoverFilters } from "@/components/DiscoverFilters";
import CardSkeleton from "@/components/CardSkeleton";

// Use ISR with a short revalidation period
export const revalidate = 60; // Cache for 60 seconds, then revalidate in the background

// Function to calculate distance between two points using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Function to get coordinates for a city
async function getCityCoordinates(
  city: string
): Promise<{ lat: number; lon: number } | null> {
  try {
    console.log("Getting coordinates for city:", city);
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const response = await fetch(
      `${baseUrl}/api/coordinates?city=${encodeURIComponent(city)}`
    );

    if (!response.ok) {
      console.log("No coordinates found for city:", city);
      return null;
    }

    const data = await response.json();
    return {
      lat: data.lat,
      lon: data.lon,
    };
  } catch (error) {
    console.error("Error getting city coordinates:", error);
    return null;
  }
}

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
  console.log("Discover page params:", params);

  // Fetch ALL concerts server-side, ignoring the city parameter for filtering
  const { concerts: apiConcerts } = await getAllConcerts({
    // Only use city for sorting, not filtering
    city: null,
    location: params.location || null,
    genres: params.genres?.split(",") || [],
    genreFilterMode: params.genreFilterMode || "any",
    eventType: params.eventType,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  });

  console.log("API concerts before filtering:", apiConcerts.length);

  // Log the actual dates being returned
  console.log("=== DATE DEBUGGING ===");
  console.log("User selected dateFrom:", params.dateFrom);
  console.log("User selected dateTo:", params.dateTo);
  console.log("Concerts returned from API with dates:");
  apiConcerts.forEach((concert, index) => {
    console.log(`Concert ${index + 1}:`, {
      id: concert.id,
      date: concert.date,
      event:
        typeof concert.event === "string" ? concert.event : concert.event.name,
    });
  });

  // Apply client-side date filtering if user selected a date range
  let filteredConcerts = apiConcerts;
  if (params.dateFrom || params.dateTo) {
    console.log("=== APPLYING CLIENT-SIDE DATE FILTERING ===");
    filteredConcerts = apiConcerts.filter((concert) => {
      const concertDate = concert.date;
      const isAfterFrom = !params.dateFrom || concertDate >= params.dateFrom;
      const isBeforeTo = !params.dateTo || concertDate <= params.dateTo;
      const isInRange = isAfterFrom && isBeforeTo;

      console.log(`Concert ${concert.id}:`, {
        date: concertDate,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        isAfterFrom,
        isBeforeTo,
        isInRange,
      });

      return isInRange;
    });
    console.log(
      "Concerts after client-side date filtering:",
      filteredConcerts.length
    );
  }

  // Filter out concerts before today as a safety net
  const today = new Date().toLocaleDateString("en-CA");
  const futureConcerts = filteredConcerts.filter(
    (concert) => concert.date >= today
  );

  console.log("Concerts after future date filtering:", futureConcerts.length);

  let concerts = futureConcerts.map(mapConcertFromApi);
  console.log("Mapped concerts:", concerts.length);

  // If a city is selected, sort concerts by distance
  if (params.city) {
    console.log("=== DISTANCE CALCULATION START ===");
    console.log("Selected city:", params.city);
    const cityCoords = await getCityCoordinates(params.city);
    console.log("City coordinates:", cityCoords);

    if (cityCoords) {
      console.log(
        "Starting distance calculations for",
        concerts.length,
        "concerts"
      );

      // Add distance to each concert
      const concertsWithDistance = await Promise.all(
        concerts.map(async (concert) => {
          // For concerts in the same city, set distance to 0
          if (concert.city.toLowerCase() === params.city?.toLowerCase()) {
            console.log(
              "🎯 Concert in same city:",
              concert.city,
              "distance set to 0"
            );
            return { ...concert, distance: 0 };
          }

          console.log("📍 Getting coordinates for:", concert.city);
          const locationCoords = await getCityCoordinates(concert.city);

          if (!locationCoords) {
            console.log("❌ No coordinates found for", concert.city);
            return { ...concert, distance: Infinity };
          }

          const distance = calculateDistance(
            cityCoords.lat,
            cityCoords.lon,
            locationCoords.lat,
            locationCoords.lon
          );
          console.log(
            "📏 Distance for",
            concert.city,
            ":",
            distance.toFixed(1),
            "km"
          );
          return { ...concert, distance };
        })
      );

      console.log("=== DISTANCES CALCULATED ===");
      console.log(
        "Concerts with distances:",
        concertsWithDistance.map((c) => ({
          city: c.city,
          distance: c.distance,
          isSameCity: c.city.toLowerCase() === params.city?.toLowerCase(),
        }))
      );

      // Sort by distance, with same-city concerts first
      concerts = concertsWithDistance.sort((a, b) => {
        // If either concert is in the same city, prioritize it
        if (a.city.toLowerCase() === params.city?.toLowerCase()) return -1;
        if (b.city.toLowerCase() === params.city?.toLowerCase()) return 1;
        // Otherwise sort by distance
        return (a.distance || Infinity) - (b.distance || Infinity);
      });

      console.log("=== FINAL SORTED CONCERTS ===");
      console.log(
        "Sorted concerts:",
        concerts.map((c) => ({
          city: c.city,
          distance: c.distance,
          isSameCity: c.city.toLowerCase() === params.city?.toLowerCase(),
        }))
      );
    } else {
      console.log(
        "❌ Could not get coordinates for selected city:",
        params.city
      );
    }
    console.log("=== DISTANCE CALCULATION END ===");
  }

  // Log the final concerts being passed to ConcertList
  console.log("=== FINAL CONCERTS PASSED TO CONCERTLIST ===");
  console.log("Number of concerts:", concerts.length);
  console.log(
    "First few concerts:",
    concerts.slice(0, 3).map((c) => ({
      city: c.city,
      distance: c.distance,
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
