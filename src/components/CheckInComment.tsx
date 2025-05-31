"use client";

import { LikeButton } from "./LikeButton";
import { CommentButton } from "./CommentButton";
import { Comment } from "@/types/comment";

interface CheckInCommentProps {
  comment: string;
  likes: number;
  comments: Comment[];
  onLike?: () => void;
  onComment?: (comment: Comment) => void;
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
          <CommentButton
            count={comments.length}
            onAddComment={onComment || (() => {})}
            comments={comments}
          />
        </div>
      </div>
    </div>
  );
}
