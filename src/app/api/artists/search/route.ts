import { NextRequest, NextResponse } from "next/server";
import { makeRequest } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Search query parameter 'q' is required" },
      { status: 400 }
    );
  }

  try {
    const response = await makeRequest(
      `/api/artists/search?q=${encodeURIComponent(query)}`
    );

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("Error searching artists:", error);
    return NextResponse.json(
      { error: "Failed to search artists" },
      { status: 500 }
    );
  }
}
