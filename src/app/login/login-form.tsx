"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { FormInput } from "@/components/ui/form-input";
import { GradientButton } from "@/components/ui/gradient-button";
import { login } from "@/lib/actions/auth";

const initialState = {
  message: null,
  errors: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <GradientButton type="submit" disabled={pending} className="w-full">
      {pending ? "Signing in..." : "Sign in"}
    </GradientButton>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(login, initialState);

  useEffect(() => {
    if (state.message === "Login successful") {
      router.push("/discover");
    }
  }, [state.message, router]);

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
        <SubmitButton />
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
