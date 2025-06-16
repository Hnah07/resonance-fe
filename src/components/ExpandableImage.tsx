"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getFullUrl } from "@/lib/urls";

interface ExpandableImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function ExpandableImage({
  src,
  alt,
  className = "w-full h-80 object-cover",
  priority = false,
}: ExpandableImageProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Don't render the image component if src is empty
  if (!src) {
    return (
      <div className={`${className} bg-muted flex items-center justify-center`}>
        <span className="text-muted-foreground">No image available</span>
      </div>
    );
  }

  // Construct the full URL for the image
  const fullUrl = getFullUrl(src);

  if (error) {
    return (
      <div className={`${className} bg-muted flex items-center justify-center`}>
        <span className="text-muted-foreground">Failed to load image</span>
      </div>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div
        className="relative cursor-pointer w-full h-full"
        onClick={() => setIsDialogOpen(true)}
      >
        <div
          className={`relative w-full h-full ${
            isLoading ? "animate-pulse bg-muted" : ""
          }`}
        >
          <Image
            src={fullUrl}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`${className} transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            onLoad={() => setIsLoading(false)}
            onError={() => setError(true)}
            quality={75}
          />
        </div>
      </div>
      <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <div className="relative w-full h-[80vh]">
          <Image
            src={fullUrl}
            alt={alt}
            className="object-contain"
            fill
            sizes="(max-width: 1024px) 100vw, 80vw"
            priority
            quality={90}
            onError={() => setError(true)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
