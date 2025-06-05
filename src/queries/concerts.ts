import { ApiConcert } from "@/types/concert";
import { fetchLocation } from "@/app/actions";
import { fetchGenre } from "@/app/actions";

// Get the base URL for the current environment
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Browser should use relative path
    return "";
  }
  if (process.env.FRONTEND_URL) {
    // Reference for vercel.com
    return `https://${process.env.FRONTEND_URL}`;
  }
  // Assume localhost
  return `http://localhost:${process.env.PORT || 3000}`;
};

export interface ConcertFilters {
  location?: string;
  city?: string;
  genre?: string;
  eventType?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function getAllConcerts(
  filters?: ConcertFilters
): Promise<{ concerts: ApiConcert[] }> {
  try {
    const baseUrl = getBaseUrl();
    console.log("Filters received in getAllConcerts:", filters);

    // Build query string from filters
    const queryParams = new URLSearchParams();

    // Handle location filter
    if (filters?.location && filters.location !== "all") {
      console.log("Fetching location data for:", filters.location);
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
      console.log("Location data received:", firstLocation);
      // Use location parameter for name-based filtering
      queryParams.append("location", firstLocation.name);
      console.log("Added location to query params:", firstLocation.name);
    }

    // Handle city filter
    if (filters?.city && filters.city !== "all") {
      queryParams.append("city", filters.city);
      console.log("Added city to query params:", filters.city);
    }

    // Handle genre filter
    if (filters?.genre && filters.genre !== "all") {
      console.log("Fetching genre data for:", filters.genre);
      // Use server action to fetch genre
      const { genre, error: genreError } = await fetchGenre(filters.genre);
      if (genreError) {
        console.error("Error fetching genre:", genreError);
        throw new Error(`Failed to fetch genre: ${genreError}`);
      }
      if (!genre) {
        console.error("No genre data found for:", filters.genre);
        throw new Error(`No genre found for: ${filters.genre}`);
      }
      console.log("Genre data received:", genre);
      // Use genre_id parameter as per API docs
      queryParams.append("genre_id", genre.id);
      console.log("Added genre_id to query params:", genre.id);
    }

    // Handle other filters
    if (filters?.eventType && filters.eventType !== "all") {
      queryParams.append("type", filters.eventType);
      console.log("Added type to query params:", filters.eventType);
    }
    if (filters?.dateFrom) {
      queryParams.append("date_from", filters.dateFrom);
      console.log("Added date_from to query params:", filters.dateFrom);
    }
    if (filters?.dateTo) {
      queryParams.append("date_to", filters.dateTo);
      console.log("Added date_to to query params:", filters.dateTo);
    }

    const queryString = queryParams.toString();
    const url = `${baseUrl}/api/concerts${
      queryString ? `?${queryString}` : ""
    }`;
    console.log("Final concerts API URL:", url);

    const res = await fetch(url, {
      cache: "no-store",
    });
    console.log("Concerts API response status:", res.status);

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error("Concerts API error:", errorData);
      throw new Error(
        `Failed to fetch concerts: ${res.status} ${res.statusText}${
          errorData ? ` - ${JSON.stringify(errorData)}` : ""
        }`
      );
    }

    const data = await res.json();
    console.log("Concerts data received:", data);
    return { concerts: data.concerts };
  } catch (error) {
    console.error("Error in getAllConcerts:", error);
    throw error;
  }
}
