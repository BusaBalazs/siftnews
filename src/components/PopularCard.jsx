import React from "react";
import { Heart } from "lucide-react";
import { relativeTime } from "../lib/helpers";

export default function PopularCard({ a, lang, onOpen }) {
  const time = relativeTime(a.publishedAt, lang);
  return (
    <button onClick={() => onOpen(a)} className="popular-card">
      <span className="popular-card-copy">
        <span className="popular-card-title">{a[lang].title}</span>
        <span className="popular-card-meta">
          {time && <>{time} • </>}{a.siteName}
          <span className="popular-likes"><Heart size={11} fill={(a.likes ?? 0) > 0 ? "currentColor" : "none"} /> {a.likes ?? 0}</span>
        </span>
      </span>
    </button>
  );
}
