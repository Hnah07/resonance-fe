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
  onUpdateComments?: (comments: Comment[]) => void;
  checkInId: string;
}

export function CheckInComment({
  comment,
  likes,
  comments,
  isLiked,
  onLike,
  onComment,
  onUpdateComments,
  checkInId,
}: CheckInCommentProps) {
  const handleAddComment = (newComment: {
    id: string;
    comment: string;
    created_at: string;
    user: {
      id: string;
      name: string;
      username: string;
      profile_photo_url: string;
    };
  }) => {
    if (onComment) {
      onComment({
        ...newComment,
        text: newComment.comment,
        date: newComment.created_at.split("T")[0],
        time: new Date(newComment.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }
  };

  const handleUpdateComments = (updatedComments: Comment[]) => {
    if (onUpdateComments) {
      onUpdateComments(updatedComments);
    }
  };

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
          onAddComment={handleAddComment}
          onUpdateComments={handleUpdateComments}
          comments={comments}
          checkInId={checkInId}
        />
      </div>
    </div>
  );
}
