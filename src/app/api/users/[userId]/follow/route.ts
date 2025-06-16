import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { makeAuthRequest } from "@/app/api/auth/make-auth-request";

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");

  if (!authToken) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const response = await makeAuthRequest(
      `/api/users/${params.userId}/follow`,
      "POST",
      {}
    );
    return NextResponse.json(response);
  } catch (error) {
    console.error("Follow API error:", error);
    const statusMatch =
      error instanceof Error ? error.message.match(/HTTP Error: (\d+)/) : null;
    const status = statusMatch ? parseInt(statusMatch[1]) : 500;
    const message =
      error instanceof Error ? error.message : "Follow action failed";
    return NextResponse.json({ message }, { status });
  }
}
