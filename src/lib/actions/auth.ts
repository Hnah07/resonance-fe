"use server";

import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { cookies } from "next/headers";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { revalidatePath } from "next/cache";

export type LoginFormState = {
  errors?: {
    email?: string[];
    password?: string[];
    form?: string[];
  };
  message?: string | null;
};

export type RegisterFormState = {
  message: string | null;
  errors?: {
    name?: string;
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
  };
};

// Types for backend responses
type BackendErrorResponse = {
  message: string;
  errors?: Record<string, string[]>;
};

type BackendSuccessResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
  };
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

export async function register(
  prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  // Validate the form data
  const validatedFields = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    // Convert Zod errors to our error format
    const formattedErrors = validatedFields.error.errors.reduce(
      (acc, error) => {
        const field = error.path[0] as string;
        acc[field] = error.message;
        return acc;
      },
      {} as Record<string, string>
    );

    return {
      errors: formattedErrors,
      message: "Validation failed",
    };
  }

  try {
    // Log form data for debugging
    console.log("Form data received:", validatedFields.data);

    // Get the frontend URL for API route
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      console.error("FRONTEND_URL is not defined");
      return {
        errors: {
          form: "Configuration error. Please contact support.",
        },
        message: "Registration failed",
      };
    }

    const apiUrl = `${frontendUrl}/api/auth/register`;
    console.log("Making request to:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: validatedFields.data.name,
        email: validatedFields.data.email,
        username: validatedFields.data.username,
        password: validatedFields.data.password,
        password_confirmation: validatedFields.data.confirmPassword,
      }),
    });

    const responseData = await response.json();
    console.log("Backend response:", responseData);

    // Handle validation errors (422)
    if (response.status === 422) {
      const errors = (responseData as BackendErrorResponse).errors || {};
      console.log("Validation errors:", errors);

      // Convert backend validation errors to our format
      const formattedErrors = Object.entries(errors).reduce(
        (acc, [key, value]) => {
          // Backend sends arrays of errors, we take the first one and ensure it's a string
          const errorMessage =
            Array.isArray(value) && value.length > 0
              ? String(value[0])
              : undefined;
          if (errorMessage) {
            acc[key] = errorMessage;
          }
          return acc;
        },
        {} as Record<string, string>
      );

      console.log("Formatted errors:", formattedErrors);

      return {
        errors: formattedErrors,
        message:
          (responseData as BackendErrorResponse).message || "Validation failed",
      };
    }

    // Handle server errors (500)
    if (response.status === 500) {
      const errorMessage =
        (responseData as BackendErrorResponse).message ||
        "Registration failed. Please try again.";

      return {
        errors: {
          form: errorMessage,
        },
        message: "Registration failed",
      };
    }

    // Handle successful registration (201)
    if (response.status === 201) {
      const successData = responseData as BackendSuccessResponse;
      if (successData.token) {
        // Store the token in an HTTP-only cookie
        const cookieStore = await cookies();
        const cookieOptions: ResponseCookie = {
          name: "auth_token",
          value: successData.token,
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
          message: "Registration successful",
          errors: undefined,
        };
      }
    }

    // Handle any other errors
    return {
      errors: {
        form:
          (responseData as BackendErrorResponse).message ||
          "Registration failed. Please try again.",
      },
      message: "Registration failed",
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      errors: {
        form: "Registration failed. Please try again.",
      },
      message: "Registration failed",
    };
  }
}

export async function logout() {
  try {
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      console.error("FRONTEND_URL is not defined");
      throw new Error("Configuration error");
    }

    // Debug: Check if we can access the cookie directly
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token");
    console.log("Logout - Cookie state before request:", {
      hasCookie: !!authToken,
      cookieName: authToken?.name,
      cookieValue: authToken ? "[REDACTED]" : undefined,
    });

    const response = await fetch(`${frontendUrl}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    console.log("Logout - Response status:", response.status);
    const data = await response.json();
    console.log("Logout - Response data:", data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to logout");
    }

    // Revalidate all paths to ensure auth state is updated everywhere
    revalidatePath("/", "layout");

    return { message: "Logout successful" };
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error("Failed to logout");
  }
}
