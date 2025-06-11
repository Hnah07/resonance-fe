import { NextResponse } from "next/server";
import { getAllConcerts } from "@/queries/concerts";
import { ApiConcert } from "@/types/concert";

// Configure static generation with revalidation
export const revalidate = 3600; // Cache for 1 hour since filters change less frequently

export async function GET() {
  try {
    console.log("Starting filters endpoint request");
    console.log("Environment:", process.env.NODE_ENV);
    console.log("API Host:", process.env.NEXT_PUBLIC_API_HOST);

    const { concerts } = await getAllConcerts();
    console.log("Successfully fetched concerts for filters:", concerts.length);

    // Extract unique values
    const locations = [
      ...new Set(
        concerts
          .map((concert: ApiConcert) => concert.location.city)
          .filter(Boolean)
      ),
    ].sort();
    console.log("Extracted locations:", locations.length);

    // Extract genres from artists
    const genres = new Set<string>();
    concerts.forEach((concert: ApiConcert) => {
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
    });
    const sortedGenres = Array.from(genres).sort();
    console.log("Extracted genres from artists:", sortedGenres.length);

    const eventTypes = [
      ...new Set(
        concerts.map((concert: ApiConcert) =>
          typeof concert.event === "string" ? "concert" : concert.event.type
        )
      ),
    ].sort();
    console.log("Extracted event types:", eventTypes.length);

    return NextResponse.json({
      locations,
      genres: sortedGenres,
      eventTypes,
    });
  } catch (error) {
    console.error("Error in filters endpoint:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      });
    }
    return NextResponse.json(
      {
        error: "Failed to fetch filter options",
        details:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                cause: error.cause,
              }
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}
