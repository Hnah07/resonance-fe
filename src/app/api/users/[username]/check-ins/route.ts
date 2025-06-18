import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  makeAuthRequest,
  makePublicRequest,
} from "@/app/api/auth/make-auth-request";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  console.log("User check-ins API - Route called");
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");
  console.log("User check-ins API - Auth token exists:", !!authToken);

  try {
    const { username } = await params;
    console.log("User check-ins API - Requested username:", username);
    let response;

    if (authToken) {
      // Use the original user check-ins endpoint
      console.log(
        "User check-ins API - Making authenticated request to:",
        `/api/users/${username}/check-ins`
      );
      response = await makeAuthRequest(
        `/api/users/${username}/check-ins`,
        "GET",
        {}
      );
    } else {
      // Use public request if no token is available
      console.log(
        "User check-ins API - Making public request to:",
        `/api/users/${username}/check-ins`
      );
      response = await makePublicRequest(
        `/api/users/${username}/check-ins`,
        "GET",
        {}
      );
    }

    console.log("User check-ins API - Backend response:", response);

    // Transform the response to ensure artists and genres are strings
    if (
      response &&
      typeof response === "object" &&
      "data" in response &&
      Array.isArray(response.data)
    ) {
      console.log(
        "User check-ins API - Transforming data, found",
        response.data.length,
        "items"
      );

      // Debug: Log the first item to see the structure
      if (response.data.length > 0) {
        const firstItem = response.data[0];
        console.log("User check-ins API - First item structure:", {
          id: firstItem.id,
          itemKeys: Object.keys(firstItem),
          concertKeys: Object.keys(firstItem.concert || {}),
          locationType: typeof firstItem.concert?.location,
          locationKeys: firstItem.concert?.location
            ? Object.keys(firstItem.concert.location)
            : null,
          locationValue: firstItem.concert?.location,
          city: firstItem.concert?.city,
          country: firstItem.concert?.country,
          // Add more detailed location debugging
          fullConcert: JSON.stringify(firstItem.concert, null, 2),
        });
      }

      const transformedData = response.data.map(
        (item: Record<string, unknown>) => {
          const concert = item.concert as Record<string, unknown>;
          const artists = concert?.artists as
            | Array<Record<string, unknown> | string>
            | undefined;
          const genres = concert?.genres as
            | Array<Record<string, unknown> | string>
            | undefined;

          // Transform artists to strings for display
          const artistNames = Array.isArray(artists)
            ? artists.map((artist) => {
                if (typeof artist === "string") return artist;
                if (artist && typeof artist === "object" && "name" in artist) {
                  return (artist as { name: string }).name;
                }
                return "Unknown Artist";
              })
            : [];

          // Transform genres to strings
          const genreNames = Array.isArray(genres)
            ? genres.map((genre) => {
                if (typeof genre === "string") return genre;
                if (genre && typeof genre === "object" && "name" in genre) {
                  return (genre as { name: string }).name;
                }
                return "Unknown Genre";
              })
            : [];

          // Handle location data from original API format
          const location = concert?.location as
            | Record<string, unknown>
            | undefined;
          const locationName = (location?.name as string) || "Unknown Venue";
          const locationCity = (location?.city as string) || "Unknown City";
          const locationCountry =
            (location?.country as string) || "Unknown Country";

          const result = {
            ...item,
            concert: {
              ...concert,
              // Use the location data from the original API
              location: {
                id: location?.id || "default",
                name: locationName,
              },
              city: locationCity,
              country: locationCountry,
              artists: artistNames,
              genres: genreNames,
            },
          } as Record<string, unknown>;

          return result;
        }
      );

      console.log(
        "User check-ins API - Final transformed data count:",
        transformedData.length
      );

      return NextResponse.json({
        ...response,
        data: transformedData,
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("User check-ins API error:", error);
    const statusMatch =
      error instanceof Error ? error.message.match(/HTTP Error: (\d+)/) : null;
    const status = statusMatch ? parseInt(statusMatch[1]) : 500;
    const message =
      error instanceof Error ? error.message : "Failed to fetch user check-ins";
    return NextResponse.json({ message }, { status });
  }
}
