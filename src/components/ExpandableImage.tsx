"use client";

import { useState, useRef, useEffect, useMemo } from "react";
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
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const previousSrcRef = useRef<string>("");
  const loadedImagesRef = useRef<Set<string>>(new Set());

  // Memoize the full URL to prevent unnecessary recalculations
  const fullUrl = useMemo(() => getFullUrl(src), [src]);

  // Create a unified cache key that works for both mobile and desktop
  const cacheKey = useMemo(() => {
    // Extract the original path from the URL to create a consistent cache key
    const url = new URL(fullUrl, window.location.origin);
    if (url.pathname.startsWith("/api/proxy-image")) {
      // For proxy URLs, extract the original path from the query parameter
      const pathParam = url.searchParams.get("path");
      return pathParam || src;
    }
    // For direct URLs, use the pathname
    return url.pathname || src;
  }, [fullUrl, src]);

  // Check if image is already loaded in browser cache using the unified cache key
  const isImageCached = useMemo(() => {
    return loadedImagesRef.current.has(cacheKey);
  }, [cacheKey]);

  // Only reset states when src actually changes
  useEffect(() => {
    if (src !== previousSrcRef.current) {
      previousSrcRef.current = src;
      setError(false);
      setRetryCount(0);

      // If image is cached, mark it as loaded immediately
      if (isImageCached) {
        setImageLoaded(true);
      } else {
        setImageLoaded(false);
      }
    }
  }, [src, isImageCached]);

  // Don't render the image component if src is empty
  if (!src) {
    return (
      <div className={`${className} bg-muted flex items-center justify-center`}>
        <span className="text-muted-foreground">No image available</span>
      </div>
    );
  }

  const handleRetry = () => {
    setError(false);
    setImageLoaded(false);
    setRetryCount((prev) => prev + 1);
  };

  // Show fallback image when error occurs
  if (error) {
    return (
      <div
        className={`${className} bg-muted flex items-center justify-center cursor-pointer`}
        onClick={handleRetry}
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-2 bg-muted-foreground/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <span className="text-muted-foreground block text-sm">
            Failed to load image
          </span>
          <span className="text-xs text-muted-foreground block mt-1">
            {retryCount < 3
              ? `Tap to retry (${retryCount}/3)`
              : "Max retries reached"}
          </span>
        </div>
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
            !imageLoaded ? "animate-pulse bg-muted" : ""
          }`}
        >
          <Image
            ref={imageRef}
            src={fullUrl}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`${className} transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            onLoad={() => {
              setImageLoaded(true);
              // Add to loaded images set using the unified cache key
              loadedImagesRef.current.add(cacheKey);
            }}
            onError={() => {
              console.error("Image failed to load:", {
                url: fullUrl,
                originalSrc: src,
                cacheKey,
                retryCount,
              });

              // Only retry automatically for the first few attempts
              if (retryCount < 2) {
                setTimeout(() => {
                  handleRetry();
                }, 1000 * (retryCount + 1)); // Exponential backoff
              } else {
                setError(true);
              }
            }}
            quality={75}
            unoptimized={true}
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
            unoptimized={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
