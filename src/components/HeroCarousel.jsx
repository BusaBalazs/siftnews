import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { relativeTime, categoryLabel } from "../lib/helpers";
import CategoryIcon from "./CategoryIcon";

function HeroCopy({ article, lang, t, onOpen, exiting = false, onExitEnd }) {
  const publishedTime = relativeTime(article.publishedAt, lang);

  return (
    <div
      className={`hero-copy${exiting ? " hero-copy-exiting" : ""}`}
      aria-hidden={exiting || undefined}
      onAnimationEnd={onExitEnd}
    >
      <div className="category-kicker"><CategoryIcon category={article.category} /><span>{categoryLabel(article.category, lang)}</span><i /></div>
      <h1><button disabled={exiting} onClick={() => onOpen(article)}>{article[lang].title}</button></h1>
      <p className="hero-excerpt">{article[lang].excerpt}</p>
      <div className="hero-meta">
        <span>{article.siteName}</span><span>•</span><span>{t.by} {article.author}</span>
        {publishedTime && <><span>•</span><span>{publishedTime}</span></>}
        <span>•</span><span>{t.score}: {article.score}</span>
      </div>
      <button disabled={exiting} className="read-more" onClick={() => onOpen(article)}>{t.readMore} <ArrowRight size={17} /></button>
    </div>
  );
}

export default function HeroCarousel({ items, lang, t, onOpen }) {
  const [slide, setSlide] = useState({ index: 0, previousIndex: null, transition: 0 });
  const timer = useRef(null);

  useEffect(() => {
    if (items.length < 2) return undefined;
    timer.current = setInterval(() => {
      setSlide((s) => ({ index: (s.index + 1) % items.length, previousIndex: s.index, transition: s.transition + 1 }));
    }, 6000);
    return () => clearInterval(timer.current);
  }, [items.length]);

  const go = (i) => {
    clearInterval(timer.current);
    const next = ((i % items.length) + items.length) % items.length;
    setSlide((s) => next === s.index ? s : { index: next, previousIndex: s.index, transition: s.transition + 1 });
    if (items.length > 1) {
      timer.current = setInterval(() => {
        setSlide((s) => ({ index: (s.index + 1) % items.length, previousIndex: s.index, transition: s.transition + 1 }));
      }, 6000);
    }
  };
  const { index, previousIndex, transition } = slide;
  const a = items[index % items.length];
  if (!a) return null;
  const previous = previousIndex === null ? null : items[previousIndex % items.length];

  return (
    <section className="hero">
      <div className="hero-copy-viewport">
        {previous && <HeroCopy
          key={`out-${transition}`}
          article={previous}
          lang={lang}
          t={t}
          onOpen={onOpen}
          exiting
          onExitEnd={(event) => {
            if (event.target !== event.currentTarget || event.animationName !== "hero-slide-out") return;
            setSlide((s) => s.transition === transition ? { ...s, previousIndex: null } : s);
          }}
        />}
        <HeroCopy key={`in-${transition}`} article={a} lang={lang} t={t} onOpen={onOpen} />
      </div>
      <div className="hero-mark" aria-hidden="true"><span><span className="hero-mark-initial">S</span>N</span></div>
      {items.length > 1 && <div className="hero-controls">
        <button onClick={() => go(index - 1)} aria-label={lang === "hu" ? "Előző cikk" : "Previous article"}><ChevronLeft size={17} /></button>
        {items.map((item, i) => <button key={item.id ?? i} className={`hero-dot ${i === index ? "is-active" : ""}`} onClick={() => go(i)} aria-label={`${lang === "hu" ? "Cikk" : "Article"} ${i + 1}`} aria-pressed={i === index} />)}
        <button onClick={() => go(index + 1)} aria-label={lang === "hu" ? "Következő cikk" : "Next article"}><ChevronRight size={17} /></button>
      </div>}
    </section>
  );
}
