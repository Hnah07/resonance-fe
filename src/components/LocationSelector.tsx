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

const LocationSelector = () => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="flex flex-row items-center gap-2 text-lg text-text-secondary hover:text-foreground transition-colors">
          <LuMapPin className="text-2xl stroke-accent-cyan" />
          <p>Location</p>
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
            <Input placeholder="Enter a city" className="pl-9" />
            <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <LuRefreshCw className="h-4 w-4" />
            Use my current location
          </Button>
        </div>
        <AlertDialogFooter>
          <Button>Apply</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LocationSelector;
