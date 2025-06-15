import { NextRequest, NextResponse } from "next/server";
import { makeAuthRequest } from "../auth/make-auth-request";
import { cookies } from "next/headers";

// Configure caching
export const dynamic = "force-dynamic";
export const revalidate = 30; // Cache for 30 seconds

interface TimelineResponse {
  id: string;
  user: {
    id: string;
    name: string;
    profile_photo_url: string;
  };
  concert: {
    id: string;
    date: string;
    event: {
      id: string;
      name: string;
    };
    location?: {
      id: string;
      name: string;
      city: string;
    };
    artists: Array<{
      id: string;
      name: string;
      pivot?: {
        checkin_id: string;
        artist_id: string;
      };
    }>;
  };
  created_at: string;
  photos: Array<{
    id: string;
    url: string;
  }>;
  likes: Array<{
    id: string;
    user_id: string;
  }>;
  comments: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      profile_photo_url: string;
    };
    comment: string;
    created_at: string;
  }>;
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

    console.log("[Timeline API] Request received:", {
      page,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
    });

    console.log("[Timeline API] Environment:", {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_API_HOST: process.env.NEXT_PUBLIC_API_HOST,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
    });

    // Get the auth token from cookies for logging
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token");
    console.log("[Timeline API] Auth token state:", {
      hasToken: !!authToken,
      tokenLength: authToken?.value.length,
    });

    console.log("[Timeline API] Making request to backend:", {
      path: `/api/checkins?page=${page}`,
      method: "GET",
    });

    const response = await makeAuthRequest<
      Record<string, never>,
      PaginatedResponse<TimelineResponse>
    >(`/api/checkins?page=${page}`, "GET", {});

    if (!response || !response.data) {
      console.log("[Timeline API] No response data received");
      return NextResponse.json({ data: [] });
    }

    const { data: checkIns, current_page, last_page, total, links } = response;

    // Log the raw response data for debugging
    console.log("[Timeline API] Raw response data:", {
      firstCheckIn: checkIns?.[0] ? JSON.stringify(checkIns[0], null, 2) : null,
    });

    console.log("[Timeline API] Backend response received:", {
      hasData: !!checkIns,
      dataLength: checkIns?.length,
      firstItem: checkIns?.[0]
        ? {
            id: checkIns[0].id,
            hasUser: !!checkIns[0].user,
            hasConcert: !!checkIns[0].concert,
            hasEvent: !!checkIns[0].concert?.event,
            user: checkIns[0].user
              ? {
                  id: checkIns[0].user.id,
                  username: checkIns[0].user.name,
                }
              : null,
            event: checkIns[0].concert?.event?.name,
          }
        : null,
      meta: {
        currentPage: current_page,
        lastPage: last_page,
        total,
      },
      links,
    });

    if (!checkIns || checkIns.length === 0) {
      console.log("[Timeline API] No check-ins found in response");
      return NextResponse.json({ data: [] });
    }

    // Transform the response to match the frontend's expected format
    const transformedData = checkIns
      .filter((item): item is TimelineResponse => {
        // Validate that the item has all required data
        const isValid = !!(
          item &&
          item.id &&
          item.user &&
          item.user.id &&
          item.user.name &&
          item.concert &&
          item.concert.id &&
          item.concert.event &&
          item.concert.event.name &&
          item.concert.date
        );

        if (!isValid) {
          console.error("[Timeline API] Invalid check-in data:", {
            id: item?.id,
            hasUser: !!item?.user,
            hasConcert: !!item?.concert,
            hasEvent: !!item?.concert?.event,
            raw: JSON.stringify(item, null, 2),
          });
        }

        return isValid;
      })
      .map((item) => {
        console.log("[Timeline API] Processing valid check-in:", {
          id: item.id,
          user: item.user.name,
          event: item.concert.event.name,
          hasComments: item.comments?.length > 0,
          hasPhotos: item.photos?.length > 0,
          artists: item.concert.artists.map((a) => ({
            id: a.id,
            name: a.name,
            isCheckedIn: !!a.pivot,
          })),
        });

        // Filter artists to only include those that were checked in
        const checkedInArtists = item.concert.artists
          .filter((artist) => artist.pivot?.checkin_id === item.id)
          .map((artist) => artist.name);

        return {
          id: item.id,
          user: {
            id: item.user.id,
            name: item.user.name,
            username: item.user.name,
            image:
              item.user.profile_photo_url || "/placeholder-avatar-user.jpg",
          },
          concert: {
            id: item.concert.id,
            event: item.concert.event.name,
            location: {
              id: item.concert.location?.id || "default",
              name: item.concert.location?.name || "Unknown Venue",
            },
            city: item.concert.location?.city || "Unknown City",
            date: item.concert.date,
            rating: 0,
            artists: checkedInArtists,
            genres: [],
          },
          checkIn: {
            id: item.id,
            date: item.created_at,
            time: new Date(item.created_at).toLocaleTimeString(),
            comment: "", // Since backend doesn't provide review
            likes: item.likes?.length || 0,
            isLiked:
              item.likes?.some((like) => like.user_id === item.user.id) ||
              false,
            comments: item.comments.map((comment) => ({
              id: comment.id,
              user: {
                id: comment.user.id,
                name: comment.user.name,
                image: comment.user.profile_photo_url,
              },
              text: comment.comment,
              date: comment.created_at,
              time: new Date(comment.created_at).toLocaleTimeString(),
            })),
          },
        };
      });

    console.log("[Timeline API] Sending transformed response:", {
      checkInsCount: transformedData.length,
      firstCheckIn: transformedData[0]
        ? {
            id: transformedData[0].id,
            user: transformedData[0].user.username,
            event: transformedData[0].concert.event,
          }
        : null,
    });

    return NextResponse.json(
      { data: transformedData },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=59",
        },
      }
    );
  } catch (error) {
    console.error("[Timeline API] Error:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof Error && error.message.includes("404")) {
      return NextResponse.json(
        {
          message:
            "Timeline feature is not available yet. Please check back later.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Failed to fetch timeline",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
