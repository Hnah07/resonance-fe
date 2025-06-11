import { NextRequest, NextResponse } from "next/server";
import { makeAuthRequest } from "@/lib/api";

export const dynamic = "force-dynamic"; // Disable caching for this route

type LoginResponse = {
  message: string;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    role: string;
    is_active: boolean;
    bio: string | null;
    email_verified_at: string | null;
    two_factor_confirmed_at: string | null;
    current_team_id: string | null;
    profile_photo_path: string | null;
    created_at: string;
    updated_at: string;
    city: string | null;
    country_id: string | null;
    profile_photo_url: string;
  };
  token: string;
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

    // Make request to backend
    const apiHost = process.env.NEXT_PUBLIC_API_HOST;
    if (!apiHost) {
      throw new Error("API host not configured");
    }

    console.log("Making request to backend:", {
      hostname: apiHost,
      path: "/api/login",
    });

    // Log request body (excluding password)
    console.log("Sending request body:", {
      email: body.email,
      passwordLength: body.password?.length,
    });

    const response = await makeAuthRequest<typeof body, LoginResponse>(
      "/api/login",
      "POST",
      body
    );

    console.log("Backend response:", response);

    if (!response.token) {
      throw new Error("No token received from backend");
    }

    // Create the response with the user data
    const jsonResponse = NextResponse.json({
      message: response.message,
      user: response.user,
      token: response.token,
    });

    // Set the cookie in the response
    console.log("Setting auth token cookie in response headers");
    jsonResponse.cookies.set({
      name: "auth_token",
      value: response.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Log the cookie that was set
    const cookie = jsonResponse.cookies.get("auth_token");
    console.log("Cookie set in response:", {
      name: cookie?.name,
      value: cookie ? "[REDACTED]" : undefined,
      httpOnly: cookie?.httpOnly,
      secure: cookie?.secure,
      sameSite: cookie?.sameSite,
      path: cookie?.path,
      maxAge: cookie?.maxAge,
    });

    return jsonResponse;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      {
        status:
          error instanceof Error &&
          error.message === "No token received from backend"
            ? 401
            : 500,
      }
    );
  }
}
