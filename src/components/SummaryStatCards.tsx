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

interface UserProfile {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  city: string | null;
  country_name: string | null;
  profile_photo_url: string;
  followers_count: number;
  following_count: number;
  checkins_count: number;
  concerts_count: number;
  artists_count: number;
  is_following: boolean;
  is_current_user: boolean;
}

interface SummaryStatCardsProps {
  userId?: string;
  profile?: UserProfile | null;
}

export function SummaryStatCards({ userId, profile }: SummaryStatCardsProps) {
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // If we have a userId, try to fetch detailed stats
        if (userId) {
          const url = `/api/users/${userId}/summary-stats`;
          const response = await fetch(url);

          if (response.ok) {
            const data = await response.json();
            setStats(data);
            setLoading(false);
            return;
          } else {
            // If detailed stats fail, fall back to basic profile stats
            console.log(
              "Detailed stats not available, using profile stats as fallback"
            );
          }
        } else {
          // For current user, use the profile summary stats
          const response = await fetch("/api/profile/summary-stats");
          if (!response.ok) {
            throw new Error("Failed to fetch summary statistics");
          }
          const data = await response.json();
          setStats(data);
          setLoading(false);
          return;
        }

        // Fallback: use basic profile stats only if user has check-ins
        if (profile && profile.checkins_count > 0) {
          const basicStats: SummaryStats = {
            concerts_this_year: profile.concerts_count, // This is approximate
            total_concerts: profile.concerts_count,
            countries_visited: 1, // We don't have this info in basic profile
            countries_list: profile.country_name ? [profile.country_name] : [],
            favorite_genre: {
              genre: "No data",
              count: 0,
            },
            most_seen_artist: {
              name: "No data",
              count: 0,
            },
            top_venue: {
              name: "No data",
              count: 0,
            },
          };
          setStats(basicStats);
        } else {
          // User has no check-ins, set stats to null to show "no data" state
          setStats(null);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId, profile]);

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
          Loading concert stats...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">Failed to load statistics</div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <div className="flex flex-col items-center space-y-4">
          <LuMusic className="w-12 h-12 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-medium text-slate-800 dark:text-white">
              No concert data yet
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {userId
                ? "This user hasn't checked in to any concerts yet."
                : "You haven't checked in to any concerts yet."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
      <StatCard
        icon={<LuCalendar className="w-6 h-6" />}
        title="Concerts This Year"
        value={stats.concerts_this_year || 0}
        details={`${userId ? "They" : "You"}'ve been to ${
          stats.concerts_this_year || 0
        } concerts in ${new Date().getFullYear()} so far.`}
      />
      <StatCard
        icon={<LuTicket className="w-6 h-6" />}
        title="Concerts Attended"
        value={stats.total_concerts || 0}
        details={`${userId ? "They" : "You"}'ve attended ${
          stats.total_concerts || 0
        } concerts in total since ${userId ? "they" : "you"} started tracking ${
          userId ? "their" : "your"
        } concert history.`}
      />
      <StatCard
        icon={<LuGlobe className="w-6 h-6" />}
        title="Countries Visited"
        value={stats.countries_visited || 0}
        details={`${userId ? "They" : "You"}'ve seen concerts in ${(
          stats.countries_list || []
        ).join(", ")}.`}
      />
      {stats.favorite_genre && stats.favorite_genre.genre !== "No data" ? (
        <StatCard
          icon={<LuMusic className="w-6 h-6" />}
          title="Favorite Genre"
          value={stats.favorite_genre.genre}
          details={`${stats.favorite_genre.genre} is ${
            userId ? "their" : "your"
          } most frequently attended genre, with ${
            stats.favorite_genre.count
          } concerts.`}
        />
      ) : (
        <StatCard
          icon={<LuMusic className="w-6 h-6" />}
          title="Favorite Genre"
          value="No data yet"
          details="Start checking in to concerts to see favorite genres!"
        />
      )}
      {stats.most_seen_artist && stats.most_seen_artist.name !== "No data" ? (
        <StatCard
          icon={<LuHeart className="w-6 h-6" />}
          title="Most Seen Artist"
          value={stats.most_seen_artist.name}
          details={`${userId ? "They" : "You"}'ve seen ${
            stats.most_seen_artist.name
          } ${stats.most_seen_artist.count} time${
            stats.most_seen_artist.count !== 1 ? "s" : ""
          }.`}
        />
      ) : (
        <StatCard
          icon={<LuHeart className="w-6 h-6" />}
          title="Most Seen Artist"
          value="No data yet"
          details="Start checking in to concerts to see most seen artists!"
        />
      )}
      {stats.top_venue && stats.top_venue.name !== "No data" ? (
        <StatCard
          icon={<LuStar className="w-6 h-6" />}
          title="Top Venue"
          value={stats.top_venue.name}
          details={`${userId ? "They" : "You"}'ve visited ${
            stats.top_venue.name
          } ${stats.top_venue.count} time${
            stats.top_venue.count !== 1 ? "s" : ""
          }.`}
        />
      ) : (
        <StatCard
          icon={<LuStar className="w-6 h-6" />}
          title="Top Venue"
          value="No data yet"
          details="Start checking in to concerts to see top venues!"
        />
      )}
    </div>
  );
}
