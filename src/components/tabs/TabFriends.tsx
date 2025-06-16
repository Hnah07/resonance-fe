"use client";

import { useEffect, useState } from "react";
import { makeClientRequest } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { UserSummary } from "@/types/summary-stats";
import { User } from "@/lib/hooks/useUser";

interface TabFriendsProps {
  userId?: string;
}

export function TabFriends({ userId }: TabFriendsProps) {
  const [followers, setFollowers] = useState<UserSummary[]>([]);
  const [following, setFollowing] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setIsLoading(true);
        const endpoint = userId
          ? `/api/users/${userId}/friends`
          : "/api/profile/friends";
        const response = await makeClientRequest<{
          followers: User[];
          following: User[];
        }>(endpoint);

        let friendsData: { followers: User[]; following: User[] } | null = null;
        if ("data" in response && !Array.isArray(response.data)) {
          friendsData = response.data;
        } else if (Array.isArray(response.data)) {
          friendsData = response.data[0];
        }

        if (friendsData) {
          setFollowers(friendsData.followers);
          setFollowing(friendsData.following);
        }
      } catch (err) {
        console.error("Error fetching friends:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to load friends"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriends();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Followers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Following</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Followers</CardTitle>
        </CardHeader>
        <CardContent>
          {followers.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No followers yet
            </p>
          ) : (
            <div className="space-y-4">
              {followers.map((follower) => (
                <Link
                  key={follower.id}
                  href={`/profile/${follower.id}`}
                  className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-lg transition-colors"
                >
                  <Avatar className="h-10 w-10">
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
                    <div className="text-sm text-muted-foreground">
                      @{follower.username}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Following</CardTitle>
        </CardHeader>
        <CardContent>
          {following.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Not following anyone yet
            </p>
          ) : (
            <div className="space-y-4">
              {following.map((following) => (
                <Link
                  key={following.id}
                  href={`/profile/${following.id}`}
                  className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-lg transition-colors"
                >
                  <Avatar className="h-10 w-10">
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
                    <div className="text-sm text-muted-foreground">
                      @{following.username}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
