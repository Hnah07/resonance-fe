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
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Get the auth token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token");

    console.log("[User Summary Stats API] Request details:", {
      url: request.url,
      method: request.method,
      userId,
      headers: Object.fromEntries(request.headers.entries()),
      hasAuthToken: !!authToken,
      environment: process.env.NODE_ENV,
      apiHost: process.env.NEXT_PUBLIC_API_HOST,
    });

    if (!authToken) {
      console.log("[User Summary Stats API] No auth token found");
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    // Make request to the summary stats API for the specific user
    const response = await makeAuthRequest<
      Record<string, never>,
      SummaryStatsResponse
    >(`/api/users/${userId}/summary-stats`, "GET", {});

    console.log("[User Summary Stats API] Backend response:", {
      hasData: !!response,
      concertsThisYear: response?.concerts_this_year,
      totalConcerts: response?.total_concerts,
      countriesVisited: response?.countries_visited,
    });

    if (!response) {
      return NextResponse.json(
        { message: "Failed to fetch summary statistics" },
        { status: 500 }
      );
    }

    // Ensure the response has the expected structure with default values
    const validatedResponse: SummaryStatsResponse = {
      concerts_this_year: response.concerts_this_year || 0,
      total_concerts: response.total_concerts || 0,
      countries_visited: response.countries_visited || 0,
      countries_list: response.countries_list || [],
      favorite_genre: response.favorite_genre || {
        genre: "No data",
        count: 0,
      },
      most_seen_artist: response.most_seen_artist || {
        name: "No data",
        count: 0,
      },
      top_venue: response.top_venue || {
        name: "No data",
        count: 0,
      },
    };

    // Return with appropriate caching headers
    return NextResponse.json(validatedResponse, {
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
      userId: params.userId,
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
