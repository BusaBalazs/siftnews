# SiftNews — AI-curated News Platform

React + Vite + Tailwind CSS frontend for a bilingual (HU/EN), dark/light,
relevance-scored news platform, reading live from a Firestore `stories`
collection.

## Stack

- React 18 + Vite 5
- Tailwind CSS 3 (via `dark:` class strategy)
- Firebase / Firestore (`firebase` SDK) — articles + like counts
- lucide-react icons
- Frankfurter API (`mnb` provider: official MNB mid-rates) for the header FX ticker

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Firebase web config
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

Production build:

```bash
npm run build
npm run preview
```

## Firebase / Firestore

The app reads articles live from a `stories` collection, ordered by `score`
descending. Configure your project via env vars in `.env.local` (see
`.env.example`) — Firebase Console → Project settings → General → Your apps
→ SDK setup and configuration.

Each document in `stories` should match the schema already consumed by the
UI (`hu`, `en`, `social`, `tags`, `score`, `category`, `subCategory`,
`siteName`, `author`, `publishedAt`, `image`, `url`), plus an optional
numeric `likes` field (used by the like button / popular rail — treated as
`0` if missing). No reshaping needed — `src/hooks/useArticles.js` maps
documents straight through.

`publishedAt` may be an ISO date string, a Firestore timestamp, or an English
date string such as `November 16, 2026 at 10:31:44 PM UTC+1`. The UTC offset
is used when calculating relative time and ordering recent articles.

There is no mock/dummy data — the app always reads from `stories`:

- While the query is in flight, an animated loading state is shown
  (`src/components/LoadingState.jsx`).
- If the collection is empty, or the fetch fails (e.g. Firebase isn't
  configured yet), a friendly empty state is shown instead
  (`src/components/EmptyState.jsx`) telling the visitor to check back
  later — check the browser console for the underlying error when this
  happens.

Firestore security rules need to allow authenticated-or-public updates to
the `likes` field for the like button to work — e.g. for a simple public
demo:

```
match /stories/{storyId} {
  allow read: if true;
  allow update: if request.resource.data.diff(resource.data).affectedKeys()
                  .hasOnly(['likes']);
}
```

Adjust to your actual auth/security needs before going to production.

### Article audio (MP3 read-aloud)

Every story can carry an AI-generated MP3 per language. The files live in
Firebase Storage; the download link is stored on the story document:

```json
"audio": {
  "hu": { "status": "ready", "url": "https://firebasestorage.googleapis.com/...", "voice": "hu-HU-NoemiNeural", "generatedAt": "2026-11-12T19:18:00.365Z" },
  "en": { "status": "ready", "url": "https://firebasestorage.googleapis.com/...", "voice": "en-US-JennyNeural",   "generatedAt": "2026-11-12T19:18:03.692Z" }
}
```

- The card plays `audio[currentUiLanguage]`; switching HU/EN stops playback
  and loads the other file. A card whose audio is missing or not
  `status: "ready"` simply shows no player.
- The MP3 is only downloaded when the visitor presses play
  (`preload="none"`). A plain `<audio>` element is used, so no CORS setup is
  needed on the Storage bucket.
- Only one article plays at a time; volume / mute are shared by all cards and
  remembered in `localStorage` (`src/lib/audioManager.js`).

## Layout

- **Header** combines the MNB ticker, language and theme controls with the
  SiftNews wordmark and data-driven category navigation. The navigation scrolls
  horizontally on mobile.
- **Hero** remains a top-3-by-score carousel and is never category-filtered.
  The feed can be sorted globally by score (the default) or newest publication
  date. Selecting a category narrows the feed; "All" shows every category.
  Articles with an unavailable sort value appear last.
- Article photos are not displayed. The desktop hero uses an SN lettermark, with
  Playfair Display headlines and DM Sans navigation and body text.
- **Popular rail**: a sticky right-hand sidebar (desktop, ≥`lg`) with the
  top 6 most-liked articles as compact cards. If nothing has any likes
  yet, it falls back to the 6 most recent articles instead. On smaller
  screens the rail is replaced by a "Popular" button above the feed that
  opens the same list in a bottom-sheet modal.
