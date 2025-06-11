"use client";

import { useFormStatus } from "react-dom";
import { GradientButton } from "./gradient-button";

interface SubmitButtonProps {
  label: string;
  pendingLabel?: string;
  className?: string;
}

export function SubmitButton({
  label,
  pendingLabel = "Loading...",
  className = "w-full",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <GradientButton type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : label}
    </GradientButton>
  );
}
