"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TabCheckIns } from "@/components/tabs/TabCheckIns";
import { TabPhotos } from "@/components/tabs/TabPhotos";
import { TabStats } from "@/components/tabs/TabStats";
import { TabFriends } from "@/components/tabs/TabFriends";
import { SummaryStatCards } from "@/components/SummaryStatCards";
import Image from "next/image";
import { LuMapPin } from "react-icons/lu";
import { DetailsButton } from "@/components/ui/details-button";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { makeClientRequest } from "@/lib/api";
import { toast } from "sonner";
import CardSkeleton from "@/components/CardSkeleton";
import { useUser } from "@/lib/hooks/useUser";

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

interface ProfileCheckIn {
  id: string;
  user: {
    id: string;
    name?: string;
    username: string;
    image?: string;
  };
  concert: {
    id: string;
    event: string;
    location: {
      id: string;
      name: string;
    };
    city: string;
    country: string;
    image: string;
    date: string;
    rating: number;
    artists: (
      | string
      | { id?: string; name: string; type?: string; image_url?: string }
    )[];
    genres: (
      | string
      | { id?: string; name: string; type?: string; image_url?: string }
    )[];
  };
  date: string;
  time: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  comments: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      image?: string;
    };
    text: string;
    date: string;
    time: string;
  }>;
  photos: Array<{
    id: string;
    url: string;
    caption: string | null;
  }>;
  is_liked: boolean;
  rating: number | null;
  review: string | null;
}

interface UserProfileContentProps {
  username: string;
}

