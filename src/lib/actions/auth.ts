"use server";

import { loginSchema } from "@/lib/validations/auth";
import { cookies } from "next/headers";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { revalidatePath } from "next/cache";

type LoginFormState = {
  errors?: {
    email?: string[];
    password?: string[];
    form?: string[];
  };
  message?: string | null;
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

    // Get the base URL from environment or use a default
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Use absolute URL for the API route
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedFields.data),
    });

    const data = await response.json();
    console.log("Login response:", {
      status: response.status,
      ok: response.ok,
      hasError: !!data.error,
      errorMessage: data.error,
    });

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    if (!data.token) {
      console.error("No token in response:", data);
      throw new Error("No token received");
    }

    // Store the token in an HTTP-only cookie
    const cookieStore = await cookies();
    const cookieOptions: ResponseCookie = {
      name: "auth_token",
      value: data.token,
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

    // Revalidate all paths to ensure auth state is updated everywhere
    revalidatePath("/", "layout");

    return {
      message: "Login successful",
    };
  } catch (error) {
    console.error("Login error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Invalid email or password";
    return {
      errors: {
        form: [errorMessage],
      },
      message: "Login failed",
    };
  }
}

export async function logout() {
  try {
    const cookieStore = await cookies();
    await cookieStore.delete("auth_token");

    // Revalidate all paths to ensure auth state is updated everywhere
    revalidatePath("/", "layout");

    return { message: "Logout successful" };
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error("Failed to logout");
  }
}
