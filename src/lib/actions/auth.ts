"use server";

import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

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
    // TODO: Implement actual login logic here using validatedFields.data.email and validatedFields.data.password
    // For now, just simulate a login
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // If login is successful, return success state
    return {
      message: "Login successful",
    };
  } catch {
    return {
      errors: {
        form: ["Invalid email or password"],
      },
      message: "Login failed",
    };
  }
}
