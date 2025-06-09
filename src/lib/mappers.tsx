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

  // Map artists to strings by extracting their names and collect all genres
  const artistNames: string[] = [];
  const allGenres = new Set<string>();

  (c.artists || []).forEach((artist) => {
    if (typeof artist === "string") {
      artistNames.push(artist);
    } else {
      artistNames.push(artist.name);
      // Add artist's genres to the set
      if (artist.genres && Array.isArray(artist.genres)) {
        artist.genres.forEach((genre) => {
          if (typeof genre === "string") {
            allGenres.add(genre);
          } else if (genre && typeof genre === "object" && "name" in genre) {
            allGenres.add(genre.name);
          }
        });
      }
    }
  });

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
    artists: artistNames,
    genres: Array.from(allGenres),
  };
};
