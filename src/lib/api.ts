import https from "https";
import { cache } from "react";

interface ApiResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    path: string;
    per_page: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

interface ApiResponseWithCache<T> extends ApiResponse<T> {
  _cache?: {
    revalidate?: number;
    tags?: string[];
  };
}

interface RequestOptions {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
}

// Cache the makeRequest function using React's cache
export const makeRequest = cache(
  async <T>(
    path: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> => {
    // Use API token for server-side requests
    const token = process.env.API_TOKEN?.trim();

    if (!token) {
      console.error("No API token available:", {
        hasApiToken: !!process.env.API_TOKEN,
        nodeEnv: process.env.NODE_ENV,
      });
      throw new Error("No authentication token available");
    }

    // Prepare headers
    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    const hostname =
      process.env.NEXT_PUBLIC_API_HOST || "resonance-be.ddev.site";
    const url = `https://${hostname}${path}`;
    console.log("Making request to:", {
      url,
      headers: {
        ...headers,
        Authorization: headers.Authorization ? "Bearer [REDACTED]" : undefined,
      },
    });

    // Always use https.request in server components for consistent behavior
    if (typeof window === "undefined") {
      return new Promise((resolve, reject) => {
        const requestOptions = {
          hostname,
          path,
          method: "GET",
          headers,
          rejectUnauthorized: false,
          agent: new https.Agent({
            rejectUnauthorized: false,
          }),
        };

        const req = https.request(requestOptions, (res) => {
          let data = "";
          res.on("data", (chunk) => {
            data += chunk;
          });
          res.on("end", () => {
            if (res.statusCode && res.statusCode >= 400) {
              reject(
                new Error(
                  `HTTP Error: ${res.statusCode} ${res.statusMessage} - ${data}`
                )
              );
              return;
            }
            try {
              const response = JSON.parse(data) as ApiResponseWithCache<T>;
              // If we have caching options, store them in the response
              if (options?.next) {
                response._cache = options.next;
              }
              resolve(response);
            } catch {
              reject(new Error(`Failed to parse response: ${data}`));
            }
          });
        });

        req.on("error", (error) => {
          console.error("Request error:", error);
          reject(error);
        });

        req.end();
      });
    }

    // Use fetch for client components
    const response = await fetch(url, {
      headers,
    });

    if (!response.ok) {
      throw new Error(
        `HTTP Error: ${response.status} ${
          response.statusText
        } - ${await response.text()}`
      );
    }

    return response.json();
  }
);

// Helper function to fetch all pages of data
export const fetchAllPages = cache(async <T>(path: string): Promise<T[]> => {
  const allItems: T[] = [];
  let currentPage = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    // Use makeRequest with caching options for each page
    const response = await makeRequest<T>(`${path}?page=${currentPage}`, {
      next: {
        revalidate: 60, // Cache for 60 seconds
        tags: ["pagination"], // Tag for manual revalidation
      },
    });
    allItems.push(...response.data);

    if (response.meta.current_page >= response.meta.last_page) {
      hasMorePages = false;
    } else {
      currentPage++;
    }
  }

  return allItems;
});

export interface CheckInResponse {
  id: string;
  concert_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ArtistCheckInResponse {
  id: string;
  checkin_id: string;
  artist_id: string;
  created_at: string;
  updated_at: string;
}

export const createCheckIn = async (
  concertId: string
): Promise<CheckInResponse> => {
  const response = await fetch("/api/checkins", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ concert_id: concertId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HTTP Error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return response.json();
};

export const createArtistCheckIn = async (
  checkInId: string,
  artistId: string
): Promise<void> => {
  const response = await fetch("/api/artist-checkins", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ checkin_id: checkInId, artist_id: artistId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HTTP Error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }
};

export interface Artist {
  id: string;
  name: string;
  image?: string;
  genres?: string[];
}

export interface ArtistSearchResponse {
  data: Artist[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CommentResponse {
  id: string;
  checkin_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface RatingResponse {
  id: string;
  checkin_id: string;
  user_id: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface PhotoResponse {
  id: string;
  checkin_id: string;
  user_id: string;
  url: string;
  caption?: string;
  created_at: string;
  updated_at: string;
}

export const searchArtists = async (
  searchTerm: string
): Promise<ArtistSearchResponse> => {
  const response = await fetch(
    `/api/artists/search?q=${encodeURIComponent(searchTerm)}`,
    {
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HTTP Error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return response.json();
};

export const createComment = async (
  checkInId: string,
  comment: string
): Promise<void> => {
  const response = await fetch(`/api/checkins/${checkInId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      comment: comment,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create comment: ${error}`);
  }
};

export interface CheckInReviewResponse {
  id: string;
  checkin_id: string;
  review: string;
  created_at: string;
  updated_at: string;
}

export const createCheckInReview = async (
  checkInId: string,
  review: string
): Promise<CheckInReviewResponse> => {
  const response = await fetch("/api/checkin-reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ checkin_id: checkInId, review }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HTTP Error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return response.json();
};

export const getCheckInReview = async (
  checkInId: string
): Promise<{ review: CheckInReviewResponse | null }> => {
  const response = await fetch(`/api/checkin-reviews?checkin_id=${checkInId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get check-in review: ${error}`);
  }

  return response.json();
};

export const createPhoto = async (
  checkInId: string,
  photoUrl: string
): Promise<void> => {
  const response = await fetch("/api/photos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ checkin_id: checkInId, url: photoUrl }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HTTP Error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }
};

export interface UploadResponse {
  url: string;
}

export type UploadType =
  | "profile-photos"
  | "artists"
  | "events"
  | "checkin-photos";

export const uploadFile = async (
  file: File,
  type: UploadType
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const response = await fetch("/api/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HTTP Error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return response.json();
};

// Client-side function for making authenticated requests
export const makeClientRequest = async <T>(
  path: string
): Promise<ApiResponse<T>> => {
  // Get the base URL based on the environment
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

  // Convert relative URL to absolute URL if needed
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`
    );
  }

  return response.json();
};
