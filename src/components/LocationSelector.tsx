"use client";

import { LuMapPin, LuRefreshCw, LuSearch, LuX } from "react-icons/lu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGeolocation } from "@/hooks/useGeolocation";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const LocationSelector = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    latitude,
    longitude,
    error,
    isLoading,
    getLocation,
    city: geoCity,
  } = useGeolocation();
  const [city, setCity] = useState("");
  const [open, setOpen] = useState(false);
  const [isManualInput, setIsManualInput] = useState(false);

  // Update city input when geolocation city changes (only if not manually typing)
  useEffect(() => {
    if (geoCity && !isManualInput) {
      setCity(geoCity);
    }
  }, [geoCity, isManualInput]);

  // Update URL when city changes (only for manual input)
  useEffect(() => {
    if (city && isManualInput) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("city", city);
      // Remove lat/lng when manually entering city
      params.delete("lat");
      params.delete("lng");
      router.push(`/discover?${params.toString()}`);
    }
  }, [city, isManualInput, router, searchParams]);

  // Update URL when geolocation changes (only if not manually typing)
  useEffect(() => {
    if (latitude && longitude && !error && !isManualInput) {
      console.log("Location updated, updating URL:", { latitude, longitude });
      const params = new URLSearchParams(searchParams.toString());
      params.set("lat", latitude.toString());
      params.set("lng", longitude.toString());
      if (geoCity) {
        params.set("city", geoCity);
      }
      router.push(`/discover?${params.toString()}`);
      toast.success("Location Updated", {
        description: geoCity
          ? `Using ${geoCity}`
          : "Using your current location",
      });
    } else if (error && !isManualInput) {
      console.log("Location error:", error);
      toast.error("Location Error", {
        description: error,
      });
    }
  }, [
    latitude,
    longitude,
    error,
    router,
    searchParams,
    geoCity,
    isManualInput,
  ]);

  const handleLocationClick = async () => {
    console.log("Location button clicked");
    setIsManualInput(false);
    getLocation();
  };

  const handleApply = () => {
    if (city) {
      toast.success("Location Updated", {
        description: `Using ${city}`,
      });
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button className="flex flex-row items-center gap-2 text-lg text-text-secondary hover:text-foreground transition-colors">
          <LuMapPin className="text-2xl stroke-accent-cyan" />
          <p>{city || "Location"}</p>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader className="flex flex-row items-center justify-between">
          <AlertDialogTitle>Set location</AlertDialogTitle>
          <AlertDialogCancel className="rounded-full p-1 hover:bg-muted">
            <LuX className="h-4 w-4" />
          </AlertDialogCancel>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
          <div className="relative">
            <Input
              placeholder="Enter a city"
              className="pl-9"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setIsManualInput(true);
              }}
            />
            <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleLocationClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <LuRefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <LuRefreshCw className="h-4 w-4" />
            )}
            Use my current location
          </Button>
        </div>
        <AlertDialogFooter>
          <Button onClick={handleApply}>Apply</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LocationSelector;
