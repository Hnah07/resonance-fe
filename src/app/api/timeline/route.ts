import { NextRequest, NextResponse } from "next/server";
import { makeAuthRequest } from "../auth/make-auth-request";

// Configure caching
export const dynamic = "force-dynamic";
export const revalidate = 30; // Cache for 30 seconds

interface TimelineResponse {
  data: Array<{
    id: string;
    user: {
      id: string;
      name: string | null;
      username: string;
      profile_photo_url: string;
    };
    concert: {
      id: string;
      event: {
        id: string;
        name: string;
        type: string;
        image_url: string;
      };
      location: {
        id: string;
        name: string;
        city: string;
        country: string;
      };
      date: string;
      artists: Array<{
        id: string;
        name: string;
        image_url: string;
        genres: Array<{
          id: string;
          name: string;
        }>;
      }>;
    };
    photos: Array<{
      id: string;
      url: string;
      caption: string | null;
    }>;
    likes_count: number;
    comments_count: number;
    is_liked: boolean;
    rating: number | null;
    review: string | null;
    created_at: string;
    updated_at: string;
    comments: Array<{
      id: string;
      comment: string;
      created_at: string;
      user: {
        id: string;
        name: string;
        username: string;
        profile_photo_url: string;
      };
    }>;
  }>;
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";

    console.log("Timeline API called with page:", page);
    console.log("API Host:", process.env.NEXT_PUBLIC_API_HOST);

    const response = await makeAuthRequest<
      Record<string, never>,
      TimelineResponse
    >(`/api/timeline?page=${page}`, "GET", {});

    console.log("Backend timeline response status:", {
      hasData: !!response.data,
      dataLength: response.data?.length,
      firstItem: response.data?.[0]
        ? {
            id: response.data[0].id,
            user: response.data[0].user.username,
            event: response.data[0].concert.event.name,
          }
        : null,
    });

    if (!response.data || response.data.length === 0) {
      console.log("No check-ins found in response");
    }

    // Transform the response to match the frontend's expected format
    const transformedData = {
      checkIns: response.data.map((item) => {
        console.log("Processing check-in:", {
          id: item.id,
          artists: item.concert.artists,
          comments: item.comments,
        });
        return {
          id: item.id,
          user: {
            id: item.user.id,
            name: item.user.name,
            username: item.user.username,
            image: item.user.profile_photo_url,
          },
          concert: {
            id: item.concert.id,
            event: item.concert.event.name,
            location: {
              id: item.concert.location.id,
              name: item.concert.location.name,
            },
            city: item.concert.location.city,
            image: item.concert.event.image_url,
            date: item.concert.date,
            rating: item.rating || 0,
            artists: item.concert.artists.map((artist) => artist.name),
            genres: Array.from(
              new Set(
                item.concert.artists.flatMap((artist) =>
                  artist.genres.map((genre) => genre.name)
                )
              )
            ),
          },
          checkIn: {
            id: item.id,
            date: item.created_at,
            time: new Date(item.created_at).toLocaleTimeString(),
            comment: item.review || "",
            likes: item.likes_count,
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
      }),
    };

    console.log(
      "Transformed data:",
      JSON.stringify(transformedData.checkIns[0], null, 2)
    );

    return NextResponse.json(transformedData, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=59",
      },
    });
  } catch (error) {
    console.error("Timeline API error:", error);
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
      { message: "Failed to fetch timeline" },
      { status: 500 }
    );
  }
}
