"use client";

import * as React from "react";
import { LuMapPin } from "react-icons/lu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { fetchLocation } from "@/app/actions";

interface Location {
  id: string;
  name: string;
  city: string;
  country: string;
}

interface LocationSearchProps {
  onSelect: (location: Location | string) => void;
  selectedLocation?: Location | string;
  className?: string;
  searchType?: "city" | "location";
}

export function LocationSearch({
  onSelect,
  selectedLocation,
  className,
  searchType = "location",
}: LocationSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Fetch locations when search changes
  React.useEffect(() => {
    const searchLocations = async () => {
      if (search.length < 2) {
        setLocations([]);
        return;
      }

      setIsLoading(true);
      try {
        console.log("Searching for:", search, "type:", searchType);
        const { location, error } = await fetchLocation(search, searchType);
        console.log("Search results:", location, "error:", error);
        if (error) {
          console.error("Error fetching locations:", error);
          setLocations([]);
          return;
        }
        // Handle city search results
        if (
          searchType === "city" &&
          Array.isArray(location) &&
          location.every((item) => typeof item === "string")
        ) {
          console.log("Setting city suggestions:", location);
          setLocations(
            location.map((city: string) => ({
              id: city, // Use city name as ID for cities
              name: city,
              city: city,
              country: "Belgium", // Since we're only searching in Belgium
            }))
          );
        }
        // Handle location search results
        else if (
          location &&
          Array.isArray(location) &&
          location.every((item) => typeof item === "object" && "id" in item)
        ) {
          console.log("Setting locations:", location);
          setLocations(
            (location as Location[]).map((loc) => ({
              id: loc.id,
              name: loc.name,
              city: loc.city,
              country: "Belgium", // Since we're only searching in Belgium
            }))
          );
        } else {
          console.log("No locations found");
          setLocations([]);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
        setLocations([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchLocations, 300);
    return () => clearTimeout(timeoutId);
  }, [search, searchType]);

  // Add logging for selection
  const handleSelect = (location: Location) => {
    console.log("Selected location:", location);
    if (searchType === "city") {
      console.log("Selecting city:", location.city);
      onSelect(location.city);
    } else {
      console.log("Selecting location:", location);
      onSelect(location);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !selectedLocation && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <LuMapPin className="h-4 w-4" />
            {selectedLocation ? (
              <span>
                {searchType === "city"
                  ? typeof selectedLocation === "string"
                    ? selectedLocation
                    : selectedLocation.city
                  : typeof selectedLocation === "string"
                  ? selectedLocation
                  : `${selectedLocation.name}, ${selectedLocation.city}`}
              </span>
            ) : (
              <span>Search {searchType}...</span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command>
          <CommandInput
            placeholder={`Search ${searchType}...`}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? (
                <div className="py-6 text-center text-sm">Searching...</div>
              ) : search.length < 2 ? (
                <div className="py-6 text-center text-sm">
                  Type at least 2 characters to search
                </div>
              ) : (
                <div className="py-6 text-center text-sm">
                  No {searchType === "city" ? "cities" : "locations"} found
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {locations.map((location) => (
                <CommandItem
                  key={location.id}
                  value={searchType === "city" ? location.city : location.name}
                  onSelect={() => handleSelect(location)}
                >
                  <div className="flex flex-col">
                    <span>
                      {searchType === "city" ? location.city : location.name}
                    </span>
                    {searchType === "location" && (
                      <span className="text-xs text-muted-foreground">
                        {location.city}, {location.country}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
