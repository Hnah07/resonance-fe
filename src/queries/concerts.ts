import { ApiConcert } from "@/types/concert";

export async function getAllConcerts(): Promise<{ concerts: ApiConcert[] }> {
  try {
    const res = await fetch("/api/concerts", {
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
    return data as { concerts: ApiConcert[] };
  } catch (error) {
    console.error("Error fetching concerts:", error);
    throw new Error("Failed to fetch concerts") as Error;
  }
}
