import React, { useCallback, useMemo, useState, useEffect } from "react";
import Header from "./components/Header";
import HeroCarousel from "./components/HeroCarousel";
import ArticleCard from "./components/ArticleCard";
import PopularRail from "./components/PopularRail";
import PopularModal from "./components/PopularModal";
import ArticleModal from "./components/ArticleModal";
import LoadingState from "./components/LoadingState";
import EmptyState from "./components/EmptyState";
import { STRINGS } from "./i18n/strings";
import { useArticles } from "./hooks/useArticles";
import { getPopularArticles, sortArticles } from "./lib/helpers";
import { getLikedIds, toggleLike } from "./lib/likes";

// Default theme follows the OS/browser color-scheme preference; the
// header toggle still lets the user override it for the session.
function getPreferredTheme() {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function App() {
  const [theme, setTheme] = useState(getPreferredTheme);
  const [lang, setLang] = useState("hu");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [active, setActive] = useState(null);
  const [scrollPct, setScrollPct] = useState(0);
  const [themeTouched, setThemeTouched] = useState(false);
  const [likedIds, setLikedIds] = useState(() => getLikedIds());
  const [popularOpen, setPopularOpen] = useState(false);

  const { articles, categories, loading, error, empty, bumpLikes } =
    useArticles();
  const t = STRINGS[lang];

  // HERO logic is untouched: always the top-3-by-score, never filtered by category.
  const hero = useMemo(
    () => [...articles].sort((a, b) => b.score - a.score).slice(0, 3),
    [articles],
  );

  const feedArticles = useMemo(
    () =>
      sortArticles(
        category === "all"
          ? articles
          : articles.filter((a) => a.category === category),
        sortBy,
      ),
    [articles, category, sortBy],
  );

  const popular = useMemo(() => getPopularArticles(articles, 6), [articles]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Keep following the OS preference live, unless the user has manually
  // toggled the theme switch during this session.
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => {
      if (!themeTouched) setTheme(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [themeTouched]);

  const handleSetTheme = (updater) => {
    setThemeTouched(true);
    setTheme(updater);
  };

  const onScroll = useCallback(() => {
    const doc = document.documentElement;
    const pct =
      (window.scrollY / (doc.scrollHeight - doc.clientHeight || 1)) * 100;
    setScrollPct(Math.min(100, Math.max(0, pct)));
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const handleToggleLike = (article) => {
    const nowLiked = toggleLike(article.id);
    setLikedIds(getLikedIds());
    bumpLikes(article.id, nowLiked ? 1 : -1);
  };

  return (
    <div id="top" className="site-shell">
      <div
        className="fixed top-0 left-0 right-0 z-50"
        style={{ height: 2, background: "var(--dial-track)" }}
      >
        <div
          style={{
            height: "100%",
            width: `${scrollPct}%`,
            background: "var(--accent)",
            transition: "width 0.1s linear",
          }}
        />
      </div>

      <Header
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={handleSetTheme}
        categories={categories}
        category={category}
        setCategory={setCategory}
      />

      <main className="page-width main-content">
        {loading && <LoadingState label={t.loading} />}

        {!loading && error && (
          <EmptyState title={t.errorTitle} subtitle={t.errorSubtitle} />
        )}

        {!loading && !error && empty && (
          <EmptyState
            title={t.noArticlesTitle}
            subtitle={t.noArticlesSubtitle}
          />
        )}

        {!loading && !error && !empty && (
          <>
            <div className="news-layout">
              <div className="news-main">
                <HeroCarousel
                  items={hero}
                  lang={lang}
                  t={t}
                  onOpen={setActive}
                />
                <div className="feed-sort">
                  <label htmlFor="article-sort">{t.sortLabel}</label>
                  <select
                    id="article-sort"
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                  >
                    <option value="latest">{t.sortLatest}</option>
                    <option value="score">{t.sortScore}</option>
                  </select>
                </div>
                <div className="feed-heading section-heading">
                  <h2>{sortBy === "latest" ? t.trending : t.scoreHeading}</h2>
                  <div />
                  <button
                    className="popular-mobile-button"
                    onClick={() => setPopularOpen(true)}
                  >
                    {t.popularButton} →
                  </button>
                </div>
                <section
                  className="article-grid"
                  aria-label={sortBy === "latest" ? t.trending : t.scoreHeading}
                >
                  {feedArticles.map((a) => (
                    <ArticleCard
                      key={a.id ?? a.url + a.publishedAt}
                      a={a}
                      lang={lang}
                      onOpen={setActive}
                      liked={likedIds.has(a.id)}
                      onToggleLike={handleToggleLike}
                    />
                  ))}
                </section>
              </div>

              <PopularRail
                articles={popular}
                lang={lang}
                t={t}
                onOpen={setActive}
              />
            </div>
          </>
        )}
      </main>
      <footer className="page-width site-footer">
        <a href="#top" className="footer-brand">
          SIFT<span>NEWS</span>
        </a>
        <div className="footer-rule" />
        <div className="language-switch" aria-label="Language">
          {["hu", "en"].map((language) => (
            <button
              key={language}
              onClick={() => setLang(language)}
              aria-pressed={lang === language}
            >
              {language.toUpperCase()}
            </button>
          ))}
        </div>
      </footer>

      {active && (
        <ArticleModal
          a={active}
          lang={lang}
          t={t}
          onClose={() => setActive(null)}
          liked={likedIds.has(active.id)}
          onToggleLike={handleToggleLike}
        />
      )}

      {popularOpen && (
        <PopularModal
          articles={popular}
          lang={lang}
          t={t}
          onOpen={setActive}
          onClose={() => setPopularOpen(false)}
        />
      )}
    </div>
  );
}
