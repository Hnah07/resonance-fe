"use client";

import { LuUsers } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface InterestedCounterProps {
  count: number;
  className?: string;
}

export function InterestedCounter({
  count,
  className,
}: InterestedCounterProps) {
  return (
    <div
      className={cn(
        "flex items-center space-x-2 text-foreground text-sm",
        className
      )}
    >
      <LuUsers className="w-4 h-4" />
      <span>{count} interested</span>
    </div>
  );
}
