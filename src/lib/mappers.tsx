import { ApiConcert, ConcertProperties } from "@/types/concert";

export const mapConcertFromApi = (c: ApiConcert): ConcertProperties => {
  return {
    id: c.id,
    event: c.event,
    location: c.location,
    city: c.city,
    country: c.country,
    date: c.date,
    image: c.image || "",
    artists: c.artists || [],
    genres: c.genres || [],
  };
};
