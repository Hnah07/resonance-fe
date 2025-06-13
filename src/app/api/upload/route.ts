import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import https from "https";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");

  if (!authToken) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file || !type) {
      return NextResponse.json(
        { message: "File and type are required" },
        { status: 400 }
      );
    }

    const apiHost = process.env.NEXT_PUBLIC_API_HOST;
    if (!apiHost) {
      throw new Error("API host not configured");
    }

    // Convert File to Buffer for the backend request
    const buffer = Buffer.from(await file.arrayBuffer());

    const response = await new Promise((resolve, reject) => {
      // Create boundary for multipart form data
      const boundary =
        "----WebKitFormBoundary" + Math.random().toString(36).substring(2);

      // Create multipart form data manually
      const formDataBuffer = Buffer.concat([
        Buffer.from(`--${boundary}\r\n`),
        Buffer.from(
          `Content-Disposition: form-data; name="file"; filename="${file.name}"\r\n`
        ),
        Buffer.from(`Content-Type: ${file.type}\r\n\r\n`),
        buffer,
        Buffer.from(`\r\n--${boundary}\r\n`),
        Buffer.from(`Content-Disposition: form-data; name="type"\r\n\r\n`),
        Buffer.from(type),
        Buffer.from(`\r\n--${boundary}--\r\n`),
      ]);

      const options = {
        hostname: apiHost,
        path: "/api/upload",
        method: "POST",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
          "Content-Length": formDataBuffer.length.toString(),
          Authorization: `Bearer ${authToken.value}`,
        },
        rejectUnauthorized: false,
        agent: new https.Agent({
          rejectUnauthorized: false,
        }),
      };

      console.log("Making file upload request to backend:", {
        hostname: options.hostname,
        path: options.path,
        hasAuthHeader: !!options.headers.Authorization,
        fileName: file.name,
        fileType: file.type,
        type: type,
        contentLength: formDataBuffer.length,
      });

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          console.log("Backend upload response:", {
            status: res.statusCode,
            data: data,
          });

          if (res.statusCode && res.statusCode >= 400) {
            reject(
              new Error(
                `HTTP Error: ${res.statusCode} ${res.statusMessage} - ${data}`
              )
            );
            return;
          }
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      });

      req.on("error", (error) => {
        console.error("Upload request error:", error);
        reject(error);
      });

      // Write the form data to the request
      req.write(formDataBuffer);
      req.end();
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "File upload failed",
      },
      { status: 500 }
    );
  }
}
