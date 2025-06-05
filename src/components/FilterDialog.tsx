"use client";

import {
  LuCalendar,
  LuFilter,
  LuMapPin,
  LuMusic,
  LuTicket,
  LuRefreshCw,
} from "react-icons/lu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useState, useEffect } from "react";
import { LocationSearch } from "@/components/LocationSearch";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import { Switch } from "@/components/ui/switch";

interface FilterOptions {
  locations: string[];
  eventTypes: string[];
}

interface Genre {
  id: string;
  genre: string;
}

interface FilterDialogProps {
  onApply?: (filters: {
    dateRange: { from: Date | undefined; to: Date | undefined };
    location: {
      id: string;
      name: string;
      city: string;
      country: string;
    } | null;
    city: {
      id: string;
      name: string;
      city: string;
      country: string;
    } | null;
    genres: string[];
    genreFilterMode: "any" | "all";
    eventType: string;
  }) => void;
}

export const FilterDialog = ({ onApply }: FilterDialogProps) => {
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [location, setLocation] = useState<{
    id: string;
    name: string;
    city: string;
    country: string;
  } | null>(null);
  const [city, setCity] = useState<{
    id: string;
    name: string;
    city: string;
    country: string;
  } | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [genreFilterMode, setGenreFilterMode] = useState<"any" | "all">("any");
  const [eventType, setEventType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    locations: [],
    eventTypes: [],
  });
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch filter options
        const filterResponse = await fetch("/api/filters");
        if (!filterResponse.ok) {
          throw new Error("Failed to fetch filter options");
        }
        const filterData = await filterResponse.json();
        setFilterOptions(filterData);

        // Fetch all genres
        const genresResponse = await fetch("/api/genres?all=true");
        if (!genresResponse.ok) {
          throw new Error("Failed to fetch genres");
        }
        const genresData = await genresResponse.json();
        setGenres(genresData.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Keep the empty arrays as fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApply = () => {
    onApply?.({
      dateRange,
      location,
      city,
      genres: selectedGenres,
      genreFilterMode,
      eventType,
    });
    setOpen(false);
  };

  const handleReset = () => {
    setDateRange({ from: undefined, to: undefined });
    setLocation(null);
    setCity(null);
    setSelectedGenres([]);
    setGenreFilterMode("any");
    setEventType("all");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex flex-row items-center gap-2 bg-accent-cyan text-white"
        >
          <LuFilter /> Filters
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Concerts</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <LuCalendar className="text-xl stroke-accent-cyan" />
              Date Range
            </Label>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>

          {/* City Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <LuMapPin className="text-xl stroke-accent-cyan" />
              City
            </Label>
            <LocationSearch
              selectedLocation={city || undefined}
              onSelect={(loc) => setCity(loc)}
              searchType="city"
            />
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <LuMapPin className="text-xl stroke-accent-cyan" />
              Venue
            </Label>
            <LocationSearch
              selectedLocation={location || undefined}
              onSelect={(loc) => setLocation(loc)}
              searchType="location"
            />
          </div>

          {/* Genre Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <LuMusic className="text-xl stroke-accent-cyan" />
              Genres
            </Label>
            <MultiCombobox
              options={genres.map((genre) => ({
                value: genre.genre,
                label: genre.genre,
              }))}
              selectedValues={selectedGenres}
              onSelectionChange={setSelectedGenres}
              placeholder="Select genres..."
              searchPlaceholder="Search genres..."
              emptyMessage="No genres found."
              disabled={isLoading}
            />
            {selectedGenres.length > 0 && (
              <div className="flex items-center justify-between mt-2">
                <Label className="text-sm text-muted-foreground">
                  {genreFilterMode === "any"
                    ? "Include concerts with any of these genres"
                    : "Only show concerts with all these genres"}
                </Label>
                <Switch
                  checked={genreFilterMode === "all"}
                  onCheckedChange={(checked) =>
                    setGenreFilterMode(checked ? "all" : "any")
                  }
                />
              </div>
            )}
          </div>

          {/* Event Type Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <LuTicket className="text-xl stroke-accent-cyan" />
              Event Type
            </Label>
            <Select
              value={eventType}
              onValueChange={setEventType}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={isLoading ? "Loading..." : "Select event type"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {!isLoading &&
                  filterOptions.eventTypes?.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <LuRefreshCw className="h-4 w-4" />
            Reset Filters
          </Button>
          <Button onClick={handleApply} disabled={isLoading}>
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
