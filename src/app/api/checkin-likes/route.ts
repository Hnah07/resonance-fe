import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import https from "https";

export const dynamic = "force-dynamic";

interface CheckinLike {
  id: string;
  checkin_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

async function makeLikeRequest(
  method: "POST" | "DELETE",
  checkinId: string,
  authToken: { value: string }
) {
  const apiHost = process.env.NEXT_PUBLIC_API_HOST;
  if (!apiHost) {
    throw new Error("API host not configured");
  }

  // For DELETE, we need to get the like ID first
  let likeId: string | undefined;
  if (method === "DELETE") {
    // First, get the like ID for this check-in
    await new Promise((resolve, reject) => {
      const options = {
        hostname: apiHost,
        path: `/api/checkin-likes?checkin_id=${checkinId}`,
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${authToken.value}`,
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
          console.log("GET like response:", {
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
            const response = JSON.parse(data);
            console.log("Parsed GET like response:", response);

            // The backend returns an array of likes directly
            if (Array.isArray(response)) {
              const like = response.find(
                (l: CheckinLike) => l.checkin_id === checkinId
              );
              if (like) {
                likeId = like.id;
                resolve(response);
              } else {
                reject(new Error("Like not found for this check-in"));
              }
            } else if (response.data && Array.isArray(response.data)) {
              // Fallback for if the backend ever wraps the array in a data property
              const like = response.data.find(
                (l: CheckinLike) => l.checkin_id === checkinId
              );
              if (like) {
                likeId = like.id;
                resolve(response);
              } else {
                reject(new Error("Like not found for this check-in"));
              }
            } else {
              reject(new Error("Invalid response format from backend"));
            }
          } catch (error) {
            console.error("Error parsing GET like response:", error);
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      req.end();
    });

    if (!likeId) {
      throw new Error("Could not find like ID for this check-in");
    }
  }

  return new Promise((resolve, reject) => {
    const options = {
      hostname: apiHost,
      path:
        method === "DELETE"
          ? `/api/checkin-likes/${likeId}`
          : "/api/checkin-likes",
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

    console.log(`Making ${method.toLowerCase()} like request to backend:`, {
      hostname: options.hostname,
      path: options.path,
      hasAuthHeader: !!options.headers.Authorization,
      body:
        method === "POST"
          ? {
              checkin_id: checkinId,
            }
          : undefined,
    });

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        console.log(`Backend ${method.toLowerCase()} like response:`, {
          status: res.statusCode,
          data: data,
        });

        if (res.statusCode && res.statusCode >= 400) {
          // Try to parse the error message from the backend
          try {
            const errorData = JSON.parse(data);
            reject(
              new Error(
                `HTTP Error: ${res.statusCode} ${
                  res.statusMessage
                } - ${JSON.stringify(errorData)}`
              )
            );
          } catch {
            // If we can't parse the error message, just use the raw data
            reject(
              new Error(
                `HTTP Error: ${res.statusCode} ${res.statusMessage} - ${data}`
              )
            );
          }
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
      console.error(`${method} like request error:`, error);
      reject(error);
    });

    if (method === "POST") {
      req.write(JSON.stringify({ checkin_id: checkinId }));
    }
    req.end();
  });
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");

  if (!authToken) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const response = await makeLikeRequest("POST", body.checkin_id, authToken);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Like API error:", error);
    // Extract the status code from the error message if it exists
    const statusMatch =
      error instanceof Error ? error.message.match(/HTTP Error: (\d+)/) : null;
    const status = statusMatch ? parseInt(statusMatch[1]) : 500;
    const message =
      error instanceof Error ? error.message : "Like action failed";
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");

  if (!authToken) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const checkinId = searchParams.get("checkin_id");

    if (!checkinId) {
      return NextResponse.json(
        { message: "checkin_id is required" },
        { status: 400 }
      );
    }

    const response = await makeLikeRequest("DELETE", checkinId, authToken);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Unlike API error:", error);
    // Extract the status code from the error message if it exists
    const statusMatch =
      error instanceof Error ? error.message.match(/HTTP Error: (\d+)/) : null;
    const status = statusMatch ? parseInt(statusMatch[1]) : 500;
    const message =
      error instanceof Error ? error.message : "Unlike action failed";
    return NextResponse.json({ message }, { status });
  }
}
