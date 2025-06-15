"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LuMessageCircle, LuTrash2 } from "react-icons/lu";
import Image from "next/image";
import { formatRelativeTime } from "@/lib/helpers";
import { useUser } from "@/lib/hooks/useUser";
import { Comment } from "@/types/comment";

interface CommentButtonProps {
  count: number;
  onAddComment: (comment: {
    id: string;
    comment: string;
    created_at: string;
    user: {
      id: string;
      name: string;
      username: string;
      profile_photo_url: string;
    };
  }) => void;
  onUpdateComments: (comments: Comment[]) => void;
  checkInId: string;
  comments: Comment[];
}

function parseCommentDate(createdAt: string): { date: string; time: string } {
  try {
    // First try parsing as ISO string
    const date = new Date(createdAt);
    if (!isNaN(date.getTime())) {
      return {
        date: date.toISOString().split("T")[0],
        time: date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    }

    // If that fails, try parsing as a timestamp
    const timestamp = parseInt(createdAt);
    if (!isNaN(timestamp)) {
      const date = new Date(timestamp);
      return {
        date: date.toISOString().split("T")[0],
        time: date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    }

    // If all parsing fails, return current date/time
    console.error("Could not parse date:", createdAt);
    const now = new Date();
    return {
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  } catch (error) {
    console.error("Error parsing date:", createdAt, error);
    const now = new Date();
    return {
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  }
}

function normalizeComment(comment: Comment): {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    profile_photo_url: string;
  };
  comment: string;
  created_at: string;
} {
  return {
    id: comment.id,
    user: {
      id: comment.user.id,
      name: comment.user.name,
      username: comment.user.username || "",
      profile_photo_url:
        comment.user.profile_photo_url ||
        comment.user.image ||
        "/placeholder-avatar-user.jpg",
    },
    comment: comment.comment || comment.text || "",
    created_at: comment.created_at || `${comment.date}T${comment.time}`,
  };
}

export function CommentButton({
  count,
  onAddComment,
  onUpdateComments,
  checkInId,
  comments,
}: CommentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isLoading, error } = useUser();

  // Add debug logging for user state
  useEffect(() => {
    console.log("CommentButton - User state changed:", {
      user,
      isLoading,
      error,
    });
  }, [user, isLoading, error]);

  // Add debug logging for comment rendering
  useEffect(() => {
    console.log("CommentButton - Comments changed:", comments);
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/checkin-comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkin_id: checkInId,
          comment: commentText.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to post comment");
      }

      const data = await response.json();
      onAddComment({
        id: data.id,
        user: {
          id: data.user.id,
          name: data.user.name,
          username: data.user.username,
          profile_photo_url: data.user.profile_photo_url,
        },
        comment: data.comment,
        created_at: data.created_at,
      });

      setCommentText("");
      toast.success("Comment posted successfully");
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to post comment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/checkin-comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        let errorMessage = "Failed to delete comment";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If we can't parse the error JSON, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Remove the comment from the list
      const updatedComments = comments.filter((c) => c.id !== commentId);

      // Update the parent component with the new comments list
      onUpdateComments(updatedComments);

      toast.success("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete comment"
      );
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
        onClick={() => setIsOpen(true)}
      >
        <LuMessageCircle className="w-4 h-4" />
        <span>{count}</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-background p-6 shadow-lg max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Comments</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments.map((comment) => {
                  const normalizedComment = normalizeComment(comment);
                  const { date, time } = parseCommentDate(
                    normalizedComment.created_at
                  );

                  // More detailed logging for each comment
                  const isOwnComment = user?.id === normalizedComment.user.id;
                  console.log("Comment debug:", {
                    commentId: normalizedComment.id,
                    commentUserId: normalizedComment.user.id,
                    currentUserId: user?.id,
                    isOwnComment,
                    userName: normalizedComment.user.name,
                    currentUserName: user?.name,
                    userState: { user, isLoading, error },
                  });

                  return (
                    <div
                      key={normalizedComment.id}
                      className="flex gap-3 py-3 group relative hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg px-2"
                    >
                      <Image
                        src={normalizedComment.user.profile_photo_url}
                        alt={normalizedComment.user.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {normalizedComment.user.name}
                              {isOwnComment && " (you)"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(date, time)}
                            </span>
                          </div>
                          {isLoading ? (
                            <div className="w-4 h-4 animate-pulse bg-slate-200 dark:bg-slate-700 rounded-full" />
                          ) : isOwnComment ? (
                            <button
                              onClick={() =>
                                handleDeleteComment(normalizedComment.id)
                              }
                              className="p-1.5 hover:bg-destructive/10 rounded-full text-destructive border border-destructive/20"
                              title="Delete comment"
                            >
                              <LuTrash2 className="w-4 h-4" />
                            </button>
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 break-words">
                          {normalizedComment.comment}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your comment..."
                className="min-h-[40px] resize-none"
                disabled={isSubmitting}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !commentText.trim()}
                >
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
