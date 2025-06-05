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

interface FilterOptions {
  locations: string[];
  genres: string[];
  eventTypes: string[];
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
    genre: string;
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
  const [genre, setGenre] = useState<string>("all");
  const [eventType, setEventType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    locations: [],
    genres: [],
    eventTypes: [],
  });

  useEffect(() => {
    const fetchFilterOptions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/filters");
        if (!response.ok) {
          throw new Error("Failed to fetch filter options");
        }
        const data = await response.json();
        setFilterOptions(data);
      } catch (error) {
        console.error("Error fetching filter options:", error);
        // Keep the empty arrays as fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  const handleApply = () => {
    onApply?.({
      dateRange,
      location,
      city,
      genre,
      eventType,
    });
    setOpen(false);
  };

  const handleReset = () => {
    setDateRange({ from: undefined, to: undefined });
    setLocation(null);
    setCity(null);
    setGenre("all");
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
              Genre
            </Label>
            <Select value={genre} onValueChange={setGenre} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue
                  placeholder={isLoading ? "Loading..." : "Select genre"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {!isLoading &&
                  filterOptions.genres?.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
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
