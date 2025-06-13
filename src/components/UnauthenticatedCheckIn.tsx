"use client";

import { LuLock } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function UnauthenticatedCheckIn() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <LuLock className="w-12 h-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">Sign in to check in</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Create an account or sign in to check in to concerts and share your
        experiences.
      </p>
      <Link href="/login">
        <Button>Sign In</Button>
      </Link>
    </div>
  );
}
