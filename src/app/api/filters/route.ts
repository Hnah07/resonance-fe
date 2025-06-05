import { NextResponse } from "next/server";
import { getAllConcerts } from "@/queries/concerts";
import { ApiConcert } from "@/types/concert";

export async function GET() {
  try {
    const { concerts } = await getAllConcerts();

    // Extract unique values
    const locations = [
      ...new Set(
        concerts
          .map((concert: ApiConcert) => concert.location.city)
          .filter(Boolean)
      ),
    ].sort();
    const genres = [
      ...new Set(
        concerts.flatMap((concert: ApiConcert) => concert.genres || [])
      ),
    ].sort();
    const eventTypes = [
      ...new Set(
        concerts.map((concert: ApiConcert) =>
          typeof concert.event === "string" ? "concert" : concert.event.type
        )
      ),
    ].sort();

    return NextResponse.json({
      locations,
      genres,
      eventTypes,
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return NextResponse.json(
      { error: "Failed to fetch filter options" },
      { status: 500 }
    );
  }
}
