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
import { useUser } from "@/lib/hooks/useUser";
import { UserSearch } from "@/components/UserSearch";

interface TabFriendsProps {
  userId?: string;
  username?: string;
}

export function TabFriends({ userId, username }: TabFriendsProps) {
  const [friends, setFriends] = useState<{
    followers: UserSummary[];
    following: UserSummary[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { user: currentUser, isLoading: userLoading } = useUser();

  console.log("[TabFriends] Debug info:", {
    currentUser: currentUser?.username,
    username,
    userLoading,
    shouldShowSearch:
      currentUser && username && currentUser.username === username,
  });

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const endpoint = username
          ? `/api/users/${username}/friends`
          : userId
          ? `/api/users/${userId}/friends`
          : "/api/profile/friends";
        console.log("[TabFriends] Fetching friends from endpoint:", endpoint);
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
          setFriends({
            followers: friendsData.followers,
            following: friendsData.following,
          });
        }
      } catch (err) {
        console.error("Error fetching friends:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to load friends"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [userId, username]);

  if (loading) {
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
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Followers</CardTitle>
          </CardHeader>
          <CardContent>
            {!friends || friends.followers.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No followers yet
              </p>
            ) : (
              <div className="space-y-4">
                {friends.followers.map((follower) => (
                  <Link
                    key={follower.id}
                    href={`/profile/${follower.username}`}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={follower.profile_photo_url} />
                      <AvatarFallback>
                        {follower.name?.charAt(0) ||
                          follower.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {follower.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        @{follower.username}
                      </p>
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
            {!friends || friends.following.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Not following anyone yet
              </p>
            ) : (
              <div className="space-y-4">
                {friends.following.map((following) => (
                  <Link
                    key={following.id}
                    href={`/profile/${following.username}`}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={following.profile_photo_url} />
                      <AvatarFallback>
                        {following.name?.charAt(0) ||
                          following.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {following.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        @{following.username}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* User search only for own profile */}
      {!userLoading &&
        currentUser &&
        username &&
        currentUser.username === username && (
          <div className="mt-8">
            <UserSearch />
          </div>
        )}
    </>
  );
}
