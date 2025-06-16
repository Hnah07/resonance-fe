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
import { useState, useEffect } from "react";
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
    artists: string[];
    genres: string[];
  };
  checkIn: {
    id: string;
    date: string;
    time: string;
    comment: string;
    likes: number;
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
  };
}

interface UserProfileContentProps {
  userId: string;
}

export function UserProfileContent({ userId }: UserProfileContentProps) {
  const [activeTab, setActiveTab] = useState<
    "check-ins" | "photos" | "stats" | "friends"
  >("check-ins");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checkIns, setCheckIns] = useState<ProfileCheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const { user: currentUser } = useUser();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const [profileResponse, checkInsResponse] = await Promise.all([
          makeClientRequest<UserProfile>(`/api/users/${userId}`),
          makeClientRequest<ProfileCheckIn>(`/api/users/${userId}/check-ins`),
        ]);

        let profileData: UserProfile | null = null;
        if ("data" in profileResponse && !Array.isArray(profileResponse.data)) {
          profileData = profileResponse.data;
        } else if (Array.isArray(profileResponse.data)) {
          profileData = profileResponse.data[0];
        }

        if (profileData) {
          setProfile(profileData);
          setIsFollowing(profileData.is_following);
        }

        if (checkInsResponse.data) {
          setCheckIns(checkInsResponse.data);
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to load profile data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  const handleFollowToggle = async () => {
    if (!profile) return;

    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update follow status");
      }

      const data = await response.json();
      if (data) {
        setIsFollowing(!isFollowing);
        setProfile((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            followers_count: isFollowing
              ? prev.followers_count - 1
              : prev.followers_count + 1,
          };
        });
        toast.success(
          isFollowing ? "Unfollowed successfully" : "Followed successfully"
        );
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update follow status"
      );
    }
  };

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
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
          User not found
        </h2>
        <p className="text-muted-foreground mt-2">
          The user you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
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
            variant={isFollowing ? "outline" : "default"}
            className="mt-2"
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </Button>
        )}
      </div>

      <SummaryStatCards />

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
        {activeTab === "check-ins" && <TabCheckIns checkIns={checkIns} />}
        {activeTab === "photos" && (
          <TabPhotos isActive={activeTab === "photos"} userId={userId} />
        )}
        {activeTab === "stats" && (
          <TabStats isActive={activeTab === "stats"} userId={userId} />
        )}
        {activeTab === "friends" && <TabFriends userId={userId} />}
      </div>
    </>
  );
}
