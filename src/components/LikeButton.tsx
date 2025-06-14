"use client";

import { LuHeart } from "react-icons/lu";
import { useState } from "react";

interface LikeButtonProps {
  count: number;
  onClick?: () => void;
  className?: string;
  isLiked?: boolean;
}

export function LikeButton({
  count,
  onClick,
  isLiked = false,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(count);

  const handleClick = () => {
    if (onClick) {
      onClick();
      setLiked(!liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center space-x-2 text-slate-500 hover:text-[#FF0086] transition-colors"
    >
      <LuHeart
        className={`w-5 h-5 ${
          liked ? "text-[#FF0086] fill-[#FF0086]" : "text-slate-400"
        }`}
      />
      <span className="text-sm">{likeCount}</span>
    </button>
  );
}
