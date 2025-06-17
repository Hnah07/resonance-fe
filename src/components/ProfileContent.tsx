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
import { useState, useEffect } from "react";
import { makeClientRequest } from "@/lib/api";
import { toast } from "sonner";
import CardSkeleton from "@/components/CardSkeleton";
import { useUser } from "@/lib/hooks/useUser";

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
    photos: Array<{
      id: string;
      url: string;
      caption: string | null;
    }>;
  };
}

export function ProfileContent() {
  const [activeTab, setActiveTab] = useState<
    "check-ins" | "photos" | "stats" | "friends"
  >("check-ins");
  const [checkIns, setCheckIns] = useState<ProfileCheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: isUserLoading } = useUser();

  // Add debug logging for user data
  useEffect(() => {
    console.log("[ProfileContent] User data:", {
      hasUser: !!user,
      userId: user?.id,
      userName: user?.name,
      hasCity: !!user?.city,
      city: user?.city,
      hasCountryId: !!user?.country_id,
      countryId: user?.country_id,
      hasCountryName: !!user?.country_name,
      countryName: user?.country_name,
    });
  }, [user]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const response = await makeClientRequest<ProfileCheckIn>(
          "/api/profile/check-ins"
        );

        if (response.data) {
          setCheckIns(response.data);
        } else {
          setCheckIns([]);
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
  }, []);

  return (
    <>
      <div className="flex items-center gap-2 mb-4 justify-center">
        <Avatar className="w-32 h-32 border-4 border-accent-cyan/50">
          {isUserLoading || !user ? (
            <div className="w-full h-full bg-muted animate-pulse rounded-full" />
          ) : user.profile_photo_url ? (
            <AvatarImage src={user.profile_photo_url} />
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
        {isUserLoading || !user ? (
          <>
            <div className="flex items-baseline gap-2">
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-4 w-48 bg-muted animate-pulse rounded" />
            <div className="flex gap-2">
              <LuMapPin className="w-4 h-4 text-muted-foreground" />
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                {user.name || "Anonymous"}
              </h1>
              <span className="text-sm text-muted-foreground self-center">
                @{user.username || "user"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {user.bio || "No bio yet"}
            </p>
            <div className="flex gap-2">
              <LuMapPin className="w-4 h-4" />
              <p className="text-sm text-muted-foreground">
                {user.city && user.country_name
                  ? `${user.city}, ${user.country_name}`
                  : user.city || user.country_name || "No location set"}
              </p>
            </div>
          </>
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
        {activeTab === "check-ins" &&
          (isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <TabCheckIns checkIns={checkIns} />
          ))}
        {activeTab === "photos" && (
          <TabPhotos isActive={activeTab === "photos"} />
        )}
        {activeTab === "stats" && <TabStats isActive={activeTab === "stats"} />}
        {activeTab === "friends" && <TabFriends />}
      </div>
    </>
  );
}
