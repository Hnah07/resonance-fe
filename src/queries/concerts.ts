import { ApiConcert } from "@/types/concert";
import { fetchLocation } from "@/app/actions";
import https from "https";

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
  genres?: string[];
  genreFilterMode?: "any" | "all";
  eventType?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Helper function to fetch all genres across pages
async function fetchAllGenres(
  token: string
): Promise<{ id: string; genre: string }[]> {
  const allGenres: { id: string; genre: string }[] = [];
  let currentPage = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    const response = await new Promise<{
      data: { id: string; genre: string }[];
      meta: { current_page: number; last_page: number };
    }>((resolve, reject) => {
      const options = {
        hostname: process.env.NEXT_PUBLIC_API_HOST || "resonance-be.ddev.site",
        path: `/api/genres?page=${currentPage}`,
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        rejectUnauthorized: false,
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(
              new Error(
                `HTTP Error: ${res.statusCode} ${res.statusMessage} - ${data}`
              )
            );
            return;
          }
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      req.end();
    });

    allGenres.push(...response.data);

    if (response.meta.current_page >= response.meta.last_page) {
      hasMorePages = false;
    } else {
      currentPage++;
    }
  }

  return allGenres;
}

export async function getAllConcerts(
  filters?: ConcertFilters
): Promise<{ concerts: ApiConcert[] }> {
  try {
    const baseUrl = getBaseUrl();
    const token = process.env.API_TOKEN?.trim();
    console.log("Filters received in getAllConcerts:", filters);

    if (!token) {
      throw new Error("API token is missing");
    }

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
    if (filters?.genres && filters.genres.length > 0) {
      console.log("Processing genres:", filters.genres);

      try {
        // Fetch all genres first
        const allGenres = await fetchAllGenres(token);
        console.log("Fetched all genres:", allGenres.length);

        // Find matching genre IDs
        const genreIds = filters.genres.map((genreName) => {
          const matchingGenre = allGenres.find((g) => g.genre === genreName);
          if (!matchingGenre) {
            console.error("No matching genre found for:", genreName);
            throw new Error(`No matching genre found for: ${genreName}`);
          }
          console.log(`Found genre ID for ${genreName}:`, matchingGenre.id);
          return matchingGenre.id;
        });

        if (genreIds.length > 0) {
          // Join all genre IDs with commas
          const genreIdsString = genreIds.join(",");
          queryParams.set("genre_ids", genreIdsString);
          if (filters.genreFilterMode) {
            queryParams.set("filter_mode", filters.genreFilterMode);
          }
          console.log("Added genre filtering params:", {
            genre_ids: genreIdsString,
            filter_mode: filters.genreFilterMode || "any",
          });
        }
      } catch (error) {
        console.error("Error processing genres:", error);
        throw error;
      }
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
