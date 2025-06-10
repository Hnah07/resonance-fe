import { makeRequest } from "@/lib/api";
import { ApiConcert } from "@/types/concert";

export interface ConcertFilters {
  city?: string | null;
  location?: string | null;
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
    console.log("Starting getAllConcerts request with filters:", filters);
    console.log("Environment:", {
      nodeEnv: process.env.NODE_ENV,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      frontendUrl: process.env.FRONTEND_URL,
    });

    // Build query parameters
    const queryParams = new URLSearchParams();

    // Always set today as the minimum date for the discover page
    const today = new Date();
    // Get local date string in YYYY-MM-DD format
    const todayISO = today.toLocaleDateString("en-CA"); // This gives YYYY-MM-DD in local timezone

    console.log("Date filtering:", {
      today: today.toLocaleString(),
      todayISO,
      filtersDateFrom: filters?.dateFrom,
      currentTime: new Date().toLocaleString(),
    });

    // Only use dateFrom if it's after today
    if (filters?.dateFrom) {
      const dateFrom = new Date(filters.dateFrom);
      const dateFromLocal = dateFrom.toLocaleDateString("en-CA");
      console.log("Date comparison:", {
        dateFrom: dateFromLocal,
        today: todayISO,
        isAfterToday: dateFromLocal > todayISO,
      });

      if (dateFromLocal > todayISO) {
        queryParams.append("dateFrom", filters.dateFrom);
        console.log("Using provided dateFrom:", filters.dateFrom);
      } else {
        queryParams.append("dateFrom", todayISO);
        console.log("Using today as dateFrom:", todayISO);
      }
    } else {
      // If no dateFrom is specified, use today
      queryParams.append("dateFrom", todayISO);
      console.log("No dateFrom provided, using today:", todayISO);
    }

    // Add other filters to query params
    if (filters?.city) {
      console.log("Adding location_city filter to query params:", filters.city);
      queryParams.append("location_city", filters.city);
    }

    if (filters?.location) {
      console.log(
        "Adding location_name filter to query params:",
        filters.location
      );
      queryParams.append("location_name", filters.location);
    }

    if (filters?.genres && filters.genres.length > 0) {
      // Fetch genre IDs for the selected genres
      const allGenres: { id: string; genre: string }[] = [];
      let currentPage = 1;
      let hasMorePages = true;

      console.log("Fetching all genres for mapping...");

      while (hasMorePages) {
        console.log(`Fetching genres page ${currentPage}...`);
        const response = await makeRequest<{
          data: { id: string; genre: string }[];
          meta: { current_page: number; last_page: number };
        }>(`/api/genres?page=${currentPage}`, {
          next: { revalidate: 0, tags: ["genres"] },
        });

        const genres = response.data as unknown as {
          id: string;
          genre: string;
        }[];
        allGenres.push(...genres);
        console.log(
          `Page ${currentPage} genres:`,
          genres.map((g) => g.genre)
        );

        if (response.meta.current_page >= response.meta.last_page) {
          console.log(
            `Reached last page (${response.meta.last_page}). Total genres: ${allGenres.length}`
          );
          hasMorePages = false;
        } else {
          currentPage++;
        }
      }

      // Create a map of genre names to IDs
      const genreMap = new Map<string, string>();
      allGenres.forEach((genre) => {
        const normalizedName = genre.genre.toLowerCase().trim();
        genreMap.set(normalizedName, genre.id);
        console.log(`Added genre mapping: "${normalizedName}" -> ${genre.id}`);
      });

      // Get the IDs for the requested genre names
      const genreIds = filters.genres
        .map((name) => {
          const normalizedName = name.toLowerCase().trim();
          const id = genreMap.get(normalizedName);
          console.log(`Looking up genre "${normalizedName}" -> found ID:`, id);
          return id;
        })
        .filter((id): id is string => id !== undefined);

      console.log("Final genre IDs for filtering:", genreIds);

      if (genreIds.length > 0) {
        console.log("Adding genre_ids filter to query params:", genreIds);
        queryParams.append("genre_ids", genreIds.join(","));
        if (filters.genreFilterMode) {
          console.log("Adding filter_mode:", filters.genreFilterMode);
          queryParams.append("filter_mode", filters.genreFilterMode);
        }
      } else {
        console.log("No genre IDs found for:", filters.genres);
      }
    }

    if (filters?.eventType) {
      console.log(
        "Adding event type filter to query params:",
        filters.eventType
      );
      queryParams.append("type", filters.eventType);
    }

    if (filters?.dateTo) {
      console.log("Adding date to filter to query params:", filters.dateTo);
      queryParams.append("dateTo", filters.dateTo);
    }

    // Construct the API path using a relative URL
    const apiPath = `/api/concerts${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    console.log("Making request to API with params:", {
      path: apiPath,
      dateFrom: queryParams.get("dateFrom"),
      allParams: Object.fromEntries(queryParams.entries()),
    });

    // Make the request using makeRequest with the relative path
    const response = await makeRequest<ApiConcert>(apiPath, {
      next: {
        revalidate: 0,
        tags: ["concerts", "list"],
      },
    });

    console.log("Received response from API:", {
      totalConcerts: response.data.length,
      hasLinks: !!response.links,
      hasMeta: !!response.meta,
      dates: response.data.map((c) => ({
        id: c.id,
        event: typeof c.event === "string" ? c.event : c.event.name,
        date: c.date,
      })),
    });

    // Map the response data to include genres from artists
    const concerts = response.data.map((concert) => {
      // Collect all genres from artists
      const genres = new Set<string>();
      (concert.artists || []).forEach((artist) => {
        if (typeof artist === "object" && artist.genres) {
          artist.genres.forEach((genre) => {
            if (typeof genre === "string") {
              genres.add(genre);
            } else if (genre && typeof genre === "object" && "name" in genre) {
              genres.add(genre.name);
            }
          });
        }
      });

      console.log("Mapped concert genres:", {
        id: concert.id,
        genres: Array.from(genres),
      });

      return {
        ...concert,
        genres: Array.from(genres),
      };
    });

    return { concerts };
  } catch (error) {
    console.error("Error in getAllConcerts:", error);
    throw error;
  }
}
