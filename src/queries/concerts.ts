import { ApiConcert } from "@/types/concert";
import { fetchLocation } from "@/app/actions";

// Helper function to get the base URL
function getBaseUrl(): string {
  // For client-side requests, use relative URL
  if (typeof window !== "undefined") {
    return "";
  }
  // For server-side requests, use the frontend URL from env
  return process.env.FRONTEND_URL || "http://localhost:3000";
}

export interface ConcertFilters {
  location?: string;
  city?: string | null;
  genres?: string[];
  genreFilterMode?: "any" | "all";
  eventType?: string;
  dateFrom?: string;
  dateTo?: string;
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
      if (typeof firstLocation === "object" && "name" in firstLocation) {
        queryParams.append("location", firstLocation.name);
      } else {
        console.error("Invalid location data format:", firstLocation);
        throw new Error("Invalid location data format");
      }
    }

    // Handle city filter
    if (filters?.city && filters.city !== "all") {
      queryParams.append("city", filters.city);
    }

    // Handle genre filters
    if (filters?.genres && filters.genres.length > 0) {
      queryParams.append("genres", filters.genres.join(","));
      queryParams.append("filter_mode", filters.genreFilterMode || "any");
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
    // Use the frontend URL for server-side requests to ensure we go through Next.js API route
    const url = `${baseUrl}/api/concerts${
      queryString ? `?${queryString}` : ""
    }`;
    console.log("Fetching concerts from URL:", url);

    const res = await fetch(url, {
      next: {
        revalidate: 0, // Disable caching
        tags: ["concerts"],
      },
      headers: {
        Accept: "application/json",
      },
      credentials: "include", // Add this to ensure cookies are sent
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log("Successfully fetched concerts:", data.concerts.length);
    return { concerts: data.concerts };
  } catch (error) {
    console.error("Error fetching concerts:", error);
    throw error;
  }
}
