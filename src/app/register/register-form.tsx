"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FormInput } from "@/components/ui/form-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { register, type RegisterFormState } from "@/lib/actions/auth";
import { toast } from "sonner";

const initialState: RegisterFormState = {
  message: null,
  errors: undefined,
};

const RegisterForm = () => {
  const router = useRouter();
  const [state, formAction] = useActionState(register, initialState);
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (state.message === "Registration successful") {
      toast.success("Successfully created account");
      router.push("/discover");
    } else if (
      state.message === "Registration failed" ||
      state.message === "Validation failed"
    ) {
      toast.error(state.errors?.form || "Failed to create account");
    }
  }, [state.message, state.errors, router]);

  const handleSubmit = async (formData: FormData) => {
    // Log form data before submission
    console.log("Form data before submission:", {
      name: formData.get("name"),
      email: formData.get("email"),
      username: formData.get("username"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    // Update form values before submission
    const newValues = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    console.log("Setting new form values:", newValues);
    setFormValues(newValues);

    return formAction(formData);
  };

  return (
    <form className="space-y-6" action={handleSubmit}>
      <div className="space-y-4">
        <FormInput
          id="name"
          name="name"
          type="text"
          label="Full name"
          autoComplete="name"
          placeholder="Enter your full name"
          error={state.errors?.name}
          value={formValues.name}
          onChange={(e) =>
            setFormValues((prev) => ({ ...prev, name: e.target.value }))
          }
        />
        <FormInput
          id="email"
          name="email"
          type="email"
          label="Email address"
          autoComplete="email"
          placeholder="Enter your email"
          error={state.errors?.email}
          value={formValues.email}
          onChange={(e) =>
            setFormValues((prev) => ({ ...prev, email: e.target.value }))
          }
        />
        <FormInput
          id="username"
          name="username"
          type="text"
          label="Username"
          autoComplete="username"
          placeholder="Enter your username"
          error={state.errors?.username}
          value={formValues.username}
          onChange={(e) =>
            setFormValues((prev) => ({ ...prev, username: e.target.value }))
          }
        />
        <FormInput
          id="password"
          name="password"
          type="password"
          label="Password"
          autoComplete="new-password"
          placeholder="Enter your password"
          error={state.errors?.password}
          value={formValues.password}
          onChange={(e) =>
            setFormValues((prev) => ({ ...prev, password: e.target.value }))
          }
        />
        <FormInput
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Confirm your password"
          error={state.errors?.confirmPassword}
          value={formValues.confirmPassword}
          onChange={(e) =>
            setFormValues((prev) => ({
              ...prev,
              confirmPassword: e.target.value,
            }))
          }
        />
      </div>

      {state.errors?.form && (
        <div className="text-[#FF0086] text-sm text-center">
          {state.errors.form}
        </div>
      )}

      <div>
        <SubmitButton
          label="Create account"
          pendingLabel="Creating account..."
        />
      </div>

      <div className="text-sm text-center">
        <Link
          href="/login"
          className="font-medium text-[#FF0086] hover:text-[#03D1FE] transition-colors"
        >
          Already have an account? Sign in
        </Link>
      </div>
    </form>
  );
};

export default RegisterForm;
