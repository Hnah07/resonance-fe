import { NextResponse } from "next/server";
import https from "https";

interface Genre {
  id: string;
  genre: string;
}

interface PaginatedResponse {
  data: Genre[];
  meta: {
    current_page: number;
    last_page: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export async function GET(request: Request) {
  const token = process.env.API_TOKEN?.trim();
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get("genre");
  const all = searchParams.get("all") === "true";

  if (!token) {
    console.error("API token is missing in server-side route");
    return NextResponse.json(
      { error: "API token not configured" },
      { status: 500 }
    );
  }

  try {
    // Create a promise-based request function
    const makeRequest = (path: string): Promise<PaginatedResponse> => {
      return new Promise((resolve, reject) => {
        const options = {
          hostname:
            process.env.NEXT_PUBLIC_API_HOST || "resonance-be.ddev.site",
          path,
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          // Only ignore SSL certificate errors in development
          rejectUnauthorized: process.env.NODE_ENV !== "production",
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
              const jsonData = JSON.parse(data);
              resolve(jsonData);
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
    };

    if (all) {
      // Fetch all genres by making multiple requests if needed
      const allGenres: Genre[] = [];
      let currentPage = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const response = await makeRequest(`/api/genres?page=${currentPage}`);
        allGenres.push(...response.data);

        if (response.meta.current_page >= response.meta.last_page) {
          hasMorePages = false;
        } else {
          currentPage++;
        }
      }

      return NextResponse.json({ data: allGenres });
    }

    // Build the API path with query parameters for normal requests
    const apiPath = `/api/genres${genre ? `?genre=${genre}` : ""}`;

    // Fetch genre data
    const genreData = await makeRequest(apiPath);
    return NextResponse.json(genreData);
  } catch (error) {
    console.error("Server-side API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch genre" },
      { status: 500 }
    );
  }
}
