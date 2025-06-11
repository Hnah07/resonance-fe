"use client";

import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { ConcertProperties } from "@/types/concert";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import CardSkeleton from "@/components/CardSkeleton";

const ConcertCard = dynamic(() => import("@/components/ConcertCard"), {
  loading: () => <CardSkeleton />,
  ssr: false,
});

interface ConcertListProps {
  initialConcerts: ConcertProperties[];
}

export function ConcertList({ initialConcerts }: ConcertListProps) {
  console.log(
    "ConcertList received concerts:",
    initialConcerts.slice(0, 3).map((c) => ({
      city: c.city,
      distance: c.distance,
    }))
  );

  const [visibleCards, setVisibleCards] = useState(6);
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  // Load more cards when scrolling
  useEffect(() => {
    if (inView && visibleCards < initialConcerts.length) {
      setTimeout(() => {
        setVisibleCards((prev) => Math.min(prev + 6, initialConcerts.length));
      }, 500);
    }
  }, [inView, visibleCards, initialConcerts.length]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {initialConcerts.slice(0, visibleCards).map((concert) => {
        console.log("Rendering concert card:", {
          city: concert.city,
          distance: concert.distance,
        });
        return (
          <Suspense key={concert.id} fallback={<CardSkeleton />}>
            <ConcertCard concert={concert} />
          </Suspense>
        );
      })}
      {visibleCards < initialConcerts.length && (
        <div ref={ref} className="h-4" />
      )}
    </div>
  );
}
