import React, { useEffect, useState } from "react";
import { STRINGS } from "../i18n/strings";

/**
 * Official daily mid-rates (középárfolyam) of the Magyar Nemzeti Bank (MNB),
 * fetched through the free Frankfurter API (v2, `mnb` provider, no API key).
 *
 *  - MNB fixes its rates once per business day at 11:00 and they stay valid
 *    until the next fixing, so these numbers change once a day (not intraday).
 *  - EUR/USD is not quoted by the MNB directly: Frankfurter derives it from
 *    the MNB's own HUF/EUR and HUF/USD fixings.
 *  - There are NO hard-coded fallback values: if a rate can't be loaded it
 *    shows "—" and the reason is logged to the console.
 */
const API = "https://api.frankfurter.dev/v2/providers/mnb/rate";
const PAIRS = [
  { label: "EUR/HUF", base: "EUR", quote: "HUF", digits: 2 },
  { label: "USD/HUF", base: "USD", quote: "HUF", digits: 2 },
  { label: "EUR/USD", base: "EUR", quote: "USD", digits: 4 },
];

// Rates only change once a day, so cache them to keep API traffic light.
const CACHE_KEY = "siftnews-fx-mnb";
const CACHE_TTL_MS = 30 * 60 * 1000;

function readCache() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(CACHE_KEY) || "null");
    if (raw && raw.rates && typeof raw.savedAt === "number") return raw;
  } catch {
    /* ignore */
  }
  return null;
}

function writeCache(rates) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), rates }));
  } catch {
    /* ignore */
  }
}

async function fetchPair({ base, quote }, signal) {
  const res = await fetch(`${API}/${base}/${quote}`, { signal });
  if (!res.ok) throw new Error(`${base}/${quote}: HTTP ${res.status}`);
  const data = await res.json();
  if (typeof data?.rate !== "number") throw new Error(`${base}/${quote}: unexpected response`);
  return { rate: data.rate, date: data.date };
}

export default function FxTicker({ lang }) {
  const t = STRINGS[lang];
  const [rates, setRates] = useState(() => readCache()?.rates ?? {});

  useEffect(() => {
    const cached = readCache();
    if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) return; // still fresh

    const controller = new AbortController();
    Promise.allSettled(PAIRS.map((p) => fetchPair(p, controller.signal))).then((results) => {
      if (controller.signal.aborted) return;
      const next = { ...(cached?.rates ?? {}) }; // keep an older value if one pair fails
      results.forEach((r, i) => {
        if (r.status === "fulfilled") next[PAIRS[i].label] = r.value;
        else console.warn("[FxTicker] MNB rate failed:", r.reason);
      });
      if (results.some((r) => r.status === "fulfilled")) {
        setRates(next);
        writeCache(next);
      }
    });
    return () => controller.abort();
  }, []);

  // the date the rates were fixed on (latest one we hold)
  const date = Object.values(rates)
    .map((r) => r.date)
    .filter(Boolean)
    .sort()
    .pop();

  return (
    <div
      className="flex items-center gap-3 md:gap-4 text-[11.5px] tabular-nums overflow-x-auto whitespace-nowrap"
      style={{ color: "var(--ink-muted)" }}
      title={date ? `${t.fxTitle} · ${date}` : t.fxTitle}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--ink-faint)" }}>
        MNB
      </span>
      {PAIRS.map((p) => (
        <span key={p.label} className="flex items-center gap-1 whitespace-nowrap">
          <span style={{ color: "var(--ink-faint)" }}>{p.label}</span>
          <span style={{ color: "var(--ink)" }}>{rates[p.label] ? rates[p.label].rate.toFixed(p.digits) : "—"}</span>
        </span>
      ))}
    </div>
  );
}
