"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { FormInput } from "@/components/ui/form-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { login, type LoginFormState } from "@/lib/actions/auth";
import { toast } from "sonner";

const initialState: LoginFormState = {
  message: null,
  errors: undefined,
};

export function LoginForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(login, initialState);

  useEffect(() => {
    if (state.message === "Login successful") {
      // The cookie should be set by the browser from the API response
      // We don't need to handle it in the client
      toast.success("Successfully signed in");
      router.push("/discover");
    } else if (state.message === "Login failed") {
      toast.error(state.errors?.form?.[0] || "Failed to sign in");
    }
  }, [state.message, state.errors, router]);

  return (
    <form className="space-y-6" action={formAction}>
      <div className="space-y-4">
        <FormInput
          id="email"
          name="email"
          type="email"
          label="Email address"
          autoComplete="email"
          placeholder="Enter your email"
          error={state.errors?.email?.[0]}
        />
        <FormInput
          id="password"
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          error={state.errors?.password?.[0]}
        />
      </div>

      {state.errors?.form && (
        <div className="text-[#FF0086] text-sm text-center">
          {state.errors.form[0]}
        </div>
      )}

      <div>
        <SubmitButton label="Sign in" pendingLabel="Signing in..." />
      </div>

      <div className="text-sm text-center">
        <Link
          href="/register"
          className="font-medium text-[#FF0086] hover:text-[#03D1FE] transition-colors"
        >
          New user? Create an account
        </Link>
      </div>
    </form>
  );
}
