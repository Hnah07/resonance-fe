"use client";

import { LuMessageCircle } from "react-icons/lu";

interface CommentButtonProps {
  count: number;
  onClick?: () => void;
  className?: string;
}

export function CommentButton({ count, onClick }: CommentButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-2 text-slate-500 hover:text-[#03D1FE] transition-colors"
    >
      <LuMessageCircle className="w-5 h-5" />
      <span className="text-sm">{count}</span>
    </button>
  );
}
