import { NextResponse } from "next/server";
import https from "https";
import { ApiConcertResponse, ApiLocationResponse } from "@/types/concert";
import { ApiArtistResponse, ApiGenreResponse } from "@/types/artists";

export async function GET(request: Request) {
  const token = process.env.API_TOKEN?.trim();
  const { searchParams } = new URL(request.url);

  if (!token) {
    console.error("API token is missing in server-side route");
    return NextResponse.json(
      { error: "API token not configured" },
      { status: 500 }
    );
  }

  try {
    // Create a promise-based request function
    const makeRequest = (path: string) => {
      return new Promise((resolve, reject) => {
        const options = {
          hostname:
            process.env.NEXT_PUBLIC_API_HOST || "resonance-be.ddev.site",
          path,
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          // Only ignore SSL certificate errors in development
          rejectUnauthorized: process.env.NODE_ENV !== "production",
        };

        const req = https.request(options, (res) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            if (res.statusCode && res.statusCode >= 400) {
              console.error("Backend error response:", data);
              reject(
                new Error(
                  `HTTP Error: ${res.statusCode} ${res.statusMessage} - ${data}`
                )
              );
              return;
            }

            try {
              const jsonData = JSON.parse(data);
              resolve(jsonData);
            } catch {
              reject(new Error(`Failed to parse response: ${data}`));
            }
          });
        });

        req.on("error", (error) => {
          console.error("Request error:", error);
          reject(error);
        });

        req.end();
      });
    };

    // Build the API path with query parameters
    const apiPath = `/api/concerts${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    // Fetch concerts with query parameters
    const concertsData = (await makeRequest(apiPath)) as ApiConcertResponse;

    // Filter concerts by city if city parameter is present
    let filteredConcerts = concertsData.data;
    const cityFilter = searchParams.get("city");

    if (cityFilter) {
      filteredConcerts = filteredConcerts.filter((concert) => {
        const matches =
          concert.location.city.toLowerCase() === cityFilter.toLowerCase();
        return matches;
      });
    }

    const concerts = filteredConcerts;
    const links = concertsData.links;
    const meta = {
      ...concertsData.meta,
      total: filteredConcerts.length,
      to: filteredConcerts.length,
    };

    // Fetch artists and genres for each concert
    const concertsWithDetails = await Promise.all(
      concerts.map(async (concert) => {
        // Initialize location details
        let locationDetails = { city: "", country: "" };

        try {
          // Fetch artists
          const artistsData = (await makeRequest(
            `/api/concerts/${concert.id}/artists`
          )) as ApiArtistResponse;

          // Fetch location details if location is an object
          if (typeof concert.location === "object" && concert.location.id) {
            try {
              const locationData = (await makeRequest(
                `/api/locations/${concert.location.id}`
              )) as ApiLocationResponse;
              locationDetails = {
                city: locationData.data.city || "",
                country: locationData.data.country || "",
              };
            } catch (error) {
              console.error(
                `Error fetching location details for concert ${concert.id}:`,
                error
              );
            }
          }

          // Fetch genres for each artist
          const artistGenresPromises = artistsData.data.map(async (artist) => {
            const genresData = (await makeRequest(
              `/api/artists/${artist.id}/genres`
            )) as ApiGenreResponse;
            return genresData.data.map((genre) => genre.name);
          });

          // Wait for all genre requests to complete and flatten the results
          const allGenres = await Promise.all(artistGenresPromises);
          const uniqueGenres = [...new Set(allGenres.flat())]; // Remove duplicates

          return {
            id: concert.id,
            event:
              typeof concert.event === "string"
                ? concert.event
                : {
                    id: concert.event.id,
                    name: concert.event.name,
                    type: concert.event.type,
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
                    city: locationDetails.city,
                    country: locationDetails.country,
                  }
                : {
                    id: concert.location.id,
                    name: concert.location.name,
                    city: locationDetails.city,
                    country: locationDetails.country,
                  },
            date: concert.date,
            image:
              typeof concert.event === "string"
                ? concert.image || ""
                : concert.event.image || concert.image || "",
            artists: artistsData.data?.map((artist) => artist.name) || [],
            genres: uniqueGenres,
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
                ? {
                    id: "",
                    name: concert.location,
                    city: locationDetails.city,
                    country: locationDetails.country,
                  }
                : {
                    id: concert.location.id,
                    name: concert.location.name,
                    city: locationDetails.city,
                    country: locationDetails.country,
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
