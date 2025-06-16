import { StatCard } from "@/components/StatCard";
import {
  LuCalendar,
  LuTicket,
  LuGlobe,
  LuMusic,
  LuHeart,
  LuStar,
} from "react-icons/lu";

export function SummaryStatCards() {
  return (
    <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
      <StatCard
        icon={<LuCalendar className="w-6 h-6" />}
        title="Concerts This Year"
        value={12}
        details="You've been to 12 concerts in 2024 so far. Your most recent concert was Metallica in Brussels."
      />
      <StatCard
        icon={<LuTicket className="w-6 h-6" />}
        title="Concerts Attended"
        value={50}
        details="You've attended 50 concerts in total since you started tracking your concert history."
      />
      <StatCard
        icon={<LuGlobe className="w-6 h-6" />}
        title="Countries Visited"
        value={5}
        details="You've seen concerts in Belgium, Netherlands, Germany, France, and the UK."
      />
      <StatCard
        icon={<LuMusic className="w-6 h-6" />}
        title="Favorite Genre"
        value="Metal"
        details="Metal is your most frequently attended genre, making up 60% of your concert history."
      />
      <StatCard
        icon={<LuHeart className="w-6 h-6" />}
        title="Most Seen Artist"
        value="Metallica"
        details="You've seen Metallica 5 times across different venues and countries."
      />
      <StatCard
        icon={<LuStar className="w-6 h-6" />}
        title="Top Venue"
        value="De Grootste Zaal ter Wereld"
        details="You've visited this venue 8 times, making it your most frequented concert location."
      />
    </div>
  );
}
