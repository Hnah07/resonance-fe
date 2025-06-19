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

  const apiHost = process.env.NEXT_PUBLIC_API_HOST;
  if (!apiHost) {
    return NextResponse.json(
      { error: "API host not configured" },
      { status: 500 }
    );
  }

  try {
    // Construct the full URL to the backend image
    const fullUrl = `https://${apiHost}${imagePath}`;

    console.log("Fetching image from:", fullUrl);

    // Use fetch to get the image from the backend
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Resonance App Image Proxy",
      },
    });

    console.log("Backend response:", {
      status: response.status,
      ok: response.ok,
      contentType: response.headers.get("content-type"),
    });

    if (!response.ok) {
      console.error(
        "Backend returned error:",
        response.status,
        response.statusText
      );
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: response.status }
      );
    }

    // Get the image data
    const imageData = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    console.log("Successfully fetched image:", {
      size: imageData.byteLength,
      contentType,
    });

    // Return the image with appropriate headers
    return new NextResponse(imageData, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    return NextResponse.json(
      { error: "Failed to proxy image" },
      { status: 500 }
    );
  }
}
