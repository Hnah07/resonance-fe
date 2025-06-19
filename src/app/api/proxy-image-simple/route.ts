import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imagePath = searchParams.get("path");

  if (!imagePath) {
    return NextResponse.json(
      { error: "Image path is required" },
      { status: 400 }
    );
  }

  const apiHost =
    process.env.NEXT_PUBLIC_API_HOST ||
    "resonance-app-cf7lh.ondigitalocean.app";

  try {
    // Ensure the path starts with a slash and handle different formats
    let normalizedPath = imagePath;

    // Remove leading slash if present
    if (normalizedPath.startsWith("/")) {
      normalizedPath = normalizedPath.substring(1);
    }

    // Handle different path formats
    if (normalizedPath.startsWith("storage/")) {
      // Already has storage prefix (e.g., checkin photos)
      normalizedPath = `/${normalizedPath}`;
    } else if (normalizedPath.startsWith("events/")) {
      // Database format: "events/filename.jpg" -> "/storage/events/filename.jpg"
      normalizedPath = `/storage/${normalizedPath}`;
    } else {
      // Fallback: assume it needs storage prefix
      normalizedPath = `/storage/${normalizedPath}`;
    }

    // Construct the full URL to the backend image
    const fullUrl = `https://${apiHost}${normalizedPath}`;

    // Use fetch to get the image from the backend
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Resonance App Image Proxy",
      },
    });

    if (!response.ok) {
      console.error(
        "Backend returned error:",
        response.status,
        response.statusText,
        "URL:",
        fullUrl
      );

      // Try to get the error text
      let errorText = "";
      try {
        errorText = await response.text();
      } catch {
        errorText = "Could not read error response";
      }

      return NextResponse.json(
        {
          error: `Failed to fetch image: ${response.status}`,
          details: errorText,
          url: fullUrl,
        },
        { status: response.status }
      );
    }

    // Get the image data
    const imageData = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

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
    console.error("Error fetching image:", {
      error: error instanceof Error ? error.message : "Unknown error",
      apiHost,
      imagePath,
    });
    return NextResponse.json(
      {
        error: "Failed to proxy image",
        details: error instanceof Error ? error.message : "Unknown error",
        apiHost,
        imagePath,
      },
      { status: 500 }
    );
  }
}
