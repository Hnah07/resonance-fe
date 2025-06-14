"use client";

import { LikeButton } from "./LikeButton";
import { CommentButton } from "./CommentButton";
import { Comment } from "@/types/comment";

interface CheckInCommentProps {
  comment: string;
  likes: number;
  comments: Comment[];
  isLiked?: boolean;
  onLike?: () => void;
  onComment?: (comment: Comment) => void;
  checkInId: string;
}

export function CheckInComment({
  comment,
  likes,
  comments,
  isLiked,
  onLike,
  onComment,
  checkInId,
}: CheckInCommentProps) {
  return (
    <div className="px-4 py-2 space-y-4">
      {/* Check-in comment */}
      {comment && (
        <p className="text-sm text-slate-700 dark:text-slate-300">{comment}</p>
      )}

      {/* Like and comment buttons */}
      <div className="flex items-center gap-4">
        <LikeButton count={likes} onClick={onLike} isLiked={isLiked} />
        <CommentButton
          count={comments.length}
          onAddComment={onComment || (() => {})}
          comments={comments}
          checkInId={checkInId}
        />
      </div>
    </div>
  );
}
