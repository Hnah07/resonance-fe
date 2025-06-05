import { NextResponse } from "next/server";
import https from "https";

export async function GET(request: Request) {
  const token = process.env.API_TOKEN?.trim();
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");

  if (!token) {
    console.error("API token is missing in server-side route");
    return NextResponse.json(
      { error: "API token not configured" },
      { status: 500 }
    );
  }

  try {
    // Create a promise-based request function
    const makeRequest = (path: string) => {
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

    // Build the API path with query parameters
    const apiPath = `/api/locations${city ? `?city=${city}` : ""}`;

    // Fetch location data
    const locationData = await makeRequest(apiPath);
    return NextResponse.json(locationData);
  } catch (error) {
    console.error("Server-side API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch location" },
      { status: 500 }
    );
  }
}
