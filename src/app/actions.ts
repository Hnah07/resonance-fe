"use server";

import { getAllConcerts, ConcertFilters } from "@/queries/concerts";
import { mapConcertFromApi } from "@/lib/mappers";
import { ConcertProperties } from "@/types/concert";

export async function fetchConcerts(filters?: ConcertFilters): Promise<{
  concerts: ConcertProperties[];
  error: string | null;
}> {
  try {
    const response = await getAllConcerts(filters);
    const mappedConcerts = response.concerts.map(mapConcertFromApi);
    return { concerts: mappedConcerts, error: null };
  } catch (err) {
    return {
      concerts: [],
      error: err instanceof Error ? err.message : "Failed to fetch concerts",
    };
  }
}

export async function fetchLocation(
  search: string,
  searchType: "city" | "location" = "location"
): Promise<{
  location: { id: string; name: string; city: string }[] | null;
  error: string | null;
}> {
  try {
    // Get the base URL for the current environment
    const baseUrl =
      typeof window !== "undefined" ? "" : "http://localhost:3000";

    // Use our local API route instead of calling the backend directly
    const url = `${baseUrl}/api/locations${
      search ? `?${searchType}=${encodeURIComponent(search)}` : ""
    }`;
    console.log("Fetching location from URL:", url);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    console.log("Location API response status:", response.status);
    if (!response.ok) {
      console.error("Location API error:", response.statusText);
      return {
        location: null,
        error: `Failed to fetch location: ${response.statusText}`,
      };
    }

    const data = await response.json();
    console.log("Location API response data:", data);
    return { location: data.data, error: null };
  } catch (err) {
    console.error("Location API error:", err);
    return {
      location: null,
      error: err instanceof Error ? err.message : "Failed to fetch location",
    };
  }
}

export async function fetchGenre(name: string): Promise<{
  genre: { id: string; name: string } | null;
  error: string | null;
}> {
  try {
    const token = process.env.API_TOKEN?.trim();
    if (!token) {
      return {
        genre: null,
        error: "API token not configured",
      };
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_API_HOST || "resonance-be.ddev.site";
    const url = `https://${baseUrl}/api/genres?name=${encodeURIComponent(
      name
    )}`;
    console.log("Fetching genre from URL:", url);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return {
        genre: null,
        error: `Failed to fetch genre: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return { genre: data.data, error: null };
  } catch (err) {
    return {
      genre: null,
      error: err instanceof Error ? err.message : "Failed to fetch genre",
    };
  }
}
