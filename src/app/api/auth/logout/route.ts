import { NextResponse } from "next/server";
import https from "https";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");

  console.log("Logout API - Cookie state:", {
    hasCookie: !!authToken,
    cookieName: authToken?.name,
    cookieValue: authToken ? "[REDACTED]" : undefined,
  });

  if (!authToken) {
    console.log("Logout API - No auth token found in cookies");
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const apiHost = process.env.NEXT_PUBLIC_API_HOST;
    if (!apiHost) {
      console.error("NEXT_PUBLIC_API_HOST is not defined");
      return NextResponse.json(
        { message: "Configuration error" },
        { status: 500 }
      );
    }

    console.log("Logout API - Making request to backend with token");

    // Make request to backend API first
    const response = await new Promise((resolve, reject) => {
      const options = {
        hostname: apiHost,
        path: "/api/logout",
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

      console.log("Logout API - Backend request options:", {
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
          console.log("Logout API - Backend response:", {
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
            const parsedData = JSON.parse(data);
            resolve(parsedData);
          } catch (error) {
            console.error("Failed to parse response:", error);
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      });

      req.on("error", (error) => {
        console.error("Logout API - Request error:", error);
        reject(error);
      });

      req.end();
    });

    console.log("Logout API - Backend logout successful, deleting cookie");
    // Only delete the cookie after successful backend logout
    await cookieStore.delete("auth_token");

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Logout API - Error:", error);
    // Don't delete the cookie if backend logout failed
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }
    return NextResponse.json(
      { message: "Failed to logout" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
