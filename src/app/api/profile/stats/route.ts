import { NextResponse } from "next/server";
import { ProfileStats } from "@/types/summary-stats";
import { cookies } from "next/headers";
import https from "https";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");

  if (!authToken) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const apiHost = process.env.NEXT_PUBLIC_API_HOST;
    if (!apiHost) {
      throw new Error("API host not configured");
    }

    const response = await new Promise<ProfileStats>((resolve, reject) => {
      const options = {
        hostname: apiHost,
        path: "/api/profile/stats",
        method: "GET",
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

      console.log("Making profile stats request to backend:", {
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
          console.log("Backend profile stats response:", {
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
        console.error("Profile stats request error:", error);
        reject(error);
      });

      req.end();
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching profile stats:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch profile stats",
      },
      { status: 500 }
    );
  }
}
