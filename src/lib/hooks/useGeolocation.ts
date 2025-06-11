import { useState } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  isLoading: boolean;
  geoCity: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    isLoading: false,
    geoCity: null,
  });

  const getLocation = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        }
      );

      const { latitude, longitude } = position.coords;

      // Fetch city name from coordinates
      const response = await fetch(
        `/api/coordinates/reverse?lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch city name");
      }

      setState({
        latitude,
        longitude,
        error: null,
        isLoading: false,
        geoCity: data.city,
      });
    } catch (error) {
      setState({
        latitude: null,
        longitude: null,
        error:
          error instanceof Error ? error.message : "Location access denied",
        isLoading: false,
        geoCity: null,
      });
    }
  };

  return {
    ...state,
    getLocation,
  };
}
