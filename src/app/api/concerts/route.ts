import { NextResponse } from "next/server";
import { makeRequest } from "@/lib/api";
import { cache } from "react";
import {
  ApiConcertResponse,
  ApiLocationResponse,
  ApiConcert,
  EventType,
} from "@/types/concert";
import {
  ApiArtistResponse,
  ApiGenreResponse,
  Artist,
  Genre,
} from "@/types/artists";

interface LocationDetails {
  city: string;
  country: string;
}

// Cache the getConcertDetails function
const getConcertDetails = cache(async (concert: ApiConcert) => {
  const [artistsResponse, locationResponse] = await Promise.all([
    makeRequest<ApiArtistResponse>(`/api/concerts/${concert.id}/artists`),
    typeof concert.location === "object" && concert.location.id
      ? makeRequest<ApiLocationResponse>(
          `/api/locations/${concert.location.id}`
        )
      : Promise.resolve({ data: { city: "", country: "" } as LocationDetails }),
  ]);

  // Fetch genres for each artist
  const artists = (artistsResponse as unknown as { data: Artist[] }).data;
  const artistGenresPromises = artists.map(async (artist) => {
    const genresResponse = await makeRequest<ApiGenreResponse>(
      `/api/artists/${artist.id}/genres`
    );
    const genres = (genresResponse as unknown as { data: Genre[] }).data;
    return genres.map((genre) => genre.name);
  });

  const allGenres = await Promise.all(artistGenresPromises);
  const uniqueGenres = [...new Set(allGenres.flat())];

  const locationDetails = locationResponse.data as LocationDetails;

  return {
    artists,
    location: locationDetails,
    genres: uniqueGenres,
  };
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    // Build the API path with query parameters
    const apiPath = `/api/concerts${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    // Fetch concerts with query parameters
    const concertsResponse = await makeRequest<ApiConcertResponse>(apiPath);
    const concerts = (concertsResponse as unknown as { data: ApiConcert[] })
      .data;

    // Filter concerts by city if city parameter is present
    let filteredConcerts = concerts;
    const cityFilter = searchParams.get("city");

    if (cityFilter) {
      const searchCity = cityFilter.toLowerCase();
      filteredConcerts = concerts.filter((concert) => {
        const matches = concert.location.city
          .toLowerCase()
          .includes(searchCity);
        return matches;
      });
    }

    const links = concertsResponse.links;
    const meta = {
      ...concertsResponse.meta,
      total: filteredConcerts.length,
      to: filteredConcerts.length,
    };

    // Fetch artists and genres for each concert using the cached function
    const concertsWithDetails = await Promise.all(
      filteredConcerts.map(async (concert) => {
        try {
          const { artists, location, genres } = await getConcertDetails(
            concert
          );

          return {
            id: concert.id,
            event:
              typeof concert.event === "string"
                ? concert.event
                : {
                    id: concert.event.id,
                    name: concert.event.name,
                    type: concert.event.type as EventType,
                    description: concert.event.description,
                    start_date: concert.event.start_date,
                    end_date: concert.event.end_date,
                    image: concert.event.image,
                  },
            location:
              typeof concert.location === "string"
                ? {
                    id: "",
                    name: concert.location,
                    city: location.city,
                    country: location.country,
                  }
                : {
                    id: concert.location.id,
                    name: concert.location.name,
                    city: location.city,
                    country: location.country,
                  },
            date: concert.date,
            image:
              typeof concert.event === "string"
                ? concert.image || ""
                : concert.event.image || concert.image || "",
            artists: artists.map((artist) => artist.name),
            genres: genres,
          };
        } catch (error) {
          console.error(
            `Error fetching details for concert ${concert.id} (${
              typeof concert.event === "string"
                ? concert.event
                : concert.event.name
            }):`,
            error
          );
          return {
            id: concert.id,
            event:
              typeof concert.event === "string"
                ? concert.event
                : concert.event.name,
            location:
              typeof concert.location === "string"
                ? { id: "", name: concert.location, city: "", country: "" }
                : {
                    id: concert.location.id,
                    name: concert.location.name,
                    city: "",
                    country: "",
                  },
            date: concert.date,
            image:
              typeof concert.event === "string"
                ? concert.image || ""
                : concert.event.image || concert.image || "",
            artists: [],
            genres: [],
          };
        }
      })
    );

    return NextResponse.json({ concerts: concertsWithDetails, links, meta });
  } catch (error) {
    console.error("Server-side API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch concerts" },
      { status: 500 }
    );
  }
}
