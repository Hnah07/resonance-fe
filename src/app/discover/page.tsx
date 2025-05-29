import { LuCalendar, LuFilter, LuMapPin, LuMusic, LuX } from "react-icons/lu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ConcertCard } from "@/components/ConcertCard";

const DiscoverPage = () => {
  return (
    <>
      <div className="flex flex-col items-center mb-12">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold">Discover Concerts</h1>
          <p className="text-lg text-text-secondary">
            Find live music near you
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between w-full mb-12">
        <div className="flex flex-row items-center gap-2">
          <LuMapPin className="text-2xl stroke-accent-cyan" />
          <p className="text-lg text-text-secondary">Location</p>
        </div>

        {/* add alert dialog for filters on genres, locations, date, time */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="flex flex-row items-center gap-2 bg-accent-cyan text-white"
            >
              <LuFilter /> Filters
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader className="flex flex-row items-center justify-between">
              <AlertDialogTitle>Filters</AlertDialogTitle>
              <AlertDialogCancel className="rounded-full p-1 hover:bg-muted">
                <LuX className="h-4 w-4" />
              </AlertDialogCancel>
            </AlertDialogHeader>
            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center gap-2">
                <LuMapPin className="text-2xl stroke-accent-cyan" />
                <p className="text-lg text-text-secondary">Location</p>
              </div>
              {/* genres */}
              <div className="flex flex-row items-center gap-2">
                <LuMusic className="text-2xl stroke-accent-cyan" />
                <p className="text-lg text-text-secondary">Genres</p>
              </div>
              {/* date */}
              <div className="flex flex-row items-center gap-2">
                <LuCalendar className="text-2xl stroke-accent-cyan" />
                <p className="text-lg text-text-secondary">Date</p>
              </div>
            </div>
            <AlertDialogFooter>
              <Button>Apply</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <ConcertCard />
      <ConcertCard />
      <ConcertCard />
    </>
  );
};
export default DiscoverPage;
