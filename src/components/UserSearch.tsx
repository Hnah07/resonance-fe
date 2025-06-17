"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LuSearch, LuMapPin, LuUsers, LuHeart } from "react-icons/lu";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { makeClientRequest } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

interface UserSearchResult {
  id: string;
  name: string;
  username: string;
  profile_photo_url: string;
  bio: string | null;
  city: string | null;
  country_name: string | null;
  followers_count: number;
  following_count: number;
  checkins_count: number;
  is_following: boolean;
}

export function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      searchUsers(debouncedQuery);
    } else if (debouncedQuery.length === 0 && hasSearched) {
      setResults([]);
      setHasSearched(false);
    }
  }, [debouncedQuery]);

  const searchUsers = async (searchQuery: string) => {
    try {
      setIsLoading(true);
      setHasSearched(true);

      const response = await makeClientRequest<UserSearchResult>(
        `/api/users/search?q=${encodeURIComponent(searchQuery)}`
      );

      if (response && response.data) {
        setResults(response.data);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowToggle = async (username: string, isFollowing: boolean) => {
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const response = await fetch(`/api/users/${username}/follow`, {
        method,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update follow status");
      }

      // Update the local state to reflect the change
      setResults((prev) =>
        prev.map((user) =>
          user.username === username
            ? { ...user, is_following: !isFollowing }
            : user
        )
      );

      toast.success(
        isFollowing ? "Unfollowed successfully" : "Followed successfully"
      );
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error("Failed to update follow status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
        <Input
          className="pl-10"
          type="text"
          placeholder="Search users by name or username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="w-20 h-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && hasSearched && (
        <div className="space-y-4">
          {results.length === 0 ? (
            <div className="text-center py-8">
              <LuUsers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-2">
                No users found
              </h3>
              <p className="text-sm text-muted-foreground">
                Try searching with a different name or username
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Found {results.length} user{results.length !== 1 ? "s" : ""}
              </p>
              {results.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Link href={`/profile/${user.username}`}>
                        <Avatar className="w-12 h-12 cursor-pointer hover:opacity-80 transition-opacity">
                          {user.profile_photo_url ? (
                            <AvatarImage src={user.profile_photo_url} />
                          ) : (
                            <AvatarFallback>
                              <Image
                                src="/placeholder-avatar-user.jpg"
                                alt="Placeholder avatar"
                                width={48}
                                height={48}
                                className="rounded-full"
                              />
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link href={`/profile/${user.username}`}>
                          <div className="flex items-baseline gap-2 hover:opacity-80 transition-opacity">
                            <h3 className="font-medium text-slate-800 dark:text-white truncate">
                              {user.name}
                            </h3>
                            <span className="text-sm text-muted-foreground">
                              @{user.username}
                            </span>
                          </div>
                        </Link>

                        {user.bio && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {user.bio}
                          </p>
                        )}

                        {(user.city || user.country_name) && (
                          <div className="flex items-center gap-1 mt-1">
                            <LuMapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {user.city && user.country_name
                                ? `${user.city}, ${user.country_name}`
                                : user.city || user.country_name}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{user.checkins_count} check-ins</span>
                          <span>{user.followers_count} followers</span>
                          <span>{user.following_count} following</span>
                        </div>
                      </div>

                      <Button
                        variant={user.is_following ? "outline" : "default"}
                        size="sm"
                        onClick={() =>
                          handleFollowToggle(user.username, user.is_following)
                        }
                        className="flex items-center gap-1"
                      >
                        <LuHeart className="w-3 h-3" />
                        {user.is_following ? "Unfollow" : "Follow"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      )}

      {!hasSearched && !isLoading && (
        <div className="text-center py-8">
          <LuSearch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-2">
            Search for users
          </h3>
          <p className="text-sm text-muted-foreground">
            Enter a name or username to find other concert-goers
          </p>
        </div>
      )}
    </div>
  );
}
