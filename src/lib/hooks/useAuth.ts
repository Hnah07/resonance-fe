"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if auth_token cookie exists
    const checkAuth = async () => {
      console.log("Checking authentication status...");
      try {
        const response = await fetch("/api/auth/check", {
          credentials: "include",
        });
        console.log("Auth check response status:", response.status);
        const isAuth = response.ok;
        console.log("Authentication status:", isAuth);
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
