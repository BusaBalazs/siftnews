import React from "react";
import SignalDial from "./SignalDial";
import LikeButton from "./LikeButton";
import AudioPlayer from "./AudioPlayer";
import CategoryIcon from "./CategoryIcon";
import { relativeTime, categoryLabel, getAudioUrl } from "../lib/helpers";

export default function ArticleCard({ a, lang, onOpen, liked, onToggleLike }) {
  const publishedTime = relativeTime(a.publishedAt, lang);
  const audioUrl = getAudioUrl(a, lang);
  return (
    <article className="article-card">
      <div className="category-kicker"><CategoryIcon category={a.category} /><span>{categoryLabel(a.category, lang)}</span><i /></div>
      <div className="article-card-main">
        <div className="article-card-copy">
          <h3><button onClick={() => onOpen(a)}>{a[lang].title}</button></h3>
          <p className="article-excerpt">{a[lang].excerpt}</p>
          <div className="article-meta"><span>{a.siteName}</span>{publishedTime && <><span>•</span><span>{publishedTime}</span></>}</div>
        </div>
      </div>
      <div className="article-actions">
        <LikeButton liked={liked} count={a.likes ?? 0} onToggle={() => onToggleLike(a)} />
        <SignalDial score={a.score} size={32} />
      </div>
      {audioUrl && <AudioPlayer key={`${a.id}-${lang}`} src={audioUrl} lang={lang} />}
    </article>
  );
}
