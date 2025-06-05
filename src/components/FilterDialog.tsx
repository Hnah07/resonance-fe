"use client";

import {
  LuCalendar,
  LuFilter,
  LuMapPin,
  LuMusic,
  LuTicket,
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

interface FilterOptions {
  locations: string[];
  genres: string[];
  eventTypes: string[];
}

interface FilterDialogProps {
  onApply?: (filters: {
    dateRange: { from: Date | undefined; to: Date | undefined };
    location: string;
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
  const [location, setLocation] = useState<string>("all");
  const [genre, setGenre] = useState<string>("all");
  const [eventType, setEventType] = useState<string>("all");
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    locations: [],
    genres: [],
    eventTypes: [],
  });

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch("/api/filters");
        const data = await response.json();
        setFilterOptions(data);
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  const handleApply = () => {
    onApply?.({
      dateRange,
      location,
      genre,
      eventType,
    });
    setOpen(false);
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

          {/* Location Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <LuMapPin className="text-xl stroke-accent-cyan" />
              Location
            </Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {filterOptions.locations.map((city) => (
                  <SelectItem key={city} value={city.toLowerCase()}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Genre Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <LuMusic className="text-xl stroke-accent-cyan" />
              Genre
            </Label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger>
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {filterOptions.genres.map((genre) => (
                  <SelectItem key={genre} value={genre.toLowerCase()}>
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
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {filterOptions.eventTypes.map((type) => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleApply}>Apply Filters</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
