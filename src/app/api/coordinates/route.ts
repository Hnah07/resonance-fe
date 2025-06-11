import { NextResponse } from "next/server";

// Cache coordinates for 30 days since they rarely change
export const revalidate = 2592000; // 30 days

// In-memory cache for coordinates
const coordinatesCache = new Map<string, { lat: number; lon: number }>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");

  if (!city) {
    return NextResponse.json(
      { error: "City parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Check in-memory cache first
    const cachedCoords = coordinatesCache.get(city.toLowerCase());
    if (cachedCoords) {
      console.log("Using cached coordinates for:", city);
      return NextResponse.json(cachedCoords, {
        headers: {
          "Cache-Control":
            "public, s-maxage=2592000, stale-while-revalidate=1296000",
        },
      });
    }

    // If not in cache, fetch from Nominatim
    console.log("Fetching coordinates for:", city);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        city
      )}&limit=1`,
      {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "Resonance App",
        },
      }
    );

    const data = await response.json();
    if (data && data.length > 0) {
      const coordinates = {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };

      // Store in memory cache
      coordinatesCache.set(city.toLowerCase(), coordinates);

      return NextResponse.json(coordinates, {
        headers: {
          "Cache-Control":
            "public, s-maxage=2592000, stale-while-revalidate=1296000",
        },
      });
    }

    return NextResponse.json(
      { error: "Coordinates not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return NextResponse.json(
      { error: "Failed to fetch coordinates" },
      { status: 500 }
    );
  }
}
