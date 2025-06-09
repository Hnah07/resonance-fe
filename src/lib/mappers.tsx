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

  // Add genres from the event object if it exists
  if (typeof c.event === "object" && c.event.genres) {
    c.event.genres.forEach((genre) => {
      if (typeof genre === "string") {
        allGenres.add(genre);
      } else if (genre && typeof genre === "object" && "name" in genre) {
        allGenres.add(genre.name);
      }
    });
  }

  // Add genres from artists
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

  // Add any genres directly on the concert object
  if (c.genres && Array.isArray(c.genres)) {
    c.genres.forEach((genre) => {
      if (typeof genre === "string") {
        allGenres.add(genre);
      } else if (genre && typeof genre === "object" && "name" in genre) {
        allGenres.add(genre.name);
      }
    });
  }

  console.log("Mapped concert genres:", {
    id: c.id,
    genres: Array.from(allGenres),
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
