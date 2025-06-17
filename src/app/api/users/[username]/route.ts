import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { makeAuthRequest } from "@/app/api/auth/make-auth-request";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");

  console.log("[User API] Request details:", {
    url: request.url,
    method: request.method,
    hasAuthToken: !!authToken,
    tokenLength: authToken?.value?.length,
  });

  try {
    const { username } = await params;
    console.log("[User API] Fetching user with username:", username);

    // Make the request with or without auth token
    const response = (await makeAuthRequest(
      `/api/users/${username}`,
      "GET",
      {}
    )) as UserProfileResponse;

    console.log("[User API] Complete backend response:", response);

    // Handle the backend response structure
    if (response && response.data) {
      const userData = response.data;

      // Transform the response to match the frontend interface
      const transformedUser = {
        id: userData.id,
        name: userData.name,
        username: userData.username,
        bio: userData.bio,
        city: userData.city,
        country_name: userData.country_name,
        profile_photo_url: userData.profile_photo_url,
        followers_count: userData.stats?.followers_count || 0,
        following_count: userData.stats?.following_count || 0,
        checkins_count: userData.stats?.checkins_count || 0,
        concerts_count: userData.stats?.concerts_count || 0,
        artists_count: userData.stats?.artists_count || 0,
        is_following: userData.is_following || false,
        is_current_user: userData.is_current_user || false,
      };

      console.log("[User API] Transformed user:", transformedUser);

      return NextResponse.json({ data: transformedUser });
    }

    console.log("[User API] No data in response, returning null");
    return NextResponse.json({ data: null });
  } catch (error) {
    console.error("[User API] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      username: await params.then((p) => p.username),
    });

    const statusMatch =
      error instanceof Error ? error.message.match(/HTTP Error: (\d+)/) : null;
    const status = statusMatch ? parseInt(statusMatch[1]) : 500;
    const message =
      error instanceof Error ? error.message : "Failed to fetch user profile";
    return NextResponse.json({ message }, { status });
  }
}
