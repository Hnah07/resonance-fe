import { NextRequest, NextResponse } from "next/server";
import { makeAuthRequest } from "@/app/api/auth/make-auth-request";
import { cookies } from "next/headers";
import { ProfileStats } from "@/types/summary-stats";

// Configure caching
export const dynamic = "force-dynamic";
export const revalidate = 30;

interface UserProfileResponse {
  data: {
    id: string;
    name: string;
    username: string;
    profile_photo_url: string;
    bio: string | null;
    city: string | null;
    country: {
      id: string;
      name: string;
    };
    country_name: string;
    created_at: string;
    stats: {
      followers_count: number;
      following_count: number;
      checkins_count: number;
      concerts_count: number;
      artists_count: number;
    };
    is_following: boolean;
    is_current_user: boolean;
  };
}

interface CheckIn {
  user: {
    id: string;
    name?: string;
    username: string;
    image?: string;
  };
  concert: {
    id: string;
    event: string;
    location: {
      id: string;
      name: string;
    };
    city: string;
    country: string;
    image: string;
    date: string;
    rating: number;
    artists: string[];
    genres: string[];
  };
  checkIn: {
    id: string;
    date: string;
    time: string;
    comment: string;
    likes: number;
    comments: Array<{
      id: string;
      user: {
        id: string;
        name: string;
        image?: string;
      };
      text: string;
      date: string;
      time: string;
    }>;
    photos: Array<{
      id: string;
      url: string;
      caption: string | null;
    }>;
  };
}

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

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  check_in_id: string;
  created_at: string;
}

interface UserDataResponse {
  profile: UserProfileResponse["data"];
  checkIns: CheckIn[];
  stats: ProfileStats;
  summaryStats: SummaryStatsResponse;
  friends: {
    followers: ProfileStats["followers"];
    following: ProfileStats["following"];
  };
  photos: Photo[];
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

    console.log("[User Data API] Request details:", {
      url: request.url,
      method: request.method,
      userId,
      headers: Object.fromEntries(request.headers.entries()),
      hasAuthToken: !!authToken,
      environment: process.env.NODE_ENV,
      apiHost: process.env.NEXT_PUBLIC_API_HOST,
    });

    if (!authToken) {
      console.log("[User Data API] No auth token found");
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    // Fetch all user data in parallel
    const [
      profileResponse,
      checkInsResponse,
      statsResponse,
      summaryStatsResponse,
      photosResponse,
    ] = await Promise.allSettled([
      makeAuthRequest<Record<string, never>, UserProfileResponse>(
        `/api/users/${userId}`,
        "GET",
        {}
      ),
      makeAuthRequest<Record<string, never>, CheckIn[]>(
        `/api/users/${userId}/check-ins`,
        "GET",
        {}
      ),
      makeAuthRequest<Record<string, never>, ProfileStats>(
        `/api/users/${userId}/stats`,
        "GET",
        {}
      ),
      makeAuthRequest<Record<string, never>, SummaryStatsResponse>(
        `/api/users/${userId}/summary-stats`,
        "GET",
        {}
      ),
      makeAuthRequest<Record<string, never>, Photo[]>(
        `/api/users/${userId}/photos`,
        "GET",
        {}
      ),
    ]);

    console.log("[User Data API] Backend responses:", {
      profileStatus: profileResponse.status,
      checkInsStatus: checkInsResponse.status,
      statsStatus: statsResponse.status,
      summaryStatsStatus: summaryStatsResponse.status,
      photosStatus: photosResponse.status,
    });

    // Build response object with available data
    const userData: Partial<UserDataResponse> = {};

    // Handle profile data
    if (profileResponse.status === "fulfilled" && profileResponse.value?.data) {
      userData.profile = profileResponse.value.data;
    }

    // Handle check-ins data
    if (checkInsResponse.status === "fulfilled" && checkInsResponse.value) {
      userData.checkIns = Array.isArray(checkInsResponse.value)
        ? checkInsResponse.value
        : [checkInsResponse.value];
    }

    // Handle stats data
    if (statsResponse.status === "fulfilled" && statsResponse.value) {
      userData.stats = statsResponse.value;
      userData.friends = {
        followers: statsResponse.value.followers || [],
        following: statsResponse.value.following || [],
      };
    }

    // Handle summary stats data
    if (
      summaryStatsResponse.status === "fulfilled" &&
      summaryStatsResponse.value
    ) {
      userData.summaryStats = summaryStatsResponse.value;
    }

    // Handle photos data
    if (photosResponse.status === "fulfilled" && photosResponse.value) {
      userData.photos = Array.isArray(photosResponse.value)
        ? photosResponse.value
        : [];
    }

    // Return with appropriate caching headers
    return NextResponse.json(userData, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=59",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[User Data API] Error:", error);

    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes("401")) {
        return NextResponse.json(
          { message: "Please log in to view user data" },
          { status: 401 }
        );
      }
      if (error.message.includes("404")) {
        return NextResponse.json(
          { message: "User data not found" },
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
        message: "Failed to fetch user data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
