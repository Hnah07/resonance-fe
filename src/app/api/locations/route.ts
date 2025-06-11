import { NextRequest, NextResponse } from "next/server";
import { makeRequest } from "@/lib/api";

// Configure static rendering for this route
export const dynamic = "force-static";
export const revalidate = 3600; // Cache for 1 hour since locations rarely change

type LocationItem = {
  id: number;
  name: string;
  city: string;
  country: string;
};

type ApiResponse<T> = {
  data: T;
  links?: Record<string, string>;
  meta?: Record<string, unknown>;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get("city");
    const location = searchParams.get("location");
    const all = searchParams.get("all");

    console.log("Locations API request params:", {
      city,
      location,
      all,
    });

    // Build the API path with query parameters
    let apiPath = "/api/locations";
    const queryParams = new URLSearchParams();

    if (location) {
      queryParams.append("name", location);
    } else if (city) {
      // For city search, use a partial match by adding a wildcard
      queryParams.append("city", `${city}%`);
    } else if (all) {
      queryParams.append("all", "true");
    }

    if (queryParams.toString()) {
      apiPath += `?${queryParams.toString()}`;
    }

    // Make the request with caching options
    const response = await makeRequest<ApiResponse<LocationItem[]>>(apiPath, {
      next: {
        revalidate: 3600, // Cache for 1 hour
        tags: ["locations"],
      },
    });

    // For city search, extract unique cities from the response
    if (city) {
      const locations = (response as unknown as ApiResponse<LocationItem[]>)
        .data;
      const uniqueCities = [
        ...new Set(locations.map((item) => item.city)),
      ].sort();
      return NextResponse.json({ data: uniqueCities });
    }

    // Return the filtered locations for other cases
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
      },
    });
  } catch (error) {
    console.error("Error in locations API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}
