import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Disable caching for this route

export async function GET() {
  const cookieStore = await cookies();
  const authToken = await cookieStore.get("auth_token");

  console.log("Auth check - Cookie state:", {
    hasCookie: !!authToken,
    cookieName: authToken?.name,
    cookieValue: authToken ? "[REDACTED]" : undefined,
  });

  if (!authToken) {
    // Create a response that clears any existing cookie
    const res = new NextResponse(null, {
      status: 401,
      headers: {
        "Cache-Control": "no-store",
      },
    });

    // Clear the cookie
    res.cookies.set({
      name: "auth_token",
      value: "",
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res;
  }

  // Return 200 if we have a valid cookie
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
