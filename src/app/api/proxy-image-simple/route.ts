import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("=== SIMPLE PROXY IMAGE ROUTE CALLED ===");
  console.log("Request URL:", request.url);

  const { searchParams } = new URL(request.url);
  const imagePath = searchParams.get("path");

  console.log("Image path from query:", imagePath);

  if (!imagePath) {
    return NextResponse.json(
      { error: "Image path is required" },
      { status: 400 }
    );
  }

  // For now, just return a test response to see if the route works
  return NextResponse.json({
    message: "Simple proxy route is working",
    imagePath,
    timestamp: new Date().toISOString(),
  });
}
