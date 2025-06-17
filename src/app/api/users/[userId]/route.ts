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
  { params }: { params: Promise<{ userId: string }> }
) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");

  if (!authToken) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const { userId } = await params;
    const response = (await makeAuthRequest(
      `/api/users/${userId}`,
      "GET",
      {}
    )) as UserProfileResponse;

    console.log("User profile API - Backend response:", response);

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

      console.log("User profile API - Transformed user:", transformedUser);

      return NextResponse.json({ data: transformedUser });
    }

    return NextResponse.json({ data: null });
  } catch (error) {
    console.error("User profile API error:", error);
    const statusMatch =
      error instanceof Error ? error.message.match(/HTTP Error: (\d+)/) : null;
    const status = statusMatch ? parseInt(statusMatch[1]) : 500;
    const message =
      error instanceof Error ? error.message : "Failed to fetch user profile";
    return NextResponse.json({ message }, { status });
  }
}
