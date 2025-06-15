import { NextResponse } from "next/server";
import { makeAuthRequest } from "../auth/make-auth-request";

export async function GET() {
  try {
    console.log("User API: Fetching user data from backend...");
    const response = await makeAuthRequest("/api/user", "GET", {});

    console.log("User API: Backend response:", response);
    // Return the user data directly
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user:", error);
    if (
      error instanceof Error &&
      error.message === "No authentication token available"
    ) {
      console.log("User API: No auth token available");
      return new NextResponse(null, { status: 401 });
    }
    console.error("User API: Error details:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to fetch user",
      },
      { status: 500 }
    );
  }
}
