"use client";

import { useState } from "react";
import Image from "next/image";
import { LuX } from "react-icons/lu";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";

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

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div
        className="relative cursor-pointer"
        onClick={() => setIsDialogOpen(true)}
      >
        <Image
          src={src}
          alt={alt}
          width={600}
          height={400}
          className={className}
          priority={priority}
        />
      </div>
      <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <div className="relative w-full h-[80vh]">
          <Image
            src={src}
            alt={alt}
            className="object-contain"
            fill
            sizes="(max-width: 1024px) 100vw, 80vw"
            priority
          />
          <DialogClose className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
            <LuX className="h-6 w-6" />
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
