import { NextResponse } from "next/server";
import { getAllConcerts } from "@/queries/concerts";
import { ApiConcert } from "@/types/concert";

export async function GET() {
  try {
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

    const genres = [
      ...new Set(
        concerts.flatMap((concert: ApiConcert) => concert.genres || [])
      ),
    ].sort();
    console.log("Extracted genres:", genres.length);

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
      genres,
      eventTypes,
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    return NextResponse.json(
      {
        error: "Failed to fetch filter options",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
