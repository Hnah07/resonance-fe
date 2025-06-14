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
    throw new Error("No authentication token available");
  }

  return new Promise((resolve, reject) => {
    const options = {
      hostname: process.env.NEXT_PUBLIC_API_HOST || "resonance-be.ddev.site",
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

    console.log("Making auth request:", {
      hostname: options.hostname,
      path: options.path,
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
      console.error("Auth request error:", error);
      reject(error);
    });

    req.write(JSON.stringify(body));
    req.end();
  });
};
