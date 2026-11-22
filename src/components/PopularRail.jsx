import React from "react";
import PopularCard from "./PopularCard";

export default function PopularRail({ articles, lang, t, onOpen }) {
  if (articles.length === 0) return null;
  return (
    <aside className="popular-rail">
      <div className="popular-rail-inner">
        <h2>{t.popularTitle}</h2>
        {articles.map((a) => <PopularCard key={a.id ?? a.url + a.publishedAt} a={a} lang={lang} onOpen={onOpen} />)}
      </div>
    </aside>
  );
}
