"use client";

import { useState } from "react";
import CheckInCard from "@/components/CheckInCard";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

interface MockConcert {
  id: string;
  event: string;
  image: string;
  location: {
    id: string;
    name: string;
  };
  city: string;
  date: string;
  rating: number;
  artists: string[];
  genres: string[];
}

const mockConcerts: MockConcert[] = [
  {
    id: "1",
    event: "Graspop Metal Meeting",
    image: "/summer-festival.jpg",
    location: {
      id: "1",
      name: "Dessel",
    },
    city: "Belgium",
    date: "2025-05-30",
    rating: 3.5,
    artists: [
      "Sabaton",
      "Arch Enemy",
      "Children of Bodom",
      "Korn",
      "Iron Maiden",
      "Slipknot",
      "Lorna Shore",
      "Nine Inch Nails",
      "System of a Down",
    ],
    genres: ["Metal", "Rock", "Folk"],
  },
];

export function TimelineContent() {
  const [visibleCards, setVisibleCards] = useState(6);
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView) {
      setVisibleCards((prev) => prev + 3);
    }
  }, [inView]);

  return (
    <div className="space-y-6">
      {mockConcerts.slice(0, visibleCards).map((concert) => (
        <CheckInCard
          key={concert.id}
          user={{
            id: "1",
            name: "John Doe",
            username: "johndoe",
            image: "/profile.jpg",
          }}
          concert={concert}
          checkIn={{
            id: "1",
            date: "2025-05-30",
            time: "19:30",
            comment: "Great show! The atmosphere was amazing.",
            likes: 42,
            comments: [
              {
                id: "1",
                user: {
                  id: "2",
                  name: "Jane Smith",
                  image: "/profile2.jpg",
                },
                text: "I was there too! It was incredible!",
                date: "2025-05-30",
              },
            ],
          }}
        />
      ))}
      <div ref={ref} className="h-10" />
    </div>
  );
}
