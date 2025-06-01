"use client";

import { Card } from "@/components/ui/card";
import { StatModal } from "@/components/ui/stat-modal";
import { useState } from "react";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  details?: string;
}

export const StatCard = ({ icon, title, value, details }: StatCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card
        className="p-4 flex flex-col items-center gap-2 bg-background/50 hover:bg-background/80 transition-colors border-2 border-accent-cyan/30 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="text-accent-cyan">{icon}</div>
        <div
          className="text-sm font-medium text-center w-full truncate px-1"
          title={String(value)}
        >
          {value}
        </div>
        <div
          className="text-xs text-muted-foreground text-center w-full px-1"
          title={title}
        >
          {title}
        </div>
      </Card>

      <StatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
        value={value}
        icon={icon}
        details={details}
      />
    </>
  );
};
