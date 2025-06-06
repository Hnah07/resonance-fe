import { ApiConcert } from "@/types/concert";
import { fetchLocation } from "@/app/actions";

// Get the base URL for the current environment
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Browser should use relative path
    return "";
  }
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    // Use NEXT_PUBLIC_BASE_URL for server-side requests
    return `https://${process.env.NEXT_PUBLIC_BASE_URL}`;
  }
  // Assume localhost
  return `http://localhost:${process.env.PORT || 3000}`;
};

export interface ConcertFilters {
  location?: string;
  city?: string | null;
  genres?: string[];
  genreFilterMode?: "any" | "all";
  eventType?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Helper function to fetch all genres
async function fetchAllGenres(): Promise<{ id: string; genre: string }[]> {
  const baseUrl = getBaseUrl();
  const url =
    typeof window === "undefined"
      ? `${baseUrl}/api/genres?all=true`
      : `/api/genres?all=true`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching genres:", error);
    throw error;
  }
}

export async function getAllConcerts(
  filters?: ConcertFilters
): Promise<{ concerts: ApiConcert[] }> {
  try {
    console.log("Starting getAllConcerts request");
    const baseUrl = getBaseUrl();
    console.log("Base URL:", baseUrl);

    // Build query string from filters
    const queryParams = new URLSearchParams();

    // Handle location filter
    if (filters?.location && filters.location !== "all") {
      console.log("Processing location filter:", filters.location);
      // Use server action to fetch location
      const { location, error: locationError } = await fetchLocation(
        filters.location
      );
      if (locationError) {
        console.error("Error fetching location:", locationError);
        throw new Error(`Failed to fetch location: ${locationError}`);
      }
      if (!location || !Array.isArray(location) || location.length === 0) {
        console.error("No location data found for:", filters.location);
        throw new Error(`No location found for: ${filters.location}`);
      }
      // Get the first location from the array
      const firstLocation = location[0];
      // Use location parameter for name-based filtering
      queryParams.append("location", firstLocation.name);
    }

    // Handle city filter
    if (filters?.city && filters.city !== "all") {
      queryParams.append("city", filters.city);
    }

    // Handle genre filter
    if (filters?.genres && filters.genres.length > 0) {
      try {
        // Fetch all genres first
        const allGenres = await fetchAllGenres();

        // Find matching genre IDs
        const genreIds = filters.genres.map((genreName) => {
          const matchingGenre = allGenres.find((g) => g.genre === genreName);
          if (!matchingGenre) {
            console.error("No matching genre found for:", genreName);
            throw new Error(`No matching genre found for: ${genreName}`);
          }
          return matchingGenre.id;
        });

        if (genreIds.length > 0) {
          // Join all genre IDs with commas
          const genreIdsString = genreIds.join(",");
          queryParams.set("genre_ids", genreIdsString);
          if (filters.genreFilterMode) {
            queryParams.set("filter_mode", filters.genreFilterMode);
          }
        }
      } catch (error) {
        console.error("Error processing genres:", error);
        throw error;
      }
    }

    // Handle other filters
    if (filters?.eventType && filters.eventType !== "all") {
      queryParams.append("type", filters.eventType);
    }
    if (filters?.dateFrom) {
      queryParams.append("date_from", filters.dateFrom);
    }
    if (filters?.dateTo) {
      queryParams.append("date_to", filters.dateTo);
    }

    const queryString = queryParams.toString();
    // Use baseUrl for server-side requests, relative path for client-side
    const url =
      typeof window === "undefined"
        ? `${baseUrl}/api/concerts${queryString ? `?${queryString}` : ""}`
        : `/api/concerts${queryString ? `?${queryString}` : ""}`;
    console.log("Fetching concerts from URL:", url);

    const res = await fetch(url, {
      next: {
        revalidate: 60,
        tags: ["concerts"],
      },
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error("Concerts API error response:", {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        errorData,
      });
      throw new Error(
        `Failed to fetch concerts: ${res.status} ${res.statusText}${
          errorData ? ` - ${JSON.stringify(errorData)}` : ""
        }`
      );
    }

    const response = await res.json();
    console.log(
      "Successfully fetched concerts:",
      response.concerts?.length || 0
    );

    // Return the concerts array from the response
    return { concerts: response.concerts };
  } catch (error) {
    console.error("Error in getAllConcerts:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      });
    }
    throw error;
  }
}
