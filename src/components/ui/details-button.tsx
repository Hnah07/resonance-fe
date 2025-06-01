"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";

type ButtonProps = ComponentPropsWithoutRef<typeof Button>;

interface DetailsButtonProps extends ButtonProps {
  variant?: "default" | "outline";
  isActive?: boolean;
}

export function DetailsButton({
  className,
  variant = "default",
  isActive = false,
  ...props
}: DetailsButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn(
        "relative transition-all duration-200",
        isActive
          ? "bg-gradient-to-r from-accent-pink to-accent-cyan text-white border-transparent hover:opacity-90"
          : "border-accent-cyan/50 text-accent-cyan hover:bg-accent-cyan/10",
        variant === "outline" &&
          !isActive &&
          "border-accent-cyan/30 text-accent-cyan/80 hover:bg-accent-cyan/5",
        className
      )}
      {...props}
    />
  );
}
