import https from "https";
import { cache } from "react";
import { cookies } from "next/headers";

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

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    bio: string | null;
    email_verified_at: string | null;
    two_factor_confirmed_at: string | null;
    current_team_id: string | null;
    profile_photo_path: string | null;
    created_at: string;
    updated_at: string;
    city: string | null;
    country_id: string | null;
    profile_photo_url: string;
  };
  token: string;
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
    // Try to get the auth token from cookies first
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    // If no auth token is found, use the API token
    const token = authToken || process.env.API_TOKEN?.trim();

    // Log token state
    console.log("Token state in makeRequest:", {
      hasAuthToken: !!authToken,
      authTokenLength: authToken?.length,
      hasApiToken: !!process.env.API_TOKEN,
      apiTokenLength: process.env.API_TOKEN?.length,
      finalTokenLength: token?.length,
      nodeEnv: process.env.NODE_ENV,
      apiHost: process.env.NEXT_PUBLIC_API_HOST,
    });

    if (!token) {
      console.error("No token available:", {
        hasAuthToken: !!authToken,
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

    // Only add Cookie header if we have an auth token
    if (authToken) {
      headers.Cookie = `auth_token=${authToken}`;
    }

    const hostname =
      process.env.NEXT_PUBLIC_API_HOST || "resonance-be.ddev.site";
    const url = `https://${hostname}${path}`;
    console.log("Making request to:", {
      url,
      headers: {
        ...headers,
        Authorization: headers.Authorization ? "Bearer [REDACTED]" : undefined,
        Cookie: headers.Cookie ? "[REDACTED]" : undefined,
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

export const makeAuthRequest = async <
  T extends Record<string, unknown>,
  R = AuthResponse
>(
  path: string,
  method: string,
  body: T
): Promise<R> => {
  // Get the auth token from cookies
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");

  if (!authToken) {
    throw new Error("No authentication token available");
  }

  return new Promise((resolve, reject) => {
    const options = {
      hostname: process.env.NEXT_PUBLIC_API_HOST || "resonance-be.ddev.site",
      path,
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken.value}`,
      },
      rejectUnauthorized: false,
      agent: new https.Agent({
        rejectUnauthorized: false,
      }),
    };

    console.log("Making auth request:", {
      hostname: options.hostname,
      path: options.path,
      method: options.method,
      hasAuthHeader: !!options.headers.Authorization,
    });

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        console.log("Auth request response:", {
          status: res.statusCode,
          data: data,
        });

        if (res.statusCode && res.statusCode >= 400) {
          reject(
            new Error(
              `HTTP Error: ${res.statusCode} ${res.statusMessage} - ${data}`
            )
          );
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on("error", (error) => {
      console.error("Auth request error:", error);
      reject(error);
    });

    req.write(JSON.stringify(body));
    req.end();
  });
};

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
    const error = await response.text();
    throw new Error(`Failed to create check-in: ${error}`);
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
    body: JSON.stringify({
      check_in_id: checkInId,
      artist_id: artistId,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create artist check-in: ${error}`);
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
  const hostname = process.env.NEXT_PUBLIC_API_HOST || "resonance-be.ddev.site";
  const url = `https://${hostname}/api/artists?search=${encodeURIComponent(
    searchTerm
  )}&per_page=10`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to search artists: ${error}`);
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

export const createRating = async (
  checkInId: string,
  rating: number
): Promise<void> => {
  const response = await fetch("/api/ratings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      check_in_id: checkInId,
      rating: rating,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create rating: ${error}`);
  }
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
    body: JSON.stringify({
      check_in_id: checkInId,
      photo_url: photoUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create photo: ${error}`);
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
  // Create form data
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", type); // Changed from 'type' to 'folder' to match our API route

  const response = await fetch("/api/upload", {
    method: "POST",
    headers: {
      // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
      Accept: "application/json",
    },
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload file: ${error}`);
  }

  return response.json();
};
