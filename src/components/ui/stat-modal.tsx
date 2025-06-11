"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface StatModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  value: string | number;
  icon: React.ReactNode;
  details?: string;
}

export const StatModal = ({
  isOpen,
  onClose,
  title,
  value,
  icon,
  details,
}: StatModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-accent-cyan">{icon}</span>
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="text-2xl font-semibold mb-2">{value}</div>
          {details && (
            <p className="text-sm text-muted-foreground">{details}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
