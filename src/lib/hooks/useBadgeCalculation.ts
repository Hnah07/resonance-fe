import { useState, useRef, useEffect } from "react";

interface UseBadgeCalculationProps {
  items: string[];
  minVisible?: number;
  gap?: number;
}

interface UseBadgeCalculationReturn {
  visibleItems: string[];
  hiddenItems: string[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  badgeRef: React.RefObject<HTMLSpanElement | null>;
}

export function useBadgeCalculation({
  items,
  minVisible = 2,
  gap = 8,
}: UseBadgeCalculationProps): UseBadgeCalculationReturn {
  const [visibleCount, setVisibleCount] = useState(minVisible);
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const calculateVisibleBadges = () => {
      if (!containerRef.current || !badgeRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const badgeWidth = badgeRef.current.offsetWidth;

      const maxBadges = Math.floor((containerWidth + gap) / (badgeWidth + gap));

      // Always show at least minVisible badges, and at most all badges
      setVisibleCount(Math.max(minVisible, Math.min(maxBadges, items.length)));
    };

    calculateVisibleBadges();
    window.addEventListener("resize", calculateVisibleBadges);
    return () => window.removeEventListener("resize", calculateVisibleBadges);
  }, [items.length, minVisible, gap]);

  const visibleItems = items.slice(0, visibleCount);
  const hiddenItems = items.slice(visibleCount);

  return {
    visibleItems,
    hiddenItems,
    containerRef,
    badgeRef,
  };
}
