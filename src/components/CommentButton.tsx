"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LuMessageCircle } from "react-icons/lu";
import Image from "next/image";
import { formatRelativeTime } from "@/lib/helpers";

interface Comment {
  id: string;
  user: {
    id: string;
    name: string;
    username?: string;
    profile_photo_url?: string;
    image?: string;
  };
  comment?: string;
  text?: string;
  created_at?: string;
  date?: string;
  time?: string;
}

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
  checkInId,
  comments,
}: CommentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
                  return (
                    <div key={normalizedComment.id} className="flex gap-3 py-3">
                      <Image
                        src={normalizedComment.user.profile_photo_url}
                        alt={normalizedComment.user.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {normalizedComment.user.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(date, time)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
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
