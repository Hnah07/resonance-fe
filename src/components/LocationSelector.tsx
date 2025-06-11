"use client";

import { LuMapPin, LuRefreshCw, LuX } from "react-icons/lu";
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
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";

const LocationSelector = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [isManualInput, setIsManualInput] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isUsingGeolocation, setIsUsingGeolocation] = useState(false);
  const [currentCity, setCurrentCity] = useState<string | null>(null);

  const { latitude, longitude, error, isLoading, geoCity, getLocation } =
    useGeolocation();
  const debouncedInputValue = useDebounce(inputValue, 500);

  // Update currentCity from URL
  useEffect(() => {
    const cityFromUrl = searchParams.get("city");
    if (cityFromUrl) {
      setCurrentCity(cityFromUrl);
      setInputValue(cityFromUrl);
    }
  }, [searchParams]);

  // Update URL when debounced input changes
  useEffect(() => {
    if (
      debouncedInputValue &&
      debouncedInputValue.length >= 3 &&
      isManualInput
    ) {
      setIsSearching(true);
      const params = new URLSearchParams(searchParams.toString());
      params.set("city", debouncedInputValue);
      router.push(`/discover?${params.toString()}`);
      setCurrentCity(debouncedInputValue);
      setIsSearching(false);
    }
  }, [debouncedInputValue, isManualInput, router, searchParams]);

  // Update URL when geolocation changes
  useEffect(() => {
    if (latitude && longitude && !error && !isManualInput) {
      setIsUsingGeolocation(true);
      const params = new URLSearchParams(searchParams.toString());
      params.set("lat", latitude.toString());
      params.set("lng", longitude.toString());

      if (geoCity) {
        params.set("city", geoCity);
        setCurrentCity(geoCity);
        setInputValue(geoCity);
        toast.success("Location Updated", {
          description: `Using ${geoCity}`,
        });
      } else {
        toast.success("Location Updated", {
          description: "Using your current location",
        });
      }

      router.push(`/discover?${params.toString()}`);
      setOpen(false);
    } else if (error && !isManualInput) {
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
    setIsManualInput(false);
    setIsUsingGeolocation(true);
    await getLocation();
  };

  const handleApply = () => {
    if (inputValue && !isUsingGeolocation) {
      setCurrentCity(inputValue);
      const params = new URLSearchParams(searchParams.toString());
      params.set("city", inputValue);
      router.push(`/discover?${params.toString()}`);
      toast.success("Location Updated", {
        description: `Using ${inputValue}`,
      });
      setOpen(false);
    }
  };

  // Reset geolocation state when dialog opens
  useEffect(() => {
    if (open) {
      setIsUsingGeolocation(false);
    }
  }, [open]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button className="flex flex-row items-center gap-2 text-lg text-text-secondary hover:text-foreground transition-colors">
          <LuMapPin className="text-2xl stroke-accent-cyan" />
          <p>{currentCity || "Location"}</p>
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
          <div className="w-full">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search a city..."
                value={inputValue}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setInputValue(newValue);
                  setIsManualInput(true);
                  setIsSearching(newValue.length >= 3);
                }}
                className="w-full pr-8"
              />
              {isSearching && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}
            </div>
            {inputValue.length > 0 && inputValue.length < 3 && (
              <p className="mt-1 text-sm text-muted-foreground">
                Type at least 3 characters to search
              </p>
            )}
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
          <Button onClick={handleApply} disabled={isUsingGeolocation}>
            Apply
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LocationSelector;
