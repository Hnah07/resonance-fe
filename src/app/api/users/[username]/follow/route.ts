import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { makeAuthRequest } from "@/app/api/auth/make-auth-request";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");

  console.log("Follow API - Auth token exists:", !!authToken);

  if (!authToken) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const { username } = await params;
    console.log("Follow API - User ID:", username);
    console.log("Follow API - Making request to backend...");

    const response = await makeAuthRequest(
      `/api/users/${username}/follow`,
      "POST",
      {}
    );

    console.log("Follow API - Backend response:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Follow API error:", error);
    const statusMatch =
      error instanceof Error ? error.message.match(/HTTP Error: (\d+)/) : null;
    const status = statusMatch ? parseInt(statusMatch[1]) : 500;
    const message =
      error instanceof Error ? error.message : "Follow action failed";
    console.log("Follow API - Returning error:", { status, message });
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");

  console.log("Unfollow API - Auth token exists:", !!authToken);

  if (!authToken) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const { username } = await params;
    console.log("Unfollow API - User ID:", username);
    console.log("Unfollow API - Making request to backend...");

    const response = await makeAuthRequest(
      `/api/users/${username}/follow`,
      "DELETE",
      {}
    );

    console.log("Unfollow API - Backend response:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Unfollow API error:", error);
    const statusMatch =
      error instanceof Error ? error.message.match(/HTTP Error: (\d+)/) : null;
    const status = statusMatch ? parseInt(statusMatch[1]) : 500;
    const message =
      error instanceof Error ? error.message : "Unfollow action failed";
    console.log("Unfollow API - Returning error:", { status, message });
    return NextResponse.json({ message }, { status });
  }
}
