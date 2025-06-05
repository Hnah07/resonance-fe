import { NextResponse } from "next/server";
import https from "https";
import { ApiConcertResponse, ApiLocationResponse } from "@/types/concert";
import { ApiArtistResponse, ApiGenreResponse } from "@/types/artists";

export async function GET() {
  const token = process.env.API_TOKEN?.trim();

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
          // Ignore SSL certificate errors in development
          rejectUnauthorized: false,
        };

        const req = https.request(options, (res) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            if (res.statusCode && res.statusCode >= 400) {
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

    // Fetch concerts
    const concertsData = (await makeRequest(
      "/api/concerts"
    )) as ApiConcertResponse;
    const concerts = concertsData.data;
    const links = concertsData.links;
    const meta = concertsData.meta;

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
                ? concert.location
                : concert.location.name,
            city: locationDetails.city,
            country: locationDetails.country,
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
                ? concert.location
                : concert.location.name,
            city: locationDetails.city,
            country: locationDetails.country,
            date: concert.date,
            start_date:
              typeof concert.event === "string"
                ? concert.date
                : concert.event.start_date,
            end_date:
              typeof concert.event === "string"
                ? concert.date
                : concert.event.end_date,
            description:
              typeof concert.event === "string"
                ? ""
                : concert.event.description,
            type:
              typeof concert.event === "string"
                ? "concert"
                : concert.event.type,
            image:
              typeof concert.event === "string"
                ? ""
                : concert.event.image || "",
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
