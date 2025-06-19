"use client";

import { useEffect, useState } from "react";
import { ProfileStats } from "@/types/summary-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { makeClientRequest } from "@/lib/api";
import { toast } from "sonner";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

interface TabStatsProps {
  isActive: boolean;
  userId?: string;
  username?: string;
}

export function TabStats({ isActive, userId, username }: TabStatsProps) {
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isActive) {
        console.log("[TabStats] Tab is not active, skipping fetch");
        return;
      }

      try {
        setLoading(true);
        const endpoint = username
          ? `/api/users/${username}/stats`
          : userId
          ? `/api/users/${userId}/stats`
          : "/api/profile/stats";
        console.log("[TabStats] Fetching stats from endpoint:", endpoint);
        const response = await makeClientRequest<ProfileStats>(endpoint);

        if ("data" in response && !Array.isArray(response.data)) {
          setStats(response.data);
        } else if (Array.isArray(response.data)) {
          setStats(response.data[0]);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to load statistics"
        );
      } finally {
        setLoading(false);
      }
    };

    if (isActive) {
      fetchStats();
    }
  }, [isActive, userId, username]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-muted-foreground">
        No stats available
      </div>
    );
  }

  const chartConfig = {
    concerts: {
      label: "Concerts",
      theme: {
        light: "var(--chart-1)",
        dark: "var(--chart-1)",
      },
    },
    ...stats.genre_distribution.reduce(
      (acc, genre) => ({
        ...acc,
        [genre.genre]: {
          label: genre.genre,
          theme: {
            light: COLORS[Object.keys(acc).length % COLORS.length],
            dark: COLORS[Object.keys(acc).length % COLORS.length],
          },
        },
      }),
      {}
    ),
  };

  return (
    <div className="space-y-6">
      {/* Followers and Following */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Followers</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="text-2xl font-bold">{stats.followers_count}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {stats.followers.map((follower) => (
                <TooltipProvider key={follower.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="h-8 w-8 cursor-pointer">
                        <AvatarImage src={follower.profile_photo_url} />
                        <AvatarFallback>
                          {follower.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={follower.profile_photo_url} />
                          <AvatarFallback>
                            {follower.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{follower.name}</div>
                          <div className="text-xs text-muted-foreground">
                            @{follower.username}
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Following</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="text-2xl font-bold">{stats.following_count}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {stats.following.map((following) => (
                <TooltipProvider key={following.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="h-8 w-8 cursor-pointer">
                        <AvatarImage src={following.profile_photo_url} />
                        <AvatarFallback>
                          {following.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={following.profile_photo_url} />
                          <AvatarFallback>
                            {following.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{following.name}</div>
                          <div className="text-xs text-muted-foreground">
                            @{following.username}
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Concerts</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="h-[280px] sm:h-[320px]">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <BarChart data={stats.monthly_attendance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  angle={-45}
                  textAnchor="end"
                  height={40}
                  className="text-xs"
                />
                <YAxis />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(label) => `${label} Concerts`}
                    />
                  }
                />
                <Bar dataKey="count" name="concerts" fill="var(--chart-1)" />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Genre Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Genre Distribution</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="h-[260px] sm:h-[300px]">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <PieChart>
                <Pie
                  data={stats.genre_distribution}
                  dataKey="count"
                  nameKey="genre"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  className="text-xs"
                  label={({ genre, count }) => `${genre}: ${count}`}
                >
                  {stats.genre_distribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="font-medium">{data.genre}</div>
                            <div className="text-right">
                              {data.count} concerts
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Venues */}
      <Card>
        <CardHeader>
          <CardTitle>Top Venues</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-2">
            {stats.top_venues.map((venue) => (
              <div
                key={venue.venue}
                className="flex items-center justify-between"
              >
                <span className="font-medium">{venue.venue}</span>
                <span className="text-muted-foreground">
                  {venue.count} visits
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Artists */}
      <Card>
        <CardHeader>
          <CardTitle>Top Artists</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {stats.top_artists.map((artist) => (
              <div
                key={artist.artist}
                className="flex flex-col items-center space-y-2"
              >
                <Avatar className="h-16 w-16">
                  <AvatarImage src={artist.image} />
                  <AvatarFallback>
                    {artist.artist
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <div className="font-medium">{artist.artist}</div>
                  <div className="text-sm text-muted-foreground">
                    {artist.count} concerts
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
