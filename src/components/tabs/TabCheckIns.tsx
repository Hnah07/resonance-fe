"use client";

import CheckInCard from "@/components/CheckInCard";

interface TabCheckInsProps {
  checkIns: {
    user: {
      id: string;
      name?: string;
      username: string;
      image?: string;
    };
    concert: {
      id: string;
      event: string;
      location: string;
      city: string;
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
      comments: {
        id: string;
        user: {
          id: string;
          name: string;
          image?: string;
        };
        text: string;
        date: string;
      }[];
    };
  }[];
}

export function TabCheckIns({ checkIns }: TabCheckInsProps) {
  return (
    <div className="space-y-6">
      {checkIns.map((checkIn) => (
        <CheckInCard
          key={checkIn.checkIn.id}
          user={checkIn.user}
          concert={checkIn.concert}
          checkIn={checkIn.checkIn}
        />
      ))}
    </div>
  );
}
