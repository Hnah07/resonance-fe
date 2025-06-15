import { cookies } from "next/headers";
import { PageHeader } from "@/components/PageHeader";
import { UnauthenticatedCheckIn } from "@/components/UnauthenticatedCheckIn";
import { TimelineContent } from "@/components/TimelineContent";
import { makeAuthRequest } from "../api/auth/make-auth-request";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  profile_photo_url: string;
}

interface BackendTimelineResponse {
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
        name: string;
        image_url: string | null;
      };
      location: {
        id: string;
        name: string;
        city: string;
      };
      date: string;
      artists: Array<{
        name: string;
        genres: Array<{
          name: string;
        }>;
      }>;
    };
    rating: number | null;
    review: string | null;
    likes_count: number;
    created_at: string;
    comments: Array<{
      id: string;
      comment: string;
      created_at: string;
      user: {
        id: string;
        name: string;
        profile_photo_url: string;
      };
    }>;
    is_liked: boolean;
  }>;
}

async function getInitialTimelineData() {
  try {
    // First verify authentication
    const authResponse = await makeAuthRequest<
      Record<string, never>,
      { user: User }
    >("/api/user", "GET", {});

    if (!authResponse.user) {
      console.log("No authenticated user found");
      return { checkIns: [] };
    }

    console.log(
      "Fetching timeline for authenticated user:",
      authResponse.user.username
    );

    const response = await makeAuthRequest<
      Record<string, never>,
      BackendTimelineResponse
    >("/api/timeline?page=1", "GET", {});

    console.log("Timeline response:", {
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

    // Transform the response to match the frontend's expected format
    return {
      checkIns: response.data.map((item) => ({
        id: item.id,
        user: {
          id: item.user.id,
          name: item.user.name || undefined,
          username: item.user.username,
          image: item.user.profile_photo_url || undefined,
        },
        concert: {
          id: item.concert.id,
          event: item.concert.event.name,
          location: {
            id: item.concert.location.id,
            name: item.concert.location.name,
          },
          city: item.concert.location.city,
          image: item.concert.event.image_url || "/placeholder-concert.jpg",
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
          isLiked: item.is_liked,
          comments: item.comments.map((comment) => ({
            id: comment.id,
            user: {
              id: comment.user.id,
              name: comment.user.name,
              image: comment.user.profile_photo_url || undefined,
            },
            text: comment.comment,
            date: comment.created_at,
            time: new Date(comment.created_at).toLocaleTimeString(),
          })),
        },
      })),
    };
  } catch (error) {
    console.error("Error fetching initial timeline data:", error);
    if (
      error instanceof Error &&
      error.message.includes("No authentication token available")
    ) {
      return { checkIns: [] };
    }
    throw error;
  }
}

export default async function TimelinePage() {
  // Get the auth token from cookies
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");
  const isAuthenticated = !!authToken;

  if (!isAuthenticated) {
    return (
      <>
        <PageHeader
          title="Timeline"
          subtitle="Resonate with your friends through check-ins"
        />
        <UnauthenticatedCheckIn />
      </>
    );
  }

  // Fetch initial data on the server
  const initialData = await getInitialTimelineData();

  return (
    <>
      <PageHeader
        title="Timeline"
        subtitle="Resonate with your friends through check-ins"
      />
      <TimelineContent initialData={initialData} />
    </>
  );
}
