import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import https from "https";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");

  console.log("Check-in API - Request headers:", {
    cookie: request.headers.get("cookie"),
    authorization: request.headers.get("authorization"),
    contentType: request.headers.get("content-type"),
  });

  console.log("Check-in API - Cookie state:", {
    hasCookie: !!authToken,
    cookieName: authToken?.name,
    cookieValue: authToken ? "[REDACTED]" : undefined,
  });

  if (!authToken) {
    console.log("Check-in API - No auth token found in cookies");
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("Check-in API - Request body:", {
      hasConcertId: !!body.concert_id,
      concertId: body.concert_id,
      bodyKeys: Object.keys(body),
      rawBody: body,
    });

    const apiHost = process.env.NEXT_PUBLIC_API_HOST;
    if (!apiHost) {
      throw new Error("API host not configured");
    }

    console.log("Check-in API - Token format:", {
      tokenLength: authToken.value.length,
      tokenPrefix: authToken.value.substring(0, 10) + "...",
      tokenFormat: authToken.value.includes("|")
        ? "contains separator"
        : "no separator",
      authHeaderFormat: `Bearer ${authToken.value.substring(0, 10)}...`,
    });

    const response = await new Promise((resolve, reject) => {
      const options = {
        hostname: apiHost,
        path: "/api/checkins",
        method: "POST",
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

      console.log("Making check-in request to backend:", {
        hostname: options.hostname,
        path: options.path,
        hasAuthHeader: !!options.headers.Authorization,
        requestBody: {
          hasConcertId: !!body.concert_id,
          concertId: body.concert_id,
          rawBody: body,
        },
        headers: {
          ...options.headers,
          Authorization: options.headers.Authorization
            ? "Bearer [REDACTED]"
            : undefined,
        },
      });

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          console.log("Backend check-in response:", {
            status: res.statusCode,
            statusMessage: res.statusMessage,
            headers: res.headers,
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
        console.error("Check-in request error:", error);
        reject(error);
      });

      const requestBody = JSON.stringify(body);
      console.log("Sending request body to backend:", requestBody);
      req.write(requestBody);
      req.end();
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Check-in API error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Check-in failed" },
      { status: 500 }
    );
  }
}
