import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import https from "https";

// Create a custom agent that doesn't verify certificates in development
const httpsAgent = new https.Agent({
  rejectUnauthorized: process.env.NODE_ENV === "production",
});

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");

  if (!authToken) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const apiHost = process.env.NEXT_PUBLIC_API_HOST;
    if (!apiHost) {
      throw new Error("API host not configured");
    }

    const response = await new Promise((resolve, reject) => {
      const options = {
        hostname: apiHost,
        path: "/api/checkin-reviews",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${authToken.value}`,
        },
        rejectUnauthorized: false,
        agent: httpsAgent,
      };

      console.log("Making check-in review request to backend:", {
        hostname: options.hostname,
        path: options.path,
        hasAuthHeader: !!options.headers.Authorization,
        body: {
          checkin_id: body.checkin_id,
          hasReview: !!body.review,
        },
      });

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          console.log("Backend check-in review response:", {
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
        console.error("Check-in review request error:", error);
        reject(error);
      });

      req.write(JSON.stringify(body));
      req.end();
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Check-in review API error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Check-in review creation failed",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    const apiHost = process.env.NEXT_PUBLIC_API_HOST;
    if (!apiHost) {
      throw new Error("API host not configured");
    }

    const response = await new Promise((resolve, reject) => {
      const options = {
        hostname: apiHost,
        path: `/api/checkin-reviews?checkin_id=${checkinId}`,
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${authToken.value}`,
        },
        rejectUnauthorized: false,
        agent: httpsAgent,
      };

      console.log("Making check-in review GET request to backend:", {
        hostname: options.hostname,
        path: options.path,
        hasAuthHeader: !!options.headers.Authorization,
      });

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          console.log("Backend check-in review GET response:", {
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
        console.error("Check-in review GET request error:", error);
        reject(error);
      });

      req.end();
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Check-in review GET API error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to get check-in review",
      },
      { status: 500 }
    );
  }
}
