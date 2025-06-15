import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import https from "https";

export const dynamic = "force-dynamic";

interface CommentResponse {
  id: string;
  checkin_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

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

    const response = await new Promise<CommentResponse>((resolve, reject) => {
      const options = {
        hostname: apiHost,
        path: "/api/checkin-comments",
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

      console.log("Making comment request to backend:", {
        hostname: options.hostname,
        path: options.path,
        hasAuthHeader: !!options.headers.Authorization,
        body: {
          checkin_id: body.checkin_id,
          comment: body.comment,
        },
      });

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          console.log("Backend comment response:", {
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
        console.error("Comment request error:", error);
        reject(error);
      });

      req.write(JSON.stringify(body));
      req.end();
    });

    // After creating the comment, fetch it with user information
    const commentResponse = await new Promise<
      CommentResponse & { user: { id: string; name: string; username: string } }
    >((resolve, reject) => {
      const options = {
        hostname: apiHost,
        path: `/api/checkin-comments/${response.id}`,
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
        console.error("Comment fetch error:", error);
        reject(error);
      });

      req.end();
    });

    return NextResponse.json(commentResponse);
  } catch (error) {
    console.error("Comment API error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Comment creation failed",
      },
      { status: 500 }
    );
  }
}
