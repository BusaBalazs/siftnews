import React from "react";
import { Heart } from "lucide-react";

export default function LikeButton({ liked, count, onToggle, size = 14 }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="flex items-center gap-1 text-xs font-mono transition-transform active:scale-90"
      style={{ color: liked ? "#EF4444" : "var(--ink-faint)" }}
      aria-pressed={liked}
      aria-label="like"
    >
      <Heart size={size} fill={liked ? "#EF4444" : "none"} />
      {count ?? 0}
    </button>
  );
}
