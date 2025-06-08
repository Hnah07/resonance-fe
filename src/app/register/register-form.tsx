import { FormInput } from "@/components/ui/form-input";
import { SubmitButton } from "@/components/ui/submit-button";
import Link from "next/link";

const RegisterForm = () => {
  return (
    <div className="space-y-6">
      <FormInput
        id="email"
        name="email"
        type="email"
        label="Email address"
        autoComplete="email"
        placeholder="Enter your email"
      />
      <FormInput
        id="username"
        name="username"
        type="text"
        label="Username"
        autoComplete="username"
        placeholder="Enter your username"
      />
      <FormInput
        id="password"
        name="password"
        type="password"
        label="Password"
        autoComplete="new-password"
        placeholder="Enter your password"
      />
      <FormInput
        id="confirm-password"
        name="confirm-password"
        type="password"
        label="Confirm password"
        autoComplete="new-password"
        placeholder="Confirm your password"
      />
      <SubmitButton label="Create account" pendingLabel="Creating account..." />
      <div className="text-sm text-center">
        <Link
          href="/login"
          className="font-medium text-[#FF0086] hover:text-[#03D1FE] transition-colors"
        >
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
};
export default RegisterForm;
