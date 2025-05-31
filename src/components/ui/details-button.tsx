import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";

type ButtonProps = ComponentPropsWithoutRef<typeof Button>;

interface DetailsButtonProps extends ButtonProps {
  variant?: "default" | "outline";
}

export function DetailsButton({
  className,
  variant = "default",
  ...props
}: DetailsButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn(
        "border-accent-cyan/50 text-accent-cyan hover:bg-accent-cyan/10",
        variant === "default" &&
          "border-accent-cyan/50 text-accent-cyan hover:bg-accent-cyan/10",
        variant === "outline" &&
          "border-accent-cyan/30 text-accent-cyan/80 hover:bg-accent-cyan/5",
        className
      )}
      {...props}
    />
  );
}
