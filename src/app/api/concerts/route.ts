// app/api/concerts/route.ts
import { getAllConcerts } from "@/queries/concerts";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const concerts = await getAllConcerts();
    return NextResponse.json({ concerts }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch concerts",
      },
      { status: 500 }
    );
  }
}
