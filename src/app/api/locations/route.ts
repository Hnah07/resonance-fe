import { NextResponse } from "next/server";
import { makeRequest } from "@/lib/api";

type LocationItem = {
  id: string;
  name: string;
  city: string;
  country: string;
};

type LocationResponse = {
  data: LocationItem[];
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const location = searchParams.get("location");
  const all = searchParams.get("all") === "true";

  console.log("Locations API request params:", { city, location, all });

  try {
    // Build the API path with query parameters
    const apiPath = `/api/locations${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    // Fetch locations with query parameters
    const response = await makeRequest<LocationResponse>(apiPath);
    const locations = (response as unknown as { data: LocationItem[] }).data;

    if (!locations) {
      console.error("No data in locations response");
      throw new Error("No data received from locations API");
    }

    console.log("Successfully fetched locations:", locations.length);

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
