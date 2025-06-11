import { NextResponse } from "next/server";

// Cache reverse geocoding results for 30 days since they rarely change
export const revalidate = 2592000;

// In-memory cache for reverse geocoding results
const reverseCache = new Map<string, { city: string }>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Latitude and longitude parameters are required" },
      { status: 400 }
    );
  }

  try {
    // Check in-memory cache first
    const cacheKey = `${lat},${lon}`;
    const cachedResult = reverseCache.get(cacheKey);
    if (cachedResult) {
      console.log("Using cached reverse geocoding for:", cacheKey);
      return NextResponse.json(cachedResult, {
        headers: {
          "Cache-Control":
            "public, s-maxage=2592000, stale-while-revalidate=1296000",
        },
      });
    }

    // If not in cache, fetch from Nominatim
    console.log("Fetching reverse geocoding for:", cacheKey);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "Resonance App",
        },
      }
    );

    const data = await response.json();
    if (data && data.address) {
      // Try to get the city name in this order:
      // 1. city
      // 2. town
      // 3. village
      // 4. municipality
      // 5. county
      const cityName =
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.municipality ||
        data.address.county;

      if (cityName) {
        const result = { city: cityName };
        // Store in memory cache
        reverseCache.set(cacheKey, result);

        return NextResponse.json(result, {
          headers: {
            "Cache-Control":
              "public, s-maxage=2592000, stale-while-revalidate=1296000",
          },
        });
      }
    }

    return NextResponse.json(
      { error: "City not found for these coordinates" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching reverse geocoding:", error);
    return NextResponse.json(
      { error: "Failed to fetch city name" },
      { status: 500 }
    );
  }
}
