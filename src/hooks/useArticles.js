import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import { deriveCategories } from "../lib/helpers";

/**
 * Loads articles live from the Firestore `stories` collection, ordered by
 * relevance `score` descending — matching the document schema described
 * in the project brief (url, image, siteName, author, publishedAt, score,
 * category, subCategory, tags, hu, en, social).
 *
 * No mock/dummy data — if the collection is empty or unreachable, the
 * caller is told via `empty` / `error` so it can render the right state.
 */
export function useArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const q = query(collection(db, "stories"), orderBy("score", "desc"));
        const snap = await getDocs(q);
        if (cancelled) return;

        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setArticles(docs);
      } catch (err) {
        if (cancelled) return;
        console.error("[useArticles] Firestore fetch failed:", err);
        setError(err);
        setArticles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Category links are never hardcoded — they're the unique `category`
  // values actually present in the loaded articles.
  const categories = useMemo(() => deriveCategories(articles), [articles]);
  const empty = !loading && !error && articles.length === 0;

  // Optimistically adjusts one article's local like count (Firestore is
  // updated separately in lib/likes.js — this just keeps the UI in sync
  // without waiting for a full refetch).
  const bumpLikes = (id, delta) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, likes: Math.max(0, (a.likes ?? 0) + delta) } : a))
    );
  };

  return { articles, categories, loading, error, empty, bumpLikes };
}
