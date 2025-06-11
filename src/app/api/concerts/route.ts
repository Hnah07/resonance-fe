import { NextResponse } from "next/server";
import { makeRequest } from "@/lib/api";
import { ApiConcertResponse, ApiConcert } from "@/types/concert";

// Configure static generation with revalidation
export const revalidate = 60; // Cache for 60 seconds

type Genre = {
  id: string;
  genre: string;
};

interface GenreResponse {
  data: Genre[];
  links?: Record<string, string>;
  meta?: Record<string, unknown>;
}

async function getGenreIds(genreNames: string[]): Promise<string[]> {
  try {
    // Fetch all genres to get their IDs
    const response = await makeRequest<GenreResponse>("/api/genres?all=true", {
      next: {
        revalidate: 86400, // Cache for 24 hours
        tags: ["genres"],
      },
    });

    // Create a map of genre names to IDs
    const genreMap = new Map<string, string>();
    (response.data as unknown as Genre[]).forEach((genre) => {
      genreMap.set(genre.genre.toLowerCase(), genre.id);
    });

    // Get the IDs for the requested genre names
    const genreIds = genreNames
      .map((name) => genreMap.get(name.toLowerCase()))
      .filter((id): id is string => id !== undefined);

    console.log("Mapped genre names to IDs:", {
      names: genreNames,
      ids: genreIds,
    });

    return genreIds;
  } catch (error) {
    console.error("Error fetching genre IDs:", error);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const genreFilterMode = searchParams.get("genreFilterMode");
  const genres = searchParams.get("genres");

  try {
    // Log all search parameters
    console.log("Concerts API request params:", {
      city,
      genres,
      genreFilterMode,
      type: searchParams.get("type"),
      dateFrom: searchParams.get("dateFrom"),
      dateTo: searchParams.get("dateTo"),
      allParams: Object.fromEntries(searchParams.entries()),
    });

    // Create a new URLSearchParams for the backend request
    const backendParams = new URLSearchParams();

    // Copy all parameters except the ones we need to transform
    for (const [key, value] of searchParams.entries()) {
      if (key !== "genres" && key !== "genreFilterMode" && key !== "city") {
        backendParams.append(key, value);
      }
    }

    // Convert city parameter to location_city for the backend
    if (city) {
      backendParams.append("location_city", city);
      console.log("Converting city parameter to location_city:", city);
    }

    // Convert genre names to IDs and update the parameters
    if (genres) {
      const genreNames = genres.split(",");
      const genreIds = await getGenreIds(genreNames);

      if (genreIds.length > 0) {
        backendParams.append("genre_ids", genreIds.join(","));
        console.log("Converting genre names to IDs:", {
          names: genreNames,
          ids: genreIds,
        });
      }
    }

    // Convert genreFilterMode to filter_mode for the backend
    if (genreFilterMode) {
      backendParams.append("filter_mode", genreFilterMode);
      console.log(
        "Converting genreFilterMode to filter_mode:",
        genreFilterMode
      );
    }

    // Pass all parameters to the backend API with the correct parameter name
    const apiPath = `/api/concerts${
      backendParams.toString() ? `?${backendParams.toString()}` : ""
    }`;
    console.log("Making request to backend API:", apiPath);

    const response = await makeRequest<ApiConcertResponse>(apiPath, {
      next: {
        revalidate: 60, // Keep concerts at 60 seconds since they change frequently
        tags: ["concerts", "list"],
      },
    });

    // Log the raw response from the backend
    console.log("Raw backend response:", {
      data: (response.data as unknown as ApiConcert[]).map((c) => ({
        id: c.id,
        location: c.location,
        city: c.location?.city,
        event: c.event,
        date: c.date,
        genres: c.artists?.flatMap((a) =>
          typeof a === "object" && a.genres
            ? a.genres.map((g) => (typeof g === "string" ? g : g.name))
            : []
        ),
      })),
      meta: response.meta,
      queryParams: backendParams.toString(),
    });

    // Return the response directly from the backend since filtering is now handled there
    return NextResponse.json(
      {
        concerts: response.data,
        links: response.links,
        meta: response.meta,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Server-side API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch concerts" },
      { status: 500 }
    );
  }
}
