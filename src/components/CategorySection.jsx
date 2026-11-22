import React from "react";
import ArticleCard from "./ArticleCard";
import { categoryLabel } from "../lib/helpers";

export default function CategorySection({ category, articles, lang, onOpen, likedIds, onToggleLike }) {
  if (articles.length === 0) return null;

  return (
    <section className="category-section">
      <div className="section-heading">
        <h2>
          {categoryLabel(category, lang)}
        </h2>
        <div />
      </div>
      <div className="article-grid">
        {articles.map((a) => (
          <ArticleCard
            key={a.id ?? a.url + a.publishedAt}
            a={a}
            lang={lang}
            onOpen={onOpen}
            liked={likedIds.has(a.id)}
            onToggleLike={onToggleLike}
          />
        ))}
      </div>
    </section>
  );
}
