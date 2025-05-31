import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";

type ButtonProps = ComponentPropsWithoutRef<typeof Button>;

interface GradientButtonProps extends ButtonProps {
  variant?: "default" | "outline";
}

export function GradientButton({
  className,
  variant = "default",
  ...props
}: GradientButtonProps) {
  return (
    <Button
      className={cn(
        "bg-gradient-to-r from-accent-pink/80 to-accent-cyan/80 hover:from-accent-pink/90 hover:to-accent-cyan/90 text-white",
        variant === "outline" &&
          "bg-none border border-accent-pink/30 hover:bg-accent-pink/10 text-accent-pink",
        className
      )}
      {...props}
    />
  );
}
