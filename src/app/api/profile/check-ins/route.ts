import { NextRequest, NextResponse } from "next/server";
import { makeAuthRequest } from "@/app/api/auth/make-auth-request";
import { cookies } from "next/headers";

// Configure caching
export const dynamic = "force-dynamic";
export const revalidate = 30;

interface TimelineResponse {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    profile_photo_path: string | null;
    profile_photo_url: string | null;
  };
  concert: {
    id: string;
    date: string;
    event: {
      id: string;
      name: string;
      image_url?: string | null;
    };
    location?: {
      id: string;
      name: string;
      city: string;
      country: string;
    };
    artists: Array<{
      id: string;
      name: string;
      image_url?: string | null;
      genres?: Array<{
        id: string;
        genre: string;
      }>;
      pivot: {
        concert_id: string;
        artist_id: string;
        created_at: string;
        updated_at: string;
      };
    }>;
  };
  photos: Array<{
    id: string;
    url: string;
    caption: string | null;
  }>;
  likes?: Array<{
    id: string;
    user_id: string;
  }>;
  comments: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      username: string;
      profile_photo_url: string | null;
    };
    comment: string;
    created_at: string;
  }>;
  rating: number | null;
  review: string | null;
  created_at: string;
  updated_at: string;
}

interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const perPage = searchParams.get("per_page") || "15";

    // Get the auth token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token");

    console.log("[Profile Check-ins API] Request details:", {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      searchParams: Object.fromEntries(searchParams.entries()),
      hasAuthToken: !!authToken,
      environment: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      apiHost: process.env.NEXT_PUBLIC_API_HOST,
    });

    if (!authToken) {
      console.log("[Profile Check-ins API] No auth token found");
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    // Get the user ID from the auth token
    const userId = authToken.value.split("|")[0];

    // Make request to the timeline API with a user filter
    const response = await makeAuthRequest<
      Record<string, never>,
      PaginatedResponse<TimelineResponse>
    >(
      `/api/timeline?page=${page}&per_page=${perPage}&user_id=${userId}`,
      "GET",
      {}
    );

    console.log("[Profile Check-ins API] Backend response:", {
      hasData: !!response?.data,
      dataLength: response?.data?.length,
      currentPage: response?.current_page,
      lastPage: response?.last_page,
      total: response?.total,
    });

    if (!response?.data) {
      return NextResponse.json({ data: [] });
    }

    const { data: checkIns, current_page, last_page, total, links } = response;

    // Transform the response with fallback values
    const transformedData = checkIns.map((item: TimelineResponse) => {
      const likes = item.likes ?? [];
      const isLiked = likes.some(
        (like: { user_id: string }) => like.user_id === userId
      );

      // Transform artists to just include names for display
      const artistNames = item.concert.artists.map(
        (artist: { name: string }) => artist.name
      );

      return {
        id: item.id,
        user: {
          id: item.user.id,
          name: item.user.name,
          username: item.user.username || item.user.name,
          image: item.user.profile_photo_url || "/placeholder-avatar-user.jpg",
        },
        concert: {
          id: item.concert.id,
          event: item.concert.event.name,
          location: {
            id: item.concert.location?.id || "default",
            name: item.concert.location?.name || "Unknown Venue",
          },
          city: item.concert.location?.city || "Unknown City",
          country: item.concert.location?.country || "Unknown Country",
          image: item.concert.event.image_url || "/placeholder-concert.jpg",
          date: item.concert.date,
          rating: item.rating ?? 0,
          artists: artistNames,
          genres: [],
        },
        checkIn: {
          id: item.id,
          date: new Date(item.created_at).toISOString().split("T")[0],
          time: new Date(item.created_at).toLocaleTimeString(),
          comment: item.review || "",
          likes: likes.length,
          isLiked,
          comments: (item.comments ?? []).map(
            (comment: {
              id: string;
              user: {
                id: string;
                name: string;
                profile_photo_url: string | null;
              };
              comment: string;
              created_at: string;
            }) => ({
              id: comment.id,
              user: {
                id: comment.user.id,
                name: comment.user.name,
                image:
                  comment.user.profile_photo_url ||
                  "/placeholder-avatar-user.jpg",
              },
              text: comment.comment,
              date: new Date(comment.created_at).toISOString().split("T")[0],
              time: new Date(comment.created_at).toLocaleTimeString(),
            })
          ),
          photos: (item.photos ?? []).map(
            (photo: { id: string; url: string; caption: string | null }) => ({
              id: photo.id,
              url: photo.url,
              caption: photo.caption || "",
            })
          ),
        },
      };
    });

    // Return with appropriate caching headers
    return NextResponse.json(
      {
        data: transformedData,
        meta: {
          currentPage: current_page,
          lastPage: last_page,
          total,
          links,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=59",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("[Profile Check-ins API] Error:", error);

    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes("401")) {
        return NextResponse.json(
          { message: "Please log in to view your check-ins" },
          { status: 401 }
        );
      }
      if (error.message.includes("404")) {
        return NextResponse.json(
          { message: "Profile check-ins not found" },
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
        message: "Failed to fetch profile check-ins",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
