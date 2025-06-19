"use client";

import { Filter } from "lucide-react";
import { Suspense } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

interface CheckInsFilterProps {
  onGenreChange: (value: string) => void;
  onRatingChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onArtistChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  artists?: (
    | string
    | { id?: string; name: string; type?: string; image_url?: string }
  )[];
  genres?: (
    | string
    | { id?: string; name: string; type?: string; image_url?: string }
  )[];
  locations?: string[];
  isLoading?: boolean;
}

function FilterSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

function FilterContent({
  onGenreChange,
  onRatingChange,
  onSortChange,
  onArtistChange,
  onLocationChange,
  onCountryChange,
  artists = [],
  genres = [],
  locations = [],
  isLoading,
}: CheckInsFilterProps) {
  console.log("FilterContent received genres count:", genres.length);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <FilterSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
      <div>
        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
          Artist
        </label>
        <Select onValueChange={onArtistChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Artists" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Artists</SelectItem>
            {artists.map((artist) => {
              const artistName =
                typeof artist === "string" ? artist : "Unknown Artist";
              return (
                <SelectItem key={artistName} value={artistName}>
                  {artistName}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
          Location
        </label>
        <Select onValueChange={onLocationChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
          Country
        </label>
        <Select onValueChange={onCountryChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Countries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {/* TODO: Add countries from the database */}
            <SelectItem value="belgium">Belgium</SelectItem>
            <SelectItem value="netherlands">Netherlands</SelectItem>
            <SelectItem value="france">France</SelectItem>
            <SelectItem value="germany">Germany</SelectItem>
            <SelectItem value="uk">United Kingdom</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
          Genre
        </label>
        <Select onValueChange={onGenreChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Genres" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            {genres.map((genre) => {
              const genreName =
                typeof genre === "string" ? genre : "Unknown Genre";
              return (
                <SelectItem key={genreName} value={genreName}>
                  {genreName}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
          Minimum Rating
        </label>
        <Select onValueChange={onRatingChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Ratings" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="3">3+ Stars</SelectItem>
            <SelectItem value="2">2+ Stars</SelectItem>
            <SelectItem value="1">1+ Stars</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
          Sort By
        </label>
        <Select onValueChange={onSortChange} defaultValue="newest">
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="rating-high">Highest Rated</SelectItem>
            <SelectItem value="rating-low">Lowest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function CheckInsFilter(props: CheckInsFilterProps) {
  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-4 mb-6">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="filters" className="border-none">
          <AccordionTrigger className="flex items-center text-accent-cyan hover:no-underline py-0">
            <div className="flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              <span className="font-medium">Filter Check-ins</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Suspense fallback={<FilterSkeleton />}>
              <FilterContent {...props} />
            </Suspense>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
