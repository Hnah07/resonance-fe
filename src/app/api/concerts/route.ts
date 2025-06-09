import { NextResponse } from "next/server";
import { makeRequest } from "@/lib/api";
import { cache } from "react";
import { ApiConcertResponse, ApiConcert } from "@/types/concert";

// Configure dynamic rendering for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Cache the main concerts request
const getConcerts = cache(async (searchParams: URLSearchParams) => {
  // Build the API path with all query parameters
  const apiPath = `/api/concerts${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  console.log("Fetching concerts from backend API:", apiPath);

  // Add cache headers to the response
  const response = await makeRequest<ApiConcertResponse>(apiPath, {
    next: {
      revalidate: 0, // Disable caching
      tags: ["concerts", "list"],
    },
  });

  // Cache the response in memory for subsequent requests
  return response;
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    // Use the cached getConcerts function
    const concertsResponse = await getConcerts(searchParams);
    let concerts = (concertsResponse as unknown as { data: ApiConcert[] }).data;

    // Filter by genres if specified
    const genres = searchParams.get("genres")?.split(",");
    const filterMode = searchParams.get("filter_mode") || "any";

    if (genres && genres.length > 0) {
      console.log("Filtering concerts by genres:", { genres, filterMode });
      concerts = concerts.filter((concert) => {
        // Collect all genres from artists
        const concertGenres = new Set<string>();
        (concert.artists || []).forEach((artist) => {
          if (typeof artist === "object" && artist.genres) {
            artist.genres.forEach((genre) => {
              if (typeof genre === "string") {
                concertGenres.add(genre);
              } else if (
                genre &&
                typeof genre === "object" &&
                "name" in genre
              ) {
                concertGenres.add(genre.name);
              }
            });
          }
        });

        // Log the genres for this concert
        console.log("Concert genres:", {
          id: concert.id,
          genres: Array.from(concertGenres),
          requestedGenres: genres,
        });

        // Check if concert has any/all of the requested genres
        const hasGenres =
          filterMode === "any"
            ? genres.some((genre) => concertGenres.has(genre))
            : genres.every((genre) => concertGenres.has(genre));

        console.log("Concert genre match:", {
          id: concert.id,
          hasGenres,
          filterMode,
        });

        return hasGenres;
      });

      console.log("Filtered concerts count:", concerts.length);
    }

    // Add logging to diagnose event object type, artists, and genres
    console.log(
      "Concert data from API:",
      concerts.map((c) => ({
        id: c.id,
        eventType: typeof c.event,
        eventValue: c.event,
        artistsType: typeof c.artists,
        artistsValue: c.artists,
        artistsLength: c.artists?.length,
        genresType: typeof c.genres,
        genresValue: c.genres,
        genresLength: c.genres?.length,
        eventGenres: typeof c.event === "object" ? c.event.genres : undefined,
      }))
    );

    // Cache the response headers
    const response = NextResponse.json({
      concerts: concerts,
      links: concertsResponse.links,
      meta: {
        ...concertsResponse.meta,
        total: concerts.length, // Update total to reflect filtered count
      },
    });

    // Add cache control headers to prevent caching
    response.headers.set("Cache-Control", "no-store");

    return response;
  } catch (error) {
    console.error("Server-side API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch concerts" },
      { status: 500 }
    );
  }
}
