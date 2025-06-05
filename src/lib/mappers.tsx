import { ApiConcert, ConcertProperties } from "@/types/concert";

export const mapConcertFromApi = (c: ApiConcert): ConcertProperties => {
  // If location is a string, we should have already fetched the full location details
  // in the API route, so this should never happen. But just in case:
  if (typeof c.location === "string") {
    console.warn(
      `Location for concert ${c.id} is a string instead of an object. This should not happen.`
    );
    return {
      id: c.id,
      event: c.event,
      location: {
        id: "",
        name: c.location,
        image: undefined,
      },
      city: "", // Since location is a string, we don't have city/country
      country: "",
      date: c.date,
      image: c.image || "",
      artists: [], // Return empty array if no artists
      genres: [], // Return empty array if no genres
    };
  }

  return {
    id: c.id,
    event: c.event,
    location: {
      id: c.location.id,
      name: c.location.name,
      image: c.location.image,
    },
    city: c.location.city,
    country: c.location.country,
    date: c.date,
    image: c.image || "",
    artists: c.artists || [],
    genres: c.genres || [],
  };
};
