import { NextRequest, NextResponse } from "next/server";
import { makeRequest } from "@/lib/api";
import { makeAuthRequest } from "../auth/make-auth-request";

// Configure caching
export const dynamic = "force-dynamic";
export const revalidate = 3600; // Cache for 1 hour

type LocationItem = {
  id: number;
  name: string;
  city: string;
  country: string;
};

type CountryResponse = {
  id: string;
  name: string;
  code: string;
};

type PaginatedResponse<T> = {
  data: T[];
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const countryId = searchParams.get("id");

    console.log("[Countries API] Received country_id:", countryId);

    if (!countryId) {
      return NextResponse.json(
        { error: "Country ID is required" },
        { status: 400 }
      );
    }

    // Make request to the backend API
    try {
      console.log("[Countries API] Fetching country from backend...");
      const response = await makeAuthRequest<
        Record<string, never>,
        PaginatedResponse<CountryResponse>
      >(`/api/countries?country_id=${countryId}&per_page=250`, "GET", {});

      console.log("[Countries API] Backend response:", {
        hasData: !!response?.data,
        dataLength: response?.data?.length,
        firstCountry: response?.data?.[0],
        requestedId: countryId,
        allIds: response?.data?.map((c) => c.id),
        meta: response?.meta,
      });

      if (response?.data && response.data.length > 0) {
        // Find the country with the matching ID
        const country = response.data.find((c) => c.id === countryId);

        if (country) {
          console.log("[Countries API] Found country in backend:", {
            id: country.id,
            name: country.name,
            code: country.code,
          });
          // Return the country data with caching headers
          return NextResponse.json(
            {
              data: [
                {
                  id: country.id,
                  name: country.name,
                  code:
                    country.code || country.name.substring(0, 2).toUpperCase(),
                },
              ],
            },
            {
              headers: {
                "Cache-Control":
                  "public, s-maxage=3600, stale-while-revalidate=1800",
              },
            }
          );
        }

        // If we get here, we didn't find a country with the matching ID
        console.log("[Countries API] Country ID not found in response:", {
          requestedId: countryId,
          availableIds: response.data.map((c) => c.id),
          totalCountries: response.meta?.total,
          currentPage: response.meta?.current_page,
          lastPage: response.meta?.last_page,
        });
        return NextResponse.json(
          { error: "Country not found" },
          { status: 404 }
        );
      }

      // If no country found in the data array
      console.log("[Countries API] No country found in backend response");
      return NextResponse.json({ error: "Country not found" }, { status: 404 });
    } catch (error) {
      console.log(
        "[Countries API] Failed to fetch country from backend:",
        error
      );
      // If the backend request fails with a 404, try to find the country in our locations data
      if (error instanceof Error && error.message.includes("404")) {
        console.log(
          "[Countries API] Country not found in backend, trying locations data..."
        );

        // Make request to the locations API to get all locations
        const locationsResponse = await makeRequest<LocationItem>(
          "/api/locations?all=true",
          {
            next: {
              revalidate: 3600, // Cache for 1 hour
              tags: ["locations"],
            },
          }
        );

        if (!locationsResponse.data || locationsResponse.data.length === 0) {
          console.log("[Countries API] No locations found");
          return NextResponse.json(
            { error: "Failed to fetch locations" },
            { status: 500 }
          );
        }

        console.log(
          "[Countries API] Found locations:",
          locationsResponse.data.length
        );

        // Create a map of unique countries
        const countries = new Map<
          string,
          { id: string; name: string; code: string }
        >();
        for (const location of locationsResponse.data) {
          if (!countries.has(location.country)) {
            // Use the country name as both the ID and name since we don't have separate IDs
            countries.set(location.country, {
              id: location.country,
              name: location.country,
              code: location.country.substring(0, 2).toUpperCase(), // Use first two letters as code
            });
          }
        }

        console.log(
          "[Countries API] Found unique countries:",
          Array.from(countries.keys())
        );
        console.log("[Countries API] Looking for country_id:", countryId);
        console.log(
          "[Countries API] Available country IDs:",
          Array.from(countries.keys())
        );

        // Try to find a country that matches the ID
        const country = countries.get(countryId);
        if (country) {
          console.log("[Countries API] Found country in locations:", country);
          return NextResponse.json(
            { data: [country] },
            {
              headers: {
                "Cache-Control":
                  "public, s-maxage=3600, stale-while-revalidate=1800",
              },
            }
          );
        }
      }
      // If we get here, we couldn't find the country
      console.log("[Countries API] Country not found in any source");
      return NextResponse.json({ error: "Country not found" }, { status: 404 });
    }

    // If we get here, the backend response didn't have a name
    console.log("[Countries API] Backend response missing name field");
    return NextResponse.json(
      { error: "Invalid country data" },
      { status: 500 }
    );
  } catch (error) {
    console.error("[Countries API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch country data" },
      { status: 500 }
    );
  }
}
