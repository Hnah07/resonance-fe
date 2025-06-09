import { NextResponse } from "next/server";
import { makeRequest } from "@/lib/api";
import { cache } from "react";
import { ApiLocationResponse } from "@/types/concert";
import { cookies } from "next/headers";

type LocationItem = ApiLocationResponse["data"][number];

// Cache the getAllLocations function
const getAllLocations = cache(async () => {
  try {
    // Get the auth token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    console.log(
      "Fetching locations with token:",
      token ? "Token present" : "No token"
    );

    // Make the request - makeRequest will handle the token from cookies
    const response = await makeRequest<ApiLocationResponse>("/api/locations");

    if (!response.data) {
      console.error("No data in locations response");
      throw new Error("No data received from locations API");
    }

    console.log("Successfully fetched locations:", response.data.length);
    return response.data as unknown as LocationItem[];
  } catch (error) {
    console.error("Error fetching locations:", error);
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
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const location = searchParams.get("location");
  const all = searchParams.get("all") === "true";

  console.log("Locations API request params:", { city, location, all });

  try {
    // Always fetch all locations first
    const locations = await getAllLocations();
    console.log("Fetched all locations:", locations);

    if (all) {
      // Extract unique cities from locations and sort them
      const cities = Array.from(
        new Set(locations.map((loc) => loc.city))
      ).sort();
      console.log("Returning unique cities:", cities);
      return NextResponse.json({ data: cities });
    }

    // Filter locations based on search parameters
    let filteredLocations = locations;
    if (city) {
      const searchCity = city.toLowerCase();
      console.log("Filtering by city:", searchCity);
      filteredLocations = locations.filter((loc) =>
        loc.city.toLowerCase().includes(searchCity)
      );
      console.log("Filtered locations:", filteredLocations);
    } else if (location) {
      const searchLocation = location.toLowerCase();
      console.log("Filtering by location:", searchLocation);
      filteredLocations = locations.filter((loc) =>
        loc.name.toLowerCase().includes(searchLocation)
      );
      console.log("Filtered locations:", filteredLocations);
    }

    return NextResponse.json({ data: filteredLocations });
  } catch (error) {
    console.error("Server-side API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch location" },
      { status: 500 }
    );
  }
}
