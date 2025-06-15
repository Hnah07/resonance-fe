"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import CheckInCard from "@/components/CheckInCard";
import { useInView } from "react-intersection-observer";
import CardSkeleton from "@/components/CardSkeleton";
import { toast } from "sonner";

interface TimelineCheckIn {
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
    isLiked: boolean;
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

interface TimelineResponse {
  checkIns: Array<{
    id: string;
    user: {
      id: string;
      name: string | null;
      username: string;
      image: string | null;
    };
    concert: {
      id: string;
      event: string;
      location: {
        id: string;
        name: string;
      };
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
      isLiked: boolean;
      comments: Array<{
        id: string;
        user: {
          id: string;
          name: string;
          image: string | null;
        };
        text: string;
        date: string;
      }>;
    };
  }>;
}

interface TimelineContentProps {
  initialData: {
    checkIns: TimelineCheckIn[];
  };
}

export function TimelineContent({ initialData }: TimelineContentProps) {
  const [checkIns, setCheckIns] = useState<TimelineCheckIn[]>(
    initialData.checkIns
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const nextPageRef = useRef(1);
  const checkInsMap = useRef(new Map<string, TimelineCheckIn>());
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  // Initialize checkInsMap with initial data
  useEffect(() => {
    checkInsMap.current.clear();
    initialData.checkIns.forEach((checkIn) => {
      checkInsMap.current.set(checkIn.id, checkIn);
    });
  }, [initialData.checkIns]);

  const transformCheckIn = (
    checkIn: TimelineResponse["checkIns"][0]
  ): TimelineCheckIn => ({
    ...checkIn,
    user: {
      ...checkIn.user,
      name: checkIn.user.name || undefined,
      image: checkIn.user.image || undefined,
    },
    checkIn: {
      ...checkIn.checkIn,
      isLiked: checkIn.checkIn.isLiked,
      comments: checkIn.checkIn.comments.map((comment) => ({
        ...comment,
        user: {
          ...comment.user,
          image: comment.user.image || undefined,
        },
        time: new Date(comment.date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      })),
    },
  });

  const fetchCheckIns = useCallback(async (pageNum: number) => {
    try {
      const response = await fetch(`/api/timeline?page=${pageNum}`, {
        credentials: "include",
        next: { revalidate: 30 },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 404) {
          throw new Error(
            "Timeline feature is not available yet. Please check back later."
          );
        }
        throw new Error(
          errorData?.message || `Failed to fetch timeline (${response.status})`
        );
      }

      const data = (await response.json()) as TimelineResponse;
      const newCheckIns = (data.checkIns || [])
        .map(transformCheckIn)
        .filter((checkIn) => !checkInsMap.current.has(checkIn.id));

      // Add new check-ins to the map
      newCheckIns.forEach((checkIn) => {
        checkInsMap.current.set(checkIn.id, checkIn);
      });

      if (pageNum === 1) {
        checkInsMap.current.clear();
        newCheckIns.forEach((checkIn) => {
          checkInsMap.current.set(checkIn.id, checkIn);
        });
        setCheckIns(newCheckIns);
      } else {
        setCheckIns((prev) => [...prev, ...newCheckIns]);
      }

      setHasMore(newCheckIns.length > 0);
      setError(null);
    } catch (err) {
      console.error("Error fetching timeline:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch timeline");
      toast.error(
        err instanceof Error ? err.message : "Failed to load timeline data"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load more when scrolling
  useEffect(() => {
    if (inView && !isLoading && hasMore) {
      const nextPage = nextPageRef.current + 1;
      nextPageRef.current = nextPage;
      fetchCheckIns(nextPage);
    }
  }, [inView, isLoading, hasMore, fetchCheckIns]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="text-red-500 mb-4">
          <p className="font-medium">Unable to load timeline</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
        <button
          onClick={() => {
            setError(null);
            setIsLoading(true);
            fetchCheckIns(1);
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading && checkIns.length === 0) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (checkIns.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No check-ins found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Start checking in to concerts to see them here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {checkIns.map((checkIn) => (
        <CheckInCard
          key={checkIn.id}
          user={checkIn.user}
          concert={checkIn.concert}
          checkIn={checkIn.checkIn}
        />
      ))}
      {hasMore && (
        <div ref={ref} className="h-10">
          {isLoading && <CardSkeleton />}
        </div>
      )}
    </div>
  );
}
