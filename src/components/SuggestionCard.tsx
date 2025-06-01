import { ArtistBadges } from "./ArtistBadges";
import { GenreBadges } from "./GenreBadges";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { LuCalendar, LuMapPin } from "react-icons/lu";
import { formatEventDate } from "@/lib/helpers";

interface SuggestionCardProps {
  id: string;
  event: string;
  date: string;
  city: string;
  country: string;
  artists: string[];
  genres: string[];
}
function SuggestionCard({
  event,
  date,
  city,
  country,
  artists,
  genres,
}: SuggestionCardProps) {
  return (
    <>
      <Card className="mb-4">
        <CardContent className="flex flex-col gap-4">
          <CardHeader className="flex flex-row items-center w-full justify-between gap-2 p-0">
            <CardTitle className="text-xl">{event}</CardTitle>
            <CardDescription className="flex items-center gap-2 text-sm">
              <LuCalendar className="w-4 h-4" />
              {formatEventDate(date)}
            </CardDescription>
          </CardHeader>
          <CardDescription className="flex items-center gap-2 text-sm">
            <LuMapPin className="w-4 h-4" />
            {city}, {country}
          </CardDescription>
          <CardDescription>
            <ArtistBadges title="Artists" artists={artists} />
          </CardDescription>
          <CardDescription>
            <GenreBadges genres={genres} />
          </CardDescription>
        </CardContent>
      </Card>
    </>
  );
}
export default SuggestionCard;
