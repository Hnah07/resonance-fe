"use server";

import { loginSchema } from "@/lib/validations/auth";
import { makeAuthRequest } from "@/lib/api";
import { cookies } from "next/headers";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

type LoginFormState = {
  errors?: {
    email?: string[];
    password?: string[];
    form?: string[];
  };
  message?: string | null;
};

type LoginCredentials = {
  email: string;
  password: string;
};

export async function login(
  prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid form data",
    };
  }

  try {
    console.log("Attempting login with:", {
      email: validatedFields.data.email,
    });
    const response = await makeAuthRequest<LoginCredentials>(
      "/api/login",
      "POST",
      validatedFields.data
    );
    console.log("Login response:", response);

    if (!response.token) {
      console.error("No token in response:", response);
      throw new Error("No token received");
    }

    // Store the token in an HTTP-only cookie
    const cookieStore = await cookies();
    const cookieOptions: ResponseCookie = {
      name: "auth_token",
      value: response.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    };
    console.log("Setting cookie with options:", {
      ...cookieOptions,
      value: "[REDACTED]",
    });

    await cookieStore.set(cookieOptions);

    // Verify cookie was set
    const cookie = await cookieStore.get("auth_token");
    console.log("Cookie after setting:", cookie ? "exists" : "not found");

    return {
      message: "Login successful",
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      errors: {
        form: ["Invalid email or password"],
      },
      message: "Login failed",
    };
  }
}

export async function logout() {
  try {
    const cookieStore = await cookies();
    await cookieStore.delete("auth_token");
    return { message: "Logout successful" };
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error("Failed to logout");
  }
}
