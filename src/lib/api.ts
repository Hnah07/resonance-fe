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

// Cache the makeRequest function using React's cache
export const makeRequest = cache(
  async <T>(path: string): Promise<ApiResponse<T>> => {
    // Try to get the auth token from cookies first
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    // If no auth token is found, use the API token
    const token = authToken || process.env.API_TOKEN?.trim();
    if (!token) {
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

    return new Promise((resolve, reject) => {
      const options = {
        hostname: process.env.NEXT_PUBLIC_API_HOST || "resonance-be.ddev.site",
        path,
        method: "GET",
        headers,
        rejectUnauthorized: false,
        agent: new https.Agent({
          rejectUnauthorized: false,
        }),
      };

      const req = https.request(options, (res) => {
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
            resolve(JSON.parse(data));
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
);

export const makeAuthRequest = async <
  T extends Record<string, unknown>,
  R = AuthResponse
>(
  path: string,
  method: string,
  body: T
): Promise<R> => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: process.env.NEXT_PUBLIC_API_HOST || "resonance-be.ddev.site",
      path,
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      rejectUnauthorized: false,
      agent: new https.Agent({
        rejectUnauthorized: false,
      }),
    };

    const req = https.request(options, (res) => {
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
          resolve(JSON.parse(data));
        } catch {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on("error", (error) => {
      console.error("Request error:", error);
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
    const response = await makeRequest<T>(`${path}?page=${currentPage}`);
    allItems.push(...response.data);

    if (response.meta.current_page >= response.meta.last_page) {
      hasMorePages = false;
    } else {
      currentPage++;
    }
  }

  return allItems;
});
