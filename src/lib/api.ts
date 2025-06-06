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

// Cache the makeRequest function using React's cache
export const makeRequest = cache(
  async <T>(path: string): Promise<ApiResponse<T>> => {
    const token = process.env.API_TOKEN?.trim();
    if (!token) {
      throw new Error("API token not configured");
    }

    return new Promise((resolve, reject) => {
      const options = {
        hostname: process.env.NEXT_PUBLIC_API_HOST || "resonance-be.ddev.site",
        path,
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
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

      req.end();
    });
  }
);

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
