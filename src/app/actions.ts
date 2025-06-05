"use server";

import { getAllConcerts } from "@/queries/concerts";
import { mapConcertFromApi } from "@/lib/mappers";
import { ConcertProperties } from "@/types/concert";

export async function fetchConcerts(): Promise<{
  concerts: ConcertProperties[];
  error: string | null;
}> {
  try {
    const response = await getAllConcerts();
    const mappedConcerts = response.concerts.map(mapConcertFromApi);
    return { concerts: mappedConcerts, error: null };
  } catch (err) {
    return {
      concerts: [],
      error: err instanceof Error ? err.message : "Failed to fetch concerts",
    };
  }
}
