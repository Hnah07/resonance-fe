import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Disable caching for this route

export async function GET() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");

  if (!authToken) {
    return new NextResponse(null, {
      status: 401,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
