import { ConcertResponse } from "@/types/concert";

export async function getAllConcerts(): Promise<ConcertResponse> {
  const res = await fetch(
    "https://resonance-app-cf7lh.ondigitalocean.app/api/concerts",
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch concerts: ${res.statusText}`);
  }

  const data = await res.json();
  return data as ConcertResponse;
}
