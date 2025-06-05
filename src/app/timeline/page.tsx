"use client";

import { PageHeader } from "@/components/PageHeader";
import { GradientButton } from "@/components/ui/gradient-button";
import CardSkeleton from "@/components/CardSkeleton";
import dynamic from "next/dynamic";
import { useInView } from "react-intersection-observer";
import { useEffect, useState, Suspense } from "react";

const CheckInCard = dynamic(() => import("@/components/CheckInCard"), {
  loading: () => <CardSkeleton />,
  ssr: false,
});

const TimelinePage = () => {
  const [visibleCards, setVisibleCards] = useState(6);
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView && visibleCards < 10) {
      setTimeout(() => {
        setVisibleCards((prev) => Math.min(prev + 6, 10));
      }, 500);
    }
  }, [inView, visibleCards]);

  // This will be from the API
  const hasCheckIns = true;

  return (
    <>
      <div className="flex flex-col items-center mb-12">
        <PageHeader title="Timeline" subtitle="See what everyone is up to" />
        <GradientButton>+ Check In</GradientButton>
      </div>
      {hasCheckIns ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {Array.from({ length: visibleCards }).map((_, index) => (
            <Suspense key={index} fallback={<CardSkeleton />}>
              <CheckInCard
                user={{ id: "1", name: "Jan Lebbe", username: "j_lebbe" }}
                concert={{
                  id: "1",
                  event: "Graspop Metal Meeting",
                  image: "/summer-festival.jpg",
                  location: "Dessel",
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
                    "Linkin Park",
                    "Disturbed",
                    "Avenged Sevenfold",
                    "Megadeth",
                    "Anthrax",
                    "Slayer",
                    "Metallica",
                  ],
                  genres: ["Metal", "Rock", "Folk"],
                }}
                checkIn={{
                  id: "1",
                  date: "2025-05-30",
                  time: "16:00",
                  comment: "Damn, what a festival!",
                  likes: 10,
                  comments: [
                    {
                      id: "1",
                      user: { id: "1", name: "John Doe" },
                      text: "Damn, what a festival!",
                      date: "2025-05-30",
                    },
                    {
                      id: "2",
                      user: { id: "2", name: "Jane Doe" },
                      text: "I loved it!",
                      date: "2025-05-30",
                    },
                  ],
                }}
              />
            </Suspense>
          ))}
          {visibleCards < 10 && <div ref={ref} className="h-4" />}
        </div>
      ) : (
        <div className="text-center text-gray-600 mt-8">
          <p className="text-lg">
            No check-ins yet. Go to a concert and start getting friends!
          </p>
        </div>
      )}
    </>
  );
};

export default TimelinePage;
