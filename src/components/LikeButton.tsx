"use client";

import { LuHeart } from "react-icons/lu";

interface LikeButtonProps {
  count: number;
  onClick?: () => void;
  className?: string;
}

export function LikeButton({ count, onClick }: LikeButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-2 text-slate-500 hover:text-[#FF0086] transition-colors"
    >
      <LuHeart className="w-5 h-5 text-[#FF0086] fill-[#FF0086]" />
      <span className="text-sm">{count}</span>
    </button>
  );
}
