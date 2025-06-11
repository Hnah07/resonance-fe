"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if auth_token cookie exists
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check", {
          credentials: "include",
        });
        const isAuth = response.ok;
        setIsAuthenticated(isAuth);
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [pathname]); // Recheck when the route changes

  return { isAuthenticated };
}
