import { NextResponse } from "next/server";
import { getAllConcerts } from "@/queries/concerts";
import { EventType, EventTypeValue } from "@/types/concert";

export async function GET() {
  try {
    console.log("Starting event types endpoint request");

    // Get all concerts to extract unique event types
    const { concerts } = await getAllConcerts();
    console.log(
      "Successfully fetched concerts for event types:",
      concerts.length
    );

    // Extract unique event types from concerts
    const uniqueEventTypes = Array.from(
      new Set(
        concerts.map((concert) =>
          typeof concert.event === "string" ? "concert" : concert.event.type
        )
      )
    ).sort();

    // Map the event types to include id and description
    const eventTypes: EventType[] = uniqueEventTypes.map((type, index) => ({
      id: (index + 1).toString(),
      name: type as EventTypeValue,
      description: getEventTypeDescription(type as EventTypeValue),
    }));

    console.log("Extracted event types:", eventTypes.length);
    return NextResponse.json({ data: eventTypes });
  } catch (error) {
    console.error("Error in event types endpoint:", error);
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
        error: "Failed to fetch event types",
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

// Helper function to get description for each event type
function getEventTypeDescription(type: EventTypeValue): string {
  switch (type) {
    case "concert":
      return "A single concert event";
    case "festival":
      return "A multi-day festival with multiple artists";
    case "tour":
      return "A series of concerts across multiple locations";
    case "other":
      return "Other types of events";
    default:
      return "Unknown event type";
  }
}
