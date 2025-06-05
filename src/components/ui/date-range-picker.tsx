"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  value: { from: Date | undefined; to: Date | undefined };
  onChange: (value: { from: Date | undefined; to: Date | undefined }) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value.from && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value.from ? (
            value.to ? (
              <>
                {format(value.from, "LLL dd, y")} -{" "}
                {format(value.to, "LLL dd, y")}
              </>
            ) : (
              format(value.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0">
        <DialogHeader className="px-3 pt-3">
          <DialogTitle>Select Date Range</DialogTitle>
        </DialogHeader>
        <div className="p-3">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value.from}
            selected={{ from: value.from, to: value.to }}
            onSelect={(range) => {
              onChange({
                from: range?.from,
                to: range?.to,
              });
              if (range?.from && range?.to) {
                setOpen(false);
              }
            }}
            numberOfMonths={1}
            className="rounded-md border"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
