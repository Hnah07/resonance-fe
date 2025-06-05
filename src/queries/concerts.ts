import { ApiConcert } from "@/types/concert";

// Get the base URL for the current environment
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Browser should use relative path
    return "";
  }
  if (process.env.VERCEL_URL) {
    // Reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  }
  // Assume localhost
  return `http://localhost:${process.env.PORT || 3000}`;
};

export async function getAllConcerts(): Promise<{ concerts: ApiConcert[] }> {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/concerts`, {
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(
        `Failed to fetch concerts: ${res.status} ${res.statusText}${
          errorData ? ` - ${JSON.stringify(errorData)}` : ""
        }`
      );
    }

    const data = await res.json();
    return { concerts: data.concerts };
  } catch (error) {
    console.error("Error fetching concerts:", error);
    throw error;
  }
}
