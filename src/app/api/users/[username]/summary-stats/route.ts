import { NextRequest, NextResponse } from "next/server";
import { makeAuthRequest } from "@/app/api/auth/make-auth-request";
import { cookies } from "next/headers";

// Configure caching
export const dynamic = "force-dynamic";
export const revalidate = 30;

interface SummaryStatsResponse {
  concerts_this_year: number;
  total_concerts: number;
  countries_visited: number;
  countries_list: string[];
  favorite_genre: {
    genre: string;
    count: number;
  };
  most_seen_artist: {
    name: string;
    count: number;
  };
  top_venue: {
    name: string;
    count: number;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  let username: string = "";

  try {
    const resolvedParams = await params;
    username = resolvedParams.username;

    // Get the auth token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token");

    console.log("[User Summary Stats API] Request details:", {
      url: request.url,
      method: request.method,
      username,
      headers: Object.fromEntries(request.headers.entries()),
      hasAuthToken: !!authToken,
      environment: process.env.NODE_ENV,
      apiHost: process.env.NEXT_PUBLIC_API_HOST,
    });

    if (!authToken) {
      console.log("[User Summary Stats API] No auth token found");
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    // Fetch the summary stats directly from the backend API
    const summaryStatsResponse = await makeAuthRequest<
      Record<string, never>,
      SummaryStatsResponse
    >(`/api/users/${username}/summary-stats`, "GET", {});

    console.log("[User Summary Stats API] Summary stats response:", {
      hasData: !!summaryStatsResponse,
      concertsThisYear: summaryStatsResponse?.concerts_this_year,
      totalConcerts: summaryStatsResponse?.total_concerts,
      countriesVisited: summaryStatsResponse?.countries_visited,
    });

    if (!summaryStatsResponse) {
      return NextResponse.json(
        { message: "Failed to fetch summary statistics" },
        { status: 500 }
      );
    }

    // Return with appropriate caching headers
    return NextResponse.json(summaryStatsResponse, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=59",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[User Summary Stats API] Error:", error);
    console.error("[User Summary Stats API] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      username: username,
    });

    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes("401")) {
        return NextResponse.json(
          { message: "Please log in to view summary statistics" },
          { status: 401 }
        );
      }
      if (error.message.includes("404")) {
        return NextResponse.json(
          { message: "Summary statistics not found" },
          { status: 404 }
        );
      }
      if (error.message.includes("429")) {
        return NextResponse.json(
          { message: "Too many requests. Please try again later" },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      {
        message: "Failed to fetch summary statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
