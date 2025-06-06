import { NextResponse } from "next/server";
import { makeRequest, fetchAllPages } from "@/lib/api";
import { cache } from "react";

interface Genre {
  id: string;
  genre: string;
}

// Cache the getAllGenres function
const getAllGenres = cache(async (): Promise<Genre[]> => {
  return fetchAllPages<Genre>("/api/genres");
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get("genre");
  const all = searchParams.get("all") === "true";

  try {
    if (all) {
      // Use the cached getAllGenres function
      const allGenres = await getAllGenres();
      return NextResponse.json({ data: allGenres });
    }

    // For specific genre searches, still use makeRequest
    const apiPath = `/api/genres${genre ? `?genre=${genre}` : ""}`;
    const genreData = await makeRequest<Genre>(apiPath);
    return NextResponse.json(genreData);
  } catch (error) {
    console.error("Server-side API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch genre" },
      { status: 500 }
    );
  }
}