export function UserProfileContent({ username }: UserProfileContentProps) {
  const [activeTab, setActiveTab] = useState<
    "check-ins" | "photos" | "stats" | "friends"
  >("check-ins");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checkIns, setCheckIns] = useState<ProfileCheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useUser();

  const fetchProfileData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch profile data first
      const profileResponse = await makeClientRequest<UserProfile>(
        `/api/users/${username}`
      );

      let profileData: UserProfile | null = null;

      // Handle the array structure: {data: [{data: {...}}]}
      if (
        Array.isArray(profileResponse.data) &&
        profileResponse.data.length > 0
      ) {
        const firstItem = profileResponse.data[0];
        if (firstItem && typeof firstItem === "object" && "data" in firstItem) {
          profileData = firstItem.data as UserProfile;
        } else {
          profileData = firstItem as UserProfile;
        }
      } else if (
        profileResponse.data &&
        typeof profileResponse.data === "object" &&
        "data" in profileResponse.data
      ) {
        profileData = profileResponse.data.data as UserProfile;
      } else if (
        "data" in profileResponse &&
        !Array.isArray(profileResponse.data)
      ) {
        profileData = profileResponse.data;
      }

      if (profileData) {
        setProfile(profileData);
      } else {
        // User not found
        setProfile(null);
        toast.error(`User @${username} not found`);
        return;
      }

      // Try to fetch check-ins data, but don't fail if it doesn't work
      try {
        console.log(
          "UserProfileContent - Fetching check-ins for username:",
          username
        );
        const checkInsResponse = await makeClientRequest<ProfileCheckIn>(
          `/api/users/${username}/check-ins`
        );
        console.log(
          "UserProfileContent - Check-ins response:",
          checkInsResponse
        );

        if (checkInsResponse && checkInsResponse.data) {
          // Ensure we always set an array
          const checkInsData = Array.isArray(checkInsResponse.data)
            ? checkInsResponse.data
            : [checkInsResponse.data];

          console.log(
            "UserProfileContent - Check-ins data count:",
            checkInsData.length
          );

          // Transform the data to ensure artists and genres are strings
          const transformedCheckIns = checkInsData.map((item) => {
            const result = {
              ...item,
              // Add time field if not present
              time:
                item.time ||
                (item.created_at
                  ? new Date(item.created_at).toLocaleTimeString()
                  : ""),
              concert: {
                ...item.concert,
                // Keep artists and genres as objects for filters
                artists: item.concert?.artists || [],
                genres: item.concert?.genres || [],
              },
            };

            return result;
          });

          console.log(
            "UserProfileContent - Setting check-ins:",
            transformedCheckIns.length
          );
          setCheckIns(transformedCheckIns);
        } else {
          console.log("UserProfileContent - No check-ins data found");
          setCheckIns([]);
        }
      } catch (checkInsError) {
        console.error(
          "UserProfileContent - Failed to fetch check-ins data:",
          checkInsError
        );
        // Don't show error toast for check-ins failure, just log it
        setCheckIns([]);
      }
    } catch (err) {
      console.error("Error fetching profile data:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load profile data";

      // Check if it's a 404 error (user not found)
      if (
        errorMessage.includes("404") ||
        errorMessage.includes("No query results")
      ) {
        toast.error(`User @${username} not found`);
        setProfile(null);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleFollowToggle = async () => {
    if (!profile) return;

    console.log(
      "handleFollowToggle - Current is_following:",
      profile.is_following
    );
    console.log("handleFollowToggle - User ID:", username);

    try {
      const method = profile.is_following ? "DELETE" : "POST";
      console.log("handleFollowToggle - Using method:", method);

      const response = await fetch(`/api/users/${username}/follow`, {
        method,
        credentials: "include",
      });

      console.log("handleFollowToggle - Response status:", response.status);

      if (response.status === 409) {
        // Conflict - user is already in the desired state, just refresh data
        console.log("Follow state conflict - refreshing profile data");
        await fetchProfileData();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.log("handleFollowToggle - Error response:", errorText);
        throw new Error("Failed to update follow status");
      }

      const data = await response.json();
      console.log("handleFollowToggle - Success response:", data);

      if (data) {
        // Refresh the profile data to get the updated follow status and counts
        await fetchProfileData();
        toast.success(
          profile.is_following
            ? "Unfollowed successfully"
            : "Followed successfully"
        );
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update follow status"
      );
    }
  };

  // console.log("UserProfileContent - Rendering with profile:", profile);
  // console.log("UserProfileContent - Current user:", currentUser);
  // console.log(
  //   "UserProfileContent - Profile is_current_user:",
  //   profile?.is_current_user
  // );
  // console.log(
  //   "UserProfileContent - Should show follow button:",
  //   !profile?.is_current_user && currentUser
  // );
  // console.log(
  //   "UserProfileContent - Profile is_following:",
  //   profile?.is_following
  // );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4 justify-center">
          <div className="w-32 h-32 bg-muted animate-pulse rounded-full" />
        </div>
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center">
            <span className="text-4xl">👤</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
              User not found
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              The user @{username} doesn&apos;t exist or has been removed.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Check the username and try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-4 justify-center">
        <Avatar className="w-32 h-32 border-4 border-accent-cyan/50">
          {profile.profile_photo_url ? (
            <AvatarImage src={profile.profile_photo_url} />
          ) : (
            <AvatarFallback>
              <Image
                src="/placeholder-avatar-user.jpg"
                alt="Placeholder avatar"
                width={128}
                height={128}
                className="rounded-full"
              />
            </AvatarFallback>
          )}
        </Avatar>
      </div>
      <div className="flex flex-col items-center gap-4 text-accent-cyan mb-8">
        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            {profile.name}
          </h1>
          <span className="text-sm text-muted-foreground self-center">
            @{profile.username}
          </span>
        </div>
        {profile.bio && (
          <p className="text-sm text-muted-foreground">{profile.bio}</p>
        )}
        {(profile.city || profile.country_name) && (
          <div className="flex gap-2">
            <LuMapPin className="w-4 h-4" />
            <p className="text-sm text-muted-foreground">
              {profile.city && profile.country_name
                ? `${profile.city}, ${profile.country_name}`
                : profile.city || profile.country_name}
            </p>
          </div>
        )}
        {!profile.is_current_user && currentUser && (
          <Button
            onClick={handleFollowToggle}
            variant={profile.is_following ? "outline" : "default"}
            className="mt-2"
          >
            {profile.is_following ? "Unfollow" : "Follow"}
          </Button>
        )}
      </div>

      <SummaryStatCards username={username} profile={profile} />

      <div className="flex flex-wrap gap-2 justify-center mb-8 px-4">
        <DetailsButton
          isActive={activeTab === "check-ins"}
          onClick={() => setActiveTab("check-ins")}
          className="min-w-[100px]"
        >
          Check-Ins
        </DetailsButton>
        <DetailsButton
          isActive={activeTab === "photos"}
          onClick={() => setActiveTab("photos")}
          className="min-w-[100px]"
        >
          Photos
        </DetailsButton>
        <DetailsButton
          isActive={activeTab === "stats"}
          onClick={() => setActiveTab("stats")}
          className="min-w-[100px]"
        >
          Stats
        </DetailsButton>
        <DetailsButton
          isActive={activeTab === "friends"}
          onClick={() => setActiveTab("friends")}
          className="min-w-[100px]"
        >
          Friends
        </DetailsButton>
      </div>

      {/* Tab Contents */}
      <div className="max-w-2xl mx-auto">
        {activeTab === "check-ins" && (
          <TabCheckIns checkIns={checkIns} showFilter={false} />
        )}
        {activeTab === "photos" && (
          <TabPhotos isActive={activeTab === "photos"} username={username} />
        )}
        {activeTab === "stats" && (
          <TabStats isActive={activeTab === "stats"} username={username} />
        )}
        {activeTab === "friends" && <TabFriends username={username} />}
      </div>
    </>
  );
}
