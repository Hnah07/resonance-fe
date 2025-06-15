"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatCard } from "@/components/StatCard";
import { TabCheckIns } from "@/components/tabs/TabCheckIns";
import { TabPhotos } from "@/components/tabs/TabPhotos";
import { TabStats } from "@/components/tabs/TabStats";
import { TabFriends } from "@/components/tabs/TabFriends";
import Image from "next/image";
import {
  LuMapPin,
  LuMusic,
  LuGlobe,
  LuCalendar,
  LuHeart,
  LuStar,
  LuTicket,
} from "react-icons/lu";
import { DetailsButton } from "@/components/ui/details-button";
import { useState } from "react";

export function ProfileContent() {
  const [activeTab, setActiveTab] = useState<
    "check-ins" | "photos" | "stats" | "friends"
  >("check-ins");

  // Mock data for check-ins
  const mockCheckIns = [
    {
      user: {
        id: "1",
        name: "John Doe",
        username: "johndoe",
        image: "/placeholder-avatar-user.jpg",
      },
      concert: {
        id: "1",
        event: "Metallica World Tour 2024",
        location: {
          id: "1",
          name: "Sportpaleis",
        },
        city: "Antwerp",
        country: "Belgium",
        image: "/placeholder-concert.jpg",
        date: "2024-03-15",
        rating: 5,
        artists: ["Metallica", "Five Finger Death Punch"],
        genres: ["Metal", "Heavy Metal"],
      },
      checkIn: {
        id: "1",
        date: "2024-03-15",
        time: "20:00",
        comment:
          "Incredible show! The energy was amazing and the setlist was perfect. James Hetfield's voice was on point!",
        likes: 42,
        comments: [],
      },
    },
    {
      user: {
        id: "1",
        name: "John Doe",
        username: "johndoe",
        image: "/placeholder-avatar-user.jpg",
      },
      concert: {
        id: "2",
        event: "Tomorrowland 2024",
        location: {
          id: "2",
          name: "De Schorre",
        },
        city: "Boom",
        country: "Belgium",
        image: "/placeholder-concert.jpg",
        date: "2024-02-20",
        rating: 4,
        artists: [
          "Johan Gielen",
          "Martin Garrix",
          "David Guetta",
          "Armin van Buuren",
        ],
        genres: ["EDM", "House", "Trance"],
      },
      checkIn: {
        id: "2",
        date: "2024-02-20",
        time: "14:00",
        comment:
          "Best festival experience ever! The production was mind-blowing and the atmosphere was electric.",
        likes: 89,
        comments: [],
      },
    },
  ];

  const image = "/placeholder-avatar-user.jpg";

  return (
    <>
      <div className="flex items-center gap-2 mb-4 justify-center">
        <Avatar className="w-32 h-32 border-4 border-accent-cyan/50">
          <AvatarImage src={image} />
          <AvatarFallback>
            <Image
              src="/placeholder-avatar-user.jpg"
              alt="Placeholder avatar"
              width={128}
              height={128}
              className="rounded-full"
            />
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-col items-center gap-4 text-accent-cyan mb-8">
        <p className="text-sm text-muted-foreground">
          I am a metalhead, but also into house music
        </p>
        <div className="flex gap-2">
          <LuMapPin className="w-4 h-4" />
          <p className="text-sm text-muted-foreground">Mortsel, Belgium</p>
        </div>
      </div>

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
        {activeTab === "check-ins" && <TabCheckIns checkIns={mockCheckIns} />}
        {activeTab === "photos" && <TabPhotos />}
        {activeTab === "stats" && <TabStats />}
        {activeTab === "friends" && <TabFriends />}
      </div>
    </>
  );
}
