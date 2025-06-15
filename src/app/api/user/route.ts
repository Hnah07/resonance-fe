import { NextResponse } from "next/server";
import { makeAuthRequest } from "../auth/make-auth-request";
import type { User } from "@/lib/hooks/useUser";

export async function GET() {
  try {
    console.log("[User API] Fetching user data from backend...");
    const response = await makeAuthRequest<Record<string, never>, User>(
      "/api/user",
      "GET",
      {}
    );

    // Log the complete raw response
    console.log(
      "[User API] Complete backend response:",
      JSON.stringify(response, null, 2)
    );

    console.log("[User API] Backend response details:", {
      hasData: !!response,
      dataType: typeof response,
      keys: response ? Object.keys(response) : [],
      user: response
        ? {
            id: response.id,
            name: response.name,
            email: response.email,
            hasCountryId: !!response.country_id,
            countryId: response.country_id,
            countryName: response.country_name,
            city: response.city,
            completeUser: response,
          }
        : null,
    });

    // Return the user data directly
    return NextResponse.json(response);
  } catch (error) {
    console.error("[User API] Error details:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error,
    });

    if (error instanceof Error) {
      if (error.message === "No authentication token available") {
        console.log("[User API] No auth token available");
        return new NextResponse(null, { status: 401 });
      }
      if (error.message.includes("401")) {
        console.log("[User API] Authentication failed");
        return new NextResponse(null, { status: 401 });
      }
      if (error.message.includes("404")) {
        console.log("[User API] User not found");
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }
    }

    console.error("[User API] Unexpected error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to fetch user",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
