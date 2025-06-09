import { NextResponse } from "next/server";
import { makeRequest } from "@/lib/api";
import { cache } from "react";

interface ApiGenre {
  id: string;
  genre: string;
}

// Configure static rendering for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Cache the getAllGenres function with Next.js caching
const getAllGenres = cache(async (): Promise<ApiGenre[]> => {
  const allGenres: ApiGenre[] = [];
  let currentPage = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    const response = await makeRequest<ApiGenre>(
      `/api/genres?page=${currentPage}`,
      {
        next: {
          revalidate: 0,
          tags: ["genres", "pagination"],
        },
      }
    );

    allGenres.push(...response.data);

    // Check if we've reached the last page
    if (response.meta.current_page >= response.meta.last_page) {
      hasMorePages = false;
    } else {
      currentPage++;
    }
  }

  // Sort genres alphabetically
  allGenres.sort((a, b) => a.genre.localeCompare(b.genre));

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
            "Cache-Control": "no-store",
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
        revalidate: 0,
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
