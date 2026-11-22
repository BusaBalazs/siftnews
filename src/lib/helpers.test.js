import { test } from "node:test";
import assert from "node:assert/strict";
import { Timestamp } from "firebase/firestore";
import { getPopularArticles, relativeTime, sortArticles } from "./helpers.js";

test("relative time accepts Firestore timestamps and formatted dates without changing ISO dates", () => {
  const originalNow = Date.now;
  Date.now = () => Date.parse("2026-11-16T22:31:44Z");
  try {
    const iso = "2026-11-16T21:31:44Z";
    assert.equal(relativeTime(iso, "hu"), "1 órája");
    assert.equal(relativeTime(Timestamp.fromDate(new Date(iso)), "hu"), "1 órája");
    assert.equal(relativeTime("November 16, 2026 at 10:31:44\u202fPM UTC+1", "hu"), "1 órája");
    assert.equal(relativeTime("November 16, 2026 at 5:01:44 PM UTC-04:30", "en"), "1h ago");
    assert.equal(relativeTime("November 17, 2026 at 12:31:44 AM UTC+2", "en"), "1m ago");
    assert.equal(relativeTime("February 30, 2026 at 10:31:44 PM UTC+1", "en"), null);
    assert.equal(relativeTime("invalid date", "en"), null);
  } finally {
    Date.now = originalNow;
  }
});

test("recent articles sort correctly across supported date formats", () => {
  const articles = [
    { id: "older", publishedAt: "2026-11-16T20:00:00Z" },
    { id: "newest", publishedAt: Timestamp.fromDate(new Date("2026-11-16T22:00:00Z")) },
    { id: "middle", publishedAt: "November 16, 2026 at 10:31:44\u202fPM UTC+1" },
  ];
  assert.deepEqual(getPopularArticles(articles).map((article) => article.id), ["newest", "middle", "older"]);
});

test("feed sorting orders across categories without mutating articles", () => {
  const articles = [
    { id: "older", category: "Politics", score: 90, publishedAt: "2026-11-16T20:00:00Z" },
    { id: "newest", category: "Science", score: 70, publishedAt: Timestamp.fromDate(new Date("2026-11-16T22:00:00Z")) },
    { id: "middle", category: "Politics", score: 80, publishedAt: "November 16, 2026 at 10:31:44\u202fPM UTC+1" },
    { id: "unknown", category: "Science", score: null, publishedAt: "invalid date" },
    { id: "missing", category: "Science", publishedAt: null },
  ];
  assert.deepEqual(sortArticles(articles, "latest").map((a) => a.id), ["newest", "middle", "older", "unknown", "missing"]);
  assert.deepEqual(sortArticles(articles, "score").map((a) => a.id), ["older", "middle", "newest", "unknown", "missing"]);
  assert.deepEqual(articles.map((a) => a.id), ["older", "newest", "middle", "unknown", "missing"]);
});
