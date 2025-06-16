import { StatCard } from "@/components/StatCard";
import {
  LuCalendar,
  LuTicket,
  LuGlobe,
  LuMusic,
  LuHeart,
  LuStar,
} from "react-icons/lu";
import { useEffect, useState } from "react";
import { SummaryStats } from "@/types/summary-stats";

export function SummaryStatCards() {
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/profile/summary-stats");
        if (!response.ok) {
          throw new Error("Failed to fetch summary statistics");
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <div className="flex items-center space-x-2">
          <LuMusic className="w-8 h-8 animate-bounce text-primary" />
          <LuMusic
            className="w-8 h-8 animate-bounce text-primary"
            style={{ animationDelay: "0.2s" }}
          />
        </div>
        <div className="text-lg font-medium text-gray-600">
          Loading your concert stats...
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center text-red-500">Failed to load statistics</div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
      <StatCard
        icon={<LuCalendar className="w-6 h-6" />}
        title="Concerts This Year"
        value={stats.concerts_this_year}
        details={`You've been to ${
          stats.concerts_this_year
        } concerts in ${new Date().getFullYear()} so far.`}
      />
      <StatCard
        icon={<LuTicket className="w-6 h-6" />}
        title="Concerts Attended"
        value={stats.total_concerts}
        details={`You've attended ${stats.total_concerts} concerts in total since you started tracking your concert history.`}
      />
      <StatCard
        icon={<LuGlobe className="w-6 h-6" />}
        title="Countries Visited"
        value={stats.countries_visited}
        details={`You've seen concerts in ${stats.countries_list.join(", ")}.`}
      />
      <StatCard
        icon={<LuMusic className="w-6 h-6" />}
        title="Favorite Genre"
        value={stats.favorite_genre.genre}
        details={`${stats.favorite_genre.genre} is your most frequently attended genre, with ${stats.favorite_genre.count} concerts.`}
      />
      <StatCard
        icon={<LuHeart className="w-6 h-6" />}
        title="Most Seen Artist"
        value={stats.most_seen_artist.name}
        details={`You've seen ${stats.most_seen_artist.name} ${
          stats.most_seen_artist.count
        } time${stats.most_seen_artist.count !== 1 ? "s" : ""}.`}
      />
      <StatCard
        icon={<LuStar className="w-6 h-6" />}
        title="Top Venue"
        value={stats.top_venue.name}
        details={`You've visited ${stats.top_venue.name} ${
          stats.top_venue.count
        } time${stats.top_venue.count !== 1 ? "s" : ""}.`}
      />
    </div>
  );
}
