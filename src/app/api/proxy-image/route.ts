import { NextRequest, NextResponse } from "next/server";
import https from "https";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imagePath = searchParams.get("path");

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

    console.log("Proxying image request:", {
      originalPath: imagePath,
      fullUrl,
      apiHost,
    });

    // Use https.request instead of fetch to handle SSL certificate issues
    const response = await new Promise<{
      statusCode: number;
      headers: Record<string, string | string[] | undefined>;
      data: Buffer;
    }>((resolve, reject) => {
      const options = {
        hostname: apiHost,
        path: imagePath,
        method: "GET",
        headers: {
          "User-Agent": "Resonance App Image Proxy",
        },
        rejectUnauthorized: false, // Disable SSL certificate verification for development
        agent: new https.Agent({
          rejectUnauthorized: false,
        }),
      };

      const req = https.request(options, (res) => {
        const chunks: Buffer[] = [];

        res.on("data", (chunk) => {
          chunks.push(chunk);
        });

        res.on("end", () => {
          const data = Buffer.concat(chunks);
          resolve({
            statusCode: res.statusCode || 500,
            headers: res.headers,
            data,
          });
        });
      });

      req.on("error", (error) => {
        console.error("Image proxy request error:", error);
        reject(error);
      });

      req.end();
    });

    if (response.statusCode >= 400) {
      console.error("Image proxy error:", {
        status: response.statusCode,
        url: fullUrl,
      });
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.statusCode}` },
        { status: response.statusCode }
      );
    }

    // Get the content type from headers and ensure it's a string
    const contentType = Array.isArray(response.headers["content-type"])
      ? response.headers["content-type"][0]
      : response.headers["content-type"] || "image/jpeg";

    // Generate ETag for better caching
    const etag = crypto.createHash("md5").update(response.data).digest("hex");

    // Check if client has the same version (304 Not Modified)
    const ifNoneMatch = request.headers.get("if-none-match");
    if (ifNoneMatch === `"${etag}"`) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: `"${etag}"`,
          "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
        },
      });
    }

    // Return the image with improved caching headers
    return new NextResponse(response.data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        ETag: `"${etag}"`,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        Vary: "Accept-Encoding",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy image" },
      { status: 500 }
    );
  }
}
