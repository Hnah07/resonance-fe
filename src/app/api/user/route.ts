import { NextResponse } from "next/server";
import { makeAuthRequest } from "../auth/make-auth-request";

export async function GET() {
  try {
    const response = await makeAuthRequest("/api/user", "GET", {});

    // The response is already the user data since makeAuthRequest handles the parsing
    return NextResponse.json({ user: response.user });
  } catch (error) {
    console.error("Error fetching user:", error);
    if (
      error instanceof Error &&
      error.message === "No authentication token available"
    ) {
      return new NextResponse(null, { status: 401 });
    }
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to fetch user",
      },
      { status: 500 }
    );
  }
}
