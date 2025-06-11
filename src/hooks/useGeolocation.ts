import { useState } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  isLoading: boolean;
  city: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    isLoading: false,
    city: null,
  });

  const getCityFromCoords = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
            "User-Agent": "Resonance App",
          },
        }
      );
      const data = await response.json();
      return (
        data.address.city || data.address.town || data.address.village || null
      );
    } catch (error) {
      console.error("Error getting city name:", error);
      return null;
    }
  };

  const getLocation = async () => {
    console.log("Starting geolocation request...");
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
        isLoading: false,
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log("Got position:", position);
        const city = await getCityFromCoords(
          position.coords.latitude,
          position.coords.longitude
        );
        console.log("Got city:", city);
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          isLoading: false,
          city,
        });
      },
      (error) => {
        console.log("Geolocation error:", error);
        let errorMessage = "Unable to retrieve your location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Please allow location access to see concerts near you";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }

        setState({
          latitude: null,
          longitude: null,
          error: errorMessage,
          isLoading: false,
          city: null,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return { ...state, getLocation };
}
