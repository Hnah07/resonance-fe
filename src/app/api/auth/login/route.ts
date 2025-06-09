import { NextRequest, NextResponse } from "next/server";
import https from "https";

export const dynamic = "force-dynamic"; // Disable caching for this route

type BackendResponse = {
  status: number;
  data: {
    token?: string;
    message?: string;
    errors?: Record<string, string[]>;
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Login request received:", { email: body.email });

    // Validate required fields
    if (!body.email || !body.password) {
      console.log("Missing required fields:", {
        hasEmail: !!body.email,
        hasPassword: !!body.password,
      });
      return NextResponse.json(
        { error: "Email and password are required" },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // Make request to backend API
    const response = await new Promise<BackendResponse>((resolve, reject) => {
      const options = {
        hostname: process.env.NEXT_PUBLIC_API_HOST || "resonance-be.ddev.site",
        path: "/api/login",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        rejectUnauthorized: false,
        agent: new https.Agent({
          rejectUnauthorized: false,
        }),
      };

      console.log("Making request to backend:", {
        hostname: options.hostname,
        path: options.path,
      });

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          console.log("Backend response status:", res.statusCode);
          console.log("Backend response data:", data);

          try {
            const parsedData = JSON.parse(data);

            // Handle validation errors (422) by passing them through
            if (res.statusCode === 422) {
              resolve({
                status: 422,
                data: parsedData,
              });
              return;
            }

            // Handle other error status codes
            if (res.statusCode && res.statusCode >= 400) {
              reject(
                new Error(
                  `HTTP Error: ${res.statusCode} ${res.statusMessage} - ${data}`
                )
              );
              return;
            }

            // Handle successful response
            resolve({
              status: res.statusCode || 200,
              data: parsedData,
            });
          } catch (error) {
            console.error("Failed to parse response:", error);
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      });

      req.on("error", (error) => {
        console.error("Request error:", error);
        reject(error);
      });

      const requestBody = JSON.stringify(body);
      console.log("Sending request body:", {
        email: body.email,
        passwordLength: body.password.length,
      });

      req.write(requestBody);
      req.end();
    });

    // Handle the response based on status code
    if (response.status === 422) {
      // Return validation errors with 422 status
      return NextResponse.json(response.data, {
        status: 422,
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    // Return successful response
    return NextResponse.json(response.data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Login proxy error:", error);
    // Return more specific error message if available
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }
    return NextResponse.json(
      { error: "Authentication failed" },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
