import { NextResponse } from "next/server";
import { makeRequest } from "@/lib/api";
import { cache } from "react";

interface ApiGenre {
  id: string;
  genre: string;
}

type ApiGenreResponse = {
  data: ApiGenre[];
  meta: {
    current_page: number;
    last_page: number;
  };
};

// Configure static rendering for this route
export const dynamic = "force-dynamic";
export const revalidate = 86400; // Cache for 24 hours

// Cache the getAllGenres function with Next.js caching
const getAllGenres = cache(async (): Promise<ApiGenre[]> => {
  const allGenres: ApiGenre[] = [];
  let currentPage = 1;
  let hasMorePages = true;

  console.log("Starting to fetch all genres...");

  while (hasMorePages) {
    console.log(`Fetching genres page ${currentPage}...`);
    const response = await makeRequest<ApiGenreResponse>(
      `/api/genres?page=${currentPage}`,
      {
        next: {
          revalidate: 86400, // Cache for 24 hours
          tags: ["genres"], // Only invalidate when explicitly needed
        },
      }
    );

    const genres = response.data as unknown as ApiGenre[];
    console.log(
      `Page ${currentPage} genres:`,
      genres.map((g) => g.genre)
    );
    allGenres.push(...genres);

    // Check if we've reached the last page
    if (response.meta.current_page >= response.meta.last_page) {
      console.log(
        `Reached last page (${response.meta.last_page}). Total genres: ${allGenres.length}`
      );
      hasMorePages = false;
    } else {
      currentPage++;
    }
  }

  // Sort genres alphabetically
  allGenres.sort((a, b) => a.genre.localeCompare(b.genre));
  console.log(
    "All genres after sorting:",
    allGenres.map((g) => g.genre)
  );

  return allGenres;
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get("genre");
  const all = searchParams.get("all") === "true";
  const page = searchParams.get("page");

  try {
    if (all) {
      // Use the cached getAllGenres function
      const allGenres = await getAllGenres();
      return NextResponse.json(
        { data: allGenres },
        {
          headers: {
            "Cache-Control":
              "public, s-maxage=86400, stale-while-revalidate=43200",
          },
        }
      );
    }

    // For specific genre searches or pagination, use makeRequest with caching
    const apiPath = `/api/genres${genre ? `?genre=${genre}` : ""}${
      page ? `&page=${page}` : ""
    }`;
    const response = await makeRequest<ApiGenre>(apiPath, {
      next: {
        revalidate: 86400, // Cache for 24 hours
        tags: ["genres"],
      },
    });

    // Add cache headers to the response
    const jsonResponse = NextResponse.json(response);
    jsonResponse.headers.set("Cache-Control", "no-store");

    return jsonResponse;
  } catch (error) {
    console.error("Server-side API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch genre" },
      { status: 500 }
    );
  }
}
