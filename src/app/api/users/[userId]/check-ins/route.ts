import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { makeAuthRequest } from "@/app/api/auth/make-auth-request";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");

  if (!authToken) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const { userId } = await params;
    const response = await makeAuthRequest(
      `/api/users/${userId}/check-ins`,
      "GET",
      {}
    );

    console.log("User check-ins API - Backend response:", response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("User check-ins API error:", error);
    const statusMatch =
      error instanceof Error ? error.message.match(/HTTP Error: (\d+)/) : null;
    const status = statusMatch ? parseInt(statusMatch[1]) : 500;
    const message =
      error instanceof Error ? error.message : "Failed to fetch user check-ins";
    return NextResponse.json({ message }, { status });
  }
}
