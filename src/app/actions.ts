"use server";

import { getAllConcerts, ConcertFilters } from "@/queries/concerts";
import { mapConcertFromApi } from "@/lib/mappers";
import { ConcertProperties } from "@/types/concert";
import { makeRequest } from "@/lib/api";

interface ArtistWithId {
  id: string;
  name: string;
}

export async function fetchConcerts(filters?: ConcertFilters): Promise<{
  concerts: (ConcertProperties & { artistDetails: ArtistWithId[] })[];
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

type LocationItem = {
  id: string;
  name: string;
  city: string;
};

type LocationResponse = {
  data: LocationItem[];
};

type CityResponse = {
  data: string[];
};

export async function fetchLocation(
  search: string,
  searchType: "city" | "location" = "location"
): Promise<{
  location: LocationItem[] | string[] | null;
  error: string | null;
}> {
  try {
    // Build the API path with query parameters
    const apiPath = `/api/locations${
      search
        ? `?${searchType === "city" ? "city" : "location"}=${encodeURIComponent(
            search
          )}`
        : ""
    }`;
    console.log("Fetching location from path:", apiPath);

    if (searchType === "city") {
      const response = await makeRequest<CityResponse>(apiPath);
      console.log("City API response:", response);
      if (!response.data) {
        console.error("No data in city response");
        return { location: null, error: "No data received from locations API" };
      }
      return {
        location: (response as unknown as CityResponse).data,
        error: null,
      };
    } else {
      const response = await makeRequest<LocationResponse>(apiPath);
      console.log("Location API response:", response);
      if (!response.data) {
        console.error("No data in location response");
        return { location: null, error: "No data received from locations API" };
      }
      return {
        location: (response as unknown as LocationResponse).data,
        error: null,
      };
    }
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

    const baseUrl = process.env.NEXT_PUBLIC_API_HOST;
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_API_HOST environment variable is not set");
    }
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
