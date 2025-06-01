"use client";

import { LuMessageCircle } from "react-icons/lu";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useState } from "react";
import { formatRelativeTime } from "@/lib/helpers";
import { Comment } from "@/types/comment";

interface CommentButtonProps {
  count: number;
  onAddComment: (comment: Comment) => void;
  comments?: Comment[];
}

export function CommentButton({
  count,
  onAddComment,
  comments = [],
}: CommentButtonProps) {
  const [commentText, setCommentText] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = () => {
    if (!commentText.trim()) return;

    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().split(" ")[0].slice(0, 5);

    onAddComment({
      id: crypto.randomUUID(),
      user: {
        id: "current-user", // TODO: Get from auth context
        name: "Current User", // TODO: Get from auth context
      },
      text: commentText,
      date,
      time,
    });

    setCommentText("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="flex items-center text-slate-500 hover:text-[#03D1FE] hover:bg-transparent transition-colors"
        >
          <LuMessageCircle className="w-5 h-5" />
          <span className="text-sm">{count}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Add a comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button onClick={handleSubmit} disabled={!commentText.trim()}>
              Post
            </Button>
          </div>
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {[...comments]
              .sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time}`);
                const dateB = new Date(`${b.date}T${b.time}`);
                return dateB.getTime() - dateA.getTime();
              })
              .map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="flex-shrink-0">
                    <img
                      src={comment.user.image || "/placeholder-avatar-user.jpg"}
                      alt={comment.user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {comment.user.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatRelativeTime(comment.date, comment.time)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
