"use client";

import { CommentButton } from "./CommentButton";

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

interface CommentsSectionProps {
  comments: Comment[];
  count: number;
  onComment?: () => void;
}

export function CommentsSection({ count, onComment }: CommentsSectionProps) {
  return <CommentButton count={count} onClick={onComment} />;
}
