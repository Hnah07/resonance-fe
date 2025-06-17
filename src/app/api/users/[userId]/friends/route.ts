import { NextRequest, NextResponse } from "next/server";
import { makeAuthRequest } from "@/app/api/auth/make-auth-request";
import { cookies } from "next/headers";
import { ProfileStats } from "@/types/summary-stats";

// Configure caching
export const dynamic = "force-dynamic";
export const revalidate = 30;

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Get the auth token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token");

    console.log("[User Friends API] Request details:", {
      url: request.url,
      method: request.method,
      userId,
      headers: Object.fromEntries(request.headers.entries()),
      hasAuthToken: !!authToken,
      environment: process.env.NODE_ENV,
      apiHost: process.env.NEXT_PUBLIC_API_HOST,
    });

    if (!authToken) {
      console.log("[User Friends API] No auth token found");
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    // Make request to the user stats API to get friends data
    const response = await makeAuthRequest<Record<string, never>, ProfileStats>(
      `/api/users/${userId}/stats`,
      "GET",
      {}
    );

    console.log("[User Friends API] Backend response:", {
      hasData: !!response,
      followersCount: response?.followers_count,
      followingCount: response?.following_count,
    });

    if (!response) {
      return NextResponse.json(
        { message: "Failed to fetch user friends data" },
        { status: 500 }
      );
    }

    // Return with appropriate caching headers
    return NextResponse.json(
      {
        followers: response.followers,
        following: response.following,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=59",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("[User Friends API] Error:", error);

    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes("401")) {
        return NextResponse.json(
          { message: "Please log in to view user friends" },
          { status: 401 }
        );
      }
      if (error.message.includes("404")) {
        return NextResponse.json(
          { message: "User friends data not found" },
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
        message: "Failed to fetch user friends data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
