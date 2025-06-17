import { NextResponse } from "next/server";
import { makeRequest } from "@/lib/api";
import { ApiConcertResponse } from "@/types/concert";

// Use dynamic rendering but with stale-while-revalidate caching
export const dynamic = "force-dynamic";

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
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  console.log("=== CONCERTS API ROUTE DEBUG ===");
  console.log("Received parameters:", {
    city,
    genreFilterMode,
    genres,
    dateFrom,
    dateTo,
    allParams: Object.fromEntries(searchParams.entries()),
  });

  try {
    // Create a new URLSearchParams for the backend request
    const backendParams = new URLSearchParams();

    // Copy all parameters except the ones we need to transform
    for (const [key, value] of searchParams.entries()) {
      if (
        key !== "genres" &&
        key !== "genreFilterMode" &&
        key !== "city" &&
        key !== "dateFrom" &&
        key !== "dateTo"
      ) {
        backendParams.append(key, value);
      }
    }

    // Convert date parameters to backend format
    if (dateFrom) {
      backendParams.append("date_from", dateFrom);
    }
    if (dateTo) {
      backendParams.append("date_to", dateTo);
    }

    console.log("Parameters being sent to backend:", {
      date_from: backendParams.get("date_from"),
      date_to: backendParams.get("date_to"),
      allBackendParams: Object.fromEntries(backendParams.entries()),
    });

    // Convert city parameter to location_city for the backend
    if (city) {
      backendParams.append("location_city", city);
    }

    // Convert genre names to IDs and update the parameters
    if (genres) {
      const genreNames = genres.split(",");
      const genreIds = await getGenreIds(genreNames);

      if (genreIds.length > 0) {
        backendParams.append("genre_ids", genreIds.join(","));
      } else {
      }
    }

    // Convert genreFilterMode to filter_mode for the backend
    if (genreFilterMode) {
      backendParams.append("filter_mode", genreFilterMode);
    }

    const apiPath = `/api/concerts${
      backendParams.toString() ? `?${backendParams.toString()}` : ""
    }`;

    const response = await makeRequest<ApiConcertResponse>(apiPath, {
      next: {
        revalidate: 60,
        tags: ["concerts", "list"],
      },
    });

    // Return the response with stale-while-revalidate caching
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
      {
        error: "Failed to fetch concerts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
