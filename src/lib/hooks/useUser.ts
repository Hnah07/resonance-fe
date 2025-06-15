"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./useAuth";
import { makeClientRequest } from "@/lib/api";

export interface User {
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
  country_name: string | null;
  profile_photo_url: string;
}

interface Country {
  id: string;
  name: string;
  code: string;
  official_name?: string;
  native_name?: string;
  continent?: string;
  subregion?: string;
  emoji?: string;
  latitude?: string;
  longitude?: string;
  created_at?: string;
  updated_at?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      // If not authenticated, don't try to fetch user data
      if (!isAuthenticated) {
        console.log("User not authenticated, skipping user data fetch");
        if (isMounted) {
          setUser(null);
          setError(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        console.log("Fetching user data...");
        const response = await fetch("/api/user", {
          credentials: "include",
          cache: "no-store", // Disable caching
        });

        console.log("User API response status:", response.status);
        if (!response.ok) {
          if (response.status === 401) {
            console.log("User not authenticated (401)");
            if (isMounted) {
              setUser(null);
              setError(null);
              setIsLoading(false);
            }
            return;
          }
          const error = await response.json();
          console.error("User API error:", error);
          throw new Error(error.message || "Failed to fetch user");
        }

        const data = await response.json();
        console.log(
          "[useUser] Raw user API response:",
          JSON.stringify(data, null, 2)
        );

        if (!data || Object.keys(data).length === 0) {
          console.error("[useUser] User API returned empty data");
          if (isMounted) {
            setError("Failed to fetch user data");
            setIsLoading(false);
          }
          return;
        }

        // If we have a country_id, fetch the country name
        if (data.country_id) {
          try {
            console.log(
              "[useUser] Fetching country data for ID:",
              data.country_id
            );
            const countryResponse = await makeClientRequest<
              PaginatedResponse<Country>
            >(`/api/countries?id=${data.country_id}`);
            console.log("[useUser] Country API response structure:", {
              hasData: !!countryResponse.data,
              isArray: Array.isArray(countryResponse.data),
              dataType: typeof countryResponse.data,
              dataKeys: countryResponse.data
                ? Object.keys(countryResponse.data)
                : [],
              rawResponse: JSON.stringify(countryResponse, null, 2),
            });
            // The country data is in the paginated response's data array
            const paginatedResponse = countryResponse.data?.[0];
            const country = paginatedResponse?.data?.[0];
            console.log("[useUser] Extracted country:", {
              hasCountry: !!country,
              countryType: typeof country,
              countryKeys: country ? Object.keys(country) : [],
              countryName: country?.name,
            });
            if (country?.name) {
              console.log("[useUser] Setting country name:", country.name);
              data.country_name = country.name;
            } else {
              console.log("[useUser] No country name found in response");
            }
          } catch (err) {
            console.error("[useUser] Error fetching country name:", err);
            // Don't fail the whole request if country fetch fails
            data.country_name = null;
          }
        } else {
          console.log("[useUser] No country_id available in user data:", {
            userId: data.id,
            hasCountryId: !!data.country_id,
            countryId: data.country_id,
          });
        }

        if (isMounted) {
          console.log("[useUser] Final user state:", {
            ...data,
            hasCountryId: !!data.country_id,
            hasCountryName: !!data.country_name,
            countryId: data.country_id,
            countryName: data.country_name,
          });
          setUser(data);
          setError(null);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to fetch user");
          setIsLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [pathname, isAuthenticated]);

  // Add debug logging for user state changes
  useEffect(() => {
    console.log("User state updated:", { user, isLoading, error });
  }, [user, isLoading, error]);

  return { user, isLoading, error };
}
