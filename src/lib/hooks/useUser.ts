"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  bio: string | null;
  email_verified_at: string | null;
  two_factor_confirmed_at: string | null;
  current_team_id: string | null;
  profile_photo_path: string | null;
  created_at: string;
  updated_at: string;
  city: string | null;
  country_id: string | null;
  profile_photo_url: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user", {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            setUser(null);
            setError(null);
            return;
          }
          const error = await response.json();
          throw new Error(error.message || "Failed to fetch user");
        }

        const data = await response.json();
        setUser(data.user);
        setError(null);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch user");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [pathname]); // Re-fetch when the route changes

  return { user, isLoading, error };
}
