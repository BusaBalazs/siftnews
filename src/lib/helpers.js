import { CATEGORY_LABELS } from "../i18n/strings.js";

function parsePublishedAt(value) {
  if (value && typeof value.toDate === "function") return value.toDate();

  if (typeof value === "string") {
    const match = value.match(
      /^(January|February|March|April|May|June|July|August|September|October|November|December) (\d{1,2}), (\d{4}) at (\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM) UTC([+-])(\d{1,2})(?::(\d{2}))?$/i
    );
    if (match) {
      const [, monthName, dayText, yearText, hourText, minuteText, secondText, period, sign, offsetHourText, offsetMinuteText = "0"] = match;
      const month = ["january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"].indexOf(monthName.toLowerCase());
      const day = Number(dayText);
      const year = Number(yearText);
      const hour = Number(hourText);
      const minute = Number(minuteText);
      const second = Number(secondText);
      const offsetHours = Number(offsetHourText);
      const offsetMinutes = Number(offsetMinuteText);
      const date = new Date(0);
      date.setUTCFullYear(year, month, day);
      date.setUTCHours((hour % 12) + (period.toUpperCase() === "PM" ? 12 : 0), minute, second, 0);
      if (hour < 1 || hour > 12 || minute > 59 || second > 59 || offsetHours > 23 ||
          offsetMinutes > 59 || date.getUTCMonth() !== month || date.getUTCDate() !== day) {
        return new Date(NaN);
      }
      const offset = (offsetHours * 60 + offsetMinutes) * (sign === "+" ? 1 : -1);
      return new Date(date.getTime() - offset * 60000);
    }
  }

  return new Date(value);
}

export function relativeTime(iso, lang) {
  if (!iso) return null;
  const publishedAt = parsePublishedAt(iso);
  if (!Number.isFinite(publishedAt.getTime())) return null;

  const diffMs = Date.now() - publishedAt.getTime();
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);

  if (lang === "hu") {
    if (days > 0) return `${days} napja`;
    if (hrs > 0) return `${hrs} órája`;
    return `${mins} perce`;
  }
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  return `${mins}m ago`;
}

export function scoreColor(score) {
  if (score >= 80) return "#22C55E";
  if (score >= 60) return "#F2A93B";
  return "#EF4444";
}

// Translated label for a category if known, otherwise the raw DB value —
// so a category present in Firestore but missing from CATEGORY_LABELS
// still renders instead of disappearing.
export function categoryLabel(category, lang) {
  return CATEGORY_LABELS[category]?.[lang] ?? category;
}

// Unique category values found across the given articles, sorted
// alphabetically. This is the actual source of truth for which category
// links appear in the nav/filter — driven entirely by the data.
export function deriveCategories(articles) {
  return [...new Set(articles.map((a) => a.category).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

// Articles grouped by category, each group sorted by score descending.
// Categories themselves are not part of the return order here — read the
// keys and sort with deriveCategories() (or Object.keys(...).sort()) for
// a stable alphabetical section order.
export function groupByCategory(articles) {
  const map = {};
  for (const a of articles) {
    if (!a.category) continue;
    if (!map[a.category]) map[a.category] = [];
    map[a.category].push(a);
  }
  Object.values(map).forEach((list) => list.sort((a, b) => b.score - a.score));
  return map;
}

// Keep unknown dates or scores at the end, preserving the original order for ties.
export function sortArticles(articles, sortBy) {
  const valueFor = (article) => {
    if (sortBy === "latest") {
      if (article.publishedAt == null || article.publishedAt === "") return -Infinity;
      const time = parsePublishedAt(article.publishedAt).getTime();
      return Number.isFinite(time) ? time : -Infinity;
    }
    return Number.isFinite(article.score) ? article.score : -Infinity;
  };

  return articles
    .map((article) => ({ article, value: valueFor(article) }))
    .sort((a, b) => a.value === b.value ? 0 : a.value > b.value ? -1 : 1)
    .map(({ article }) => article);
}

// Top N articles by like count. If nothing has any likes yet, falls back
// to the N most recent articles instead — so the "Popular" rail is never
// just empty on a fresh site.
export function getPopularArticles(articles, count = 6) {
  const liked = articles.filter((a) => (a.likes ?? 0) > 0);
  if (liked.length > 0) {
    return [...liked].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0)).slice(0, count);
  }
  return [...articles]
    .sort((a, b) => parsePublishedAt(b.publishedAt) - parsePublishedAt(a.publishedAt))
    .slice(0, count);
}

// MP3 link for the article in the given UI language, or null when there is
// no usable audio (missing, or not generated yet / failed).
// Firestore shape: audio: { hu: { status, url, voice, generatedAt }, en: { ... } }
export function getAudioUrl(article, lang) {
  const audio = article?.audio?.[lang];
  if (!audio || audio.status !== "ready" || !audio.url) return null;
  return audio.url;
}