- **Likes**: each card and the article detail view have a heart/like
  button. "Liked by me" is tracked per-browser in `localStorage`
  (`src/lib/likes.js`) so the heart stays filled on refresh; the actual
  shared count lives in Firestore (`likes` field, updated via
  `increment(±1)`) and updates optimistically in the UI right away.

## Project structure

```
src/
  main.jsx                entry point
  App.jsx                  page composition, theme/lang/category state, likes
  index.css                Tailwind + CSS custom-property design tokens
  i18n/strings.js          HU/EN UI copy dictionary + category label lookup
  lib/
    firebase.js             Firebase app + Firestore client init
    audioManager.js          one-at-a-time playback + shared volume/mute
    likes.js                 localStorage "liked by me" set + Firestore like counter
    helpers.js               relativeTime / scoreColor / categoryLabel /
                              deriveCategories / sortArticles / getPopularArticles
  hooks/useArticles.js       live query against the `stories` collection
  components/
    Header.jsx               FX utility bar, brand and category navigation
    FxTicker.jsx              EUR/HUF, USD/HUF, EUR/USD — MNB official mid-rates via Frankfurter
    AudioPlayer.jsx           card-integrated MP3 player (play, seek, time, volume)
    HeroCarousel.jsx          top-3-by-score auto-sliding hero
    CategoryIcon.jsx          SVG icons for known categories and a fallback
    CategorySection.jsx       legacy grouped feed component (not used by the sorted feed)
    ArticleCard.jsx            feed grid card, with like button
    ArticleModal.jsx           full article detail view, with like button
    PopularRail.jsx            desktop sticky sidebar, top-6 popular/recent
    PopularModal.jsx            mobile bottom-sheet version of the same list
    PopularCard.jsx             compact card shared by the rail and the modal
    LikeButton.jsx              heart toggle button
    SignalDial.jsx              arc "signal dial" score gauge (signature element)
    LazyImage.jsx               lazy image + skeleton placeholder
    LoadingState.jsx            animated squares shown while stories load
    EmptyState.jsx              "no articles yet" state (empty collection or fetch error)
```

## Notes

- **Theme default**: on first load the app follows the OS/browser
  `prefers-color-scheme`. The header toggle overrides it for the rest of
  the session; while untouched, it keeps following live OS changes.
- **"Listen to Article"** is currently disabled — commented out (not
  deleted) in `src/components/ArticleModal.jsx`, since it was only ever a
  visual simulation with no real audio behind it. Re-enable by uncommenting
  the block once a TTS source (Web Speech API, ElevenLabs, OpenAI TTS,
  etc.) is wired in.
- **Category links are not hardcoded** — the navigation and article
  labels are built from the unique `category` values actually present in
  the loaded articles (`deriveCategories()` in
  `src/lib/helpers.js`). Add a new category to a Firestore document and it
  shows up automatically. `CATEGORY_LABELS` in `src/i18n/strings.js` is an
  optional HU/EN translation lookup for known category names — any
  category not listed there just displays its raw DB value in both
  languages.
- The relevance `score` drives sorting, badge tier (`breakout` ≥85,
  `important` ≥70, standard <70), and the color of the signal dial
  (green ≥80, amber ≥60, red <60) — all in `src/lib/helpers.js`.
- The social-preview panel is temporarily hidden. Set `SHOW_SOCIAL_PREVIEW`
  to `true` in `src/components/ArticleModal.jsx` to show content from each
  document's `social` field again.

## FX ticker: data source & licensing

The header shows the **official MNB mid-rates** (középárfolyam). The MNB fixes
them once per business day at 11:00, so the numbers change once a day, not
intraday. EUR/USD is derived from the MNB's own HUF/EUR and HUF/USD fixings.

- Source: Frankfurter (`api.frankfurter.dev/v2`, `mnb` provider). Free, no API
  key, no quotas (only abuse rate limiting). Frankfurter's software is MIT
  licensed and the project states the hosted API is free for commercial use;
  it also encourages caching (the ticker caches for 30 minutes).
- Data terms: Frankfurter does not own the rates — the provider's terms apply.
  The MNB states on its own site that reproduction of the official exchange
  rates is permitted, without any liability for their accuracy.
- Rates are informational — not for accounting, tax or legal use. Check the
  figure against the MNB's own publication for that.
- If a rate can't be loaded the ticker shows "—" (no hard-coded fallback) and
  logs a warning to the browser console.
