import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { makeAuthRequest } from "@/app/api/auth/make-auth-request";

interface UserSearchResult {
  id: string;
  name: string;
  username: string;
  profile_photo_url: string;
  bio: string | null;
  city: string | null;
  country_name: string | null;
  followers_count: number;
  following_count: number;
  checkins_count: number;
  is_following: boolean;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const page = searchParams.get("page") || "1";
  const perPage = searchParams.get("per_page") || "20";

  if (!query) {
    return NextResponse.json(
      { error: "Search query parameter 'q' is required" },
      { status: 400 }
    );
  }

  try {
    // Get the auth token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token");

    if (!authToken) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    // Make request to the backend user search API
    const response = await makeAuthRequest<
      Record<string, never>,
      UserSearchResult[]
    >(
      `/api/users/search?q=${encodeURIComponent(
        query
      )}&page=${page}&per_page=${perPage}`,
      "GET",
      {}
    );

    console.log("[User Search API] Backend response:", {
      hasData: !!response,
      dataLength: Array.isArray(response) ? response.length : 0,
      query,
      page,
      perPage,
    });

    if (!response) {
      return NextResponse.json([]);
    }

    // Return the search results
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[User Search API] Error:", error);

    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes("401")) {
        return NextResponse.json(
          { message: "Please log in to search users" },
          { status: 401 }
        );
      }
      if (error.message.includes("404")) {
        return NextResponse.json([]);
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
        message: "Failed to search users",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
