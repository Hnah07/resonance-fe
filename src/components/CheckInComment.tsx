"use client";

import { LikeButton } from "./LikeButton";
import { CommentsSection } from "./CommentsSection";

interface Comment {
  id: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  text: string;
  date: string;
}

interface CheckInCommentProps {
  comment: string;
  likes: number;
  comments: Comment[];
  onLike?: () => void;
  onComment?: () => void;
}

export function CheckInComment({
  comment,
  likes,
  comments,
  onLike,
  onComment,
}: CheckInCommentProps) {
  return (
    <div className="p-4">
      <p className="text-slate-700 dark:text-slate-300 mb-4">{comment}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <LikeButton count={likes} onClick={onLike} />
          <CommentsSection
            comments={comments}
            count={comments.length}
            onComment={onComment}
          />
        </div>
      </div>
    </div>
  );
}
