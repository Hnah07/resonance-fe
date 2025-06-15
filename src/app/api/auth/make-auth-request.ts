import https from "https";
import { cookies } from "next/headers";

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    bio: string | null;
    email_verified_at: string | null;
    two_factor_confirmed_at: string | null;
    current_team_id: string | null;
    profile_photo_path: string | null;
    created_at: string;
    updated_at: string;
    city: string | null;
    country_id: string | null;
    profile_photo_url: string;
  };
  token: string;
}

export const makeAuthRequest = async <
  T extends Record<string, unknown>,
  R = AuthResponse
>(
  path: string,
  method: string,
  body: T
): Promise<R> => {
  // Get the auth token from cookies
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");

  if (!authToken) {
    console.error("No auth token available in cookies");
    throw new Error("No authentication token available");
  }

  const apiHost = process.env.NEXT_PUBLIC_API_HOST || "resonance-be.ddev.site";
  console.log("Making auth request with config:", {
    apiHost,
    path,
    method,
    hasAuthToken: !!authToken,
    tokenLength: authToken.value.length,
    environment: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: apiHost,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken.value}`,
      },
      rejectUnauthorized: false,
      agent: new https.Agent({
        rejectUnauthorized: false,
      }),
    };

    console.log("Making auth request to:", {
      fullUrl: `https://${options.hostname}${options.path}`,
      method: options.method,
      hasAuthHeader: !!options.headers.Authorization,
    });

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        console.log("Auth request response:", {
          status: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          data: data,
          url: res.url,
        });

        if (res.statusCode && res.statusCode >= 400) {
          const error = new Error(
            `HTTP Error: ${res.statusCode} ${res.statusMessage} - ${data}`
          );
          console.error("Auth request failed:", {
            error,
            status: res.statusCode,
            data,
            url: res.url,
          });
          reject(error);
          return;
        }

        // For DELETE operations, empty response is valid
        if (method === "DELETE" && (!data || data.trim() === "")) {
          resolve({ success: true } as R);
          return;
        }

        try {
          const parsedData = JSON.parse(data);
          console.log("Successfully parsed response data:", {
            hasData: !!parsedData,
            dataType: typeof parsedData,
            keys: Object.keys(parsedData),
          });
          resolve(parsedData);
        } catch (error) {
          console.error("Failed to parse response:", {
            error,
            data,
            url: res.url,
          });
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on("error", (error) => {
      console.error("Auth request error:", {
        error,
        message: error.message,
        hostname: options.hostname,
        path: options.path,
      });
      reject(error);
    });

    if (method !== "GET") {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};
