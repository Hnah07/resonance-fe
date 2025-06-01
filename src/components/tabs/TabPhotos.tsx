"use client";

import Image from "next/image";
import { useState } from "react";

const images = [
  {
    src: "/placeholder-concert.jpg",
    alt: "Concert venue",
  },
  {
    src: "/summer-festival.jpg",
    alt: "Summer festival",
  },
  {
    src: "/placeholder-avatar-user.jpg",
    alt: "User avatar",
  },
  {
    src: "/placeholder-concert.jpg",
    alt: "Resonance logo",
  },
  {
    src: "/summer-festival.jpg",
    alt: "Resonance logo",
  },
  {
    src: "/placeholder-avatar-user.jpg",
    alt: "Resonance logo",
  },
];

export function TabPhotos() {
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>(
    {}
  );

  const handleImageLoad = (src: string) => {
    setLoadedImages((prev) => ({ ...prev, [src]: true }));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="aspect-square bg-muted rounded-lg overflow-hidden relative group"
          >
            {/* Loading skeleton */}
            {!loadedImages[image.src] && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className={`
                object-cover transition-all duration-500
                ${
                  loadedImages[image.src]
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95"
                }
                group-hover:scale-105
              `}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onLoadingComplete={() => handleImageLoad(image.src)}
              priority={index < 2} // Prioritize loading first two images
            />
          </div>
        ))}
      </div>
    </div>
  );
}
