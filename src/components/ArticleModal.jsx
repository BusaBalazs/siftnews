import React, { useEffect, useRef, useState } from "react";
import {
  X,
  // Play, Pause — only needed if the audio-listen simulation is re-enabled
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Facebook,
  Instagram,
  Music2,
} from "lucide-react";
import LikeButton from "./LikeButton";
import { relativeTime, scoreColor, categoryLabel } from "../lib/helpers";

const SHOW_SOCIAL_PREVIEW = false;

export default function ArticleModal({
  a,
  lang,
  t,
  onClose,
  liked,
  onToggleLike,
}) {
  const publishedTime = relativeTime(a.publishedAt, lang);

  // "Listen to Article" is currently a pure UI simulation with no real
  // audio behind it — disabled for now, kept here to re-enable later
  // once a TTS source (Web Speech API / ElevenLabs / etc.) is wired in.
  // const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [socialTab, setSocialTab] = useState("facebook");
  const [socialOpen, setSocialOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight || 1)) * 100;
    setProgress(Math.min(100, Math.max(0, pct)));
  };

  const copySummary = () => {
    navigator.clipboard?.writeText(a[lang].excerpt).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const sections = [
    { label: t.summary, text: a[lang].excerpt },
    { label: t.whatHappened, text: a[lang].what_happened },
    { label: t.whyMatters, text: a[lang].why_it_matters },
    { label: t.whoAffected, text: a[lang].who_is_affected },
    { label: t.shouldRead, text: a[lang].should_read_original },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-0 md:p-6"
      style={{ background: "rgba(10,10,14,0.6)", backdropFilter: "blur(3px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full md:max-w-2xl h-full md:h-[88vh] md:rounded-2xl overflow-hidden flex flex-col"
        style={{ background: "var(--card)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute top-0 left-0 right-0 h-0.5 z-30"
          style={{ background: "var(--dial-track)" }}
        >
          <div
            className="h-full"
            style={{
              width: `${progress}%`,
              background: "var(--accent)",
              transition: "width 0.1s linear",
            }}
          />
        </div>

        <button
          onClick={onClose}
          aria-label={t.close}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "var(--badge-bg)", color: "var(--ink)" }}
        >
          <X size={18} />
        </button>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="overflow-y-auto flex-1"
        >
          <div className="p-6 pt-16 relative">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span
                className="px-2.5 py-1 rounded-full text-xs font-medium text-white"
                style={{ background: "var(--button-bg)", color: "var(--button-ink)" }}
              >
                {categoryLabel(a.category, lang)}
              </span>
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono"
                style={{ background: "var(--badge-bg)", color: "var(--ink)" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: scoreColor(a.score) }}
                />
                {t.score} {a.score}
              </span>
              {publishedTime && (
                <span
                  className="text-xs font-mono"
                  style={{ color: "var(--ink-faint)" }}
                >
                  {publishedTime}
                </span>
              )}
              <span className="ml-auto">
                <LikeButton
                  liked={liked}
                  count={a.likes ?? 0}
                  onToggle={() => onToggleLike(a)}
                  size={16}
                />
              </span>
            </div>

            <h1
              className="text-2xl font-semibold leading-tight mb-2 font-display"
              style={{ color: "var(--ink)" }}
            >
              {a[lang].title}
            </h1>
            <p
              className="text-sm mb-5 font-mono"
              style={{ color: "var(--ink-faint)" }}
            >
              {a.siteName} · {t.by} {a.author}
            </p>

            {/* "Listen to Article" — disabled until a real TTS source is
                wired in, this was only ever a visual simulation.
            <button
              onClick={() => setPlaying((p) => !p)}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 mb-5"
              style={{ background: "var(--badge-bg)" }}
            >
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white"
                style={{ background: "var(--button-bg)", color: "var(--button-ink)" }}
              >
                {playing ? <Pause size={16} /> : <Play size={16} />}
              </span>
              <span className="flex items-end gap-0.5 h-6 flex-1">
                {Array.from({ length: 28 }).map((_, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full"
                    style={{
                      height: `${20 + Math.abs(Math.sin(i * 1.3)) * 80}%`,
                      background: "#6C5CE7",
                      opacity: playing ? 0.9 : 0.35,
                      animation: playing ? `pulseBar 0.9s ease-in-out ${i * 0.04}s infinite alternate` : "none",
                    }}
                  />
                ))}
              </span>
              <span className="text-xs font-mono shrink-0" style={{ color: "var(--ink-muted)" }}>
                {t.listen}
              </span>
            </button>
            */}

            <div className="flex flex-col gap-3 mb-5">
              {sections.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl p-4"
                  style={{ background: "var(--badge-bg)" }}
                >
                  <h2
                    className="mb-1.5 text-[1.09375rem] font-semibold"
                    style={{ color: "var(--ink)" }}
                  >
                    {s.label}
                  </h2>
                  <p
                    className="text-base leading-relaxed"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    {s.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {a.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-xs font-mono"
                  style={{
                    background: "var(--badge-bg)",
                    color: "var(--ink-muted)",
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mb-5">
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-white"
                style={{ background: "var(--button-bg)", color: "var(--button-ink)" }}
              >
                {t.readOriginal} <ExternalLink size={14} />
              </a>
              <button
                onClick={copySummary}
                className="flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-medium"
                style={{ background: "var(--badge-bg)", color: "var(--ink)" }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}{" "}
                {copied ? t.copied : t.copySummary}
              </button>
            </div>

            {SHOW_SOCIAL_PREVIEW && (
              <div
                className="rounded-xl overflow-hidden"
                style={{ background: "var(--badge-bg)" }}
              >
                <button
                  onClick={() => setSocialOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 text-[1.09375rem] font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  {t.socialPreview}
                  <ChevronRight
                    size={16}
                    className={`transition-transform ${socialOpen ? "rotate-90" : ""}`}
                  />
                </button>
                {socialOpen && (
                  <div className="px-4 pb-4">
                    <div className="flex gap-1 mb-3">
                      {[
                        ["facebook", Facebook],
                        ["instagram", Instagram],
                        ["tiktok", Music2],
                      ].map(([key, Icon]) => (
                        <button
                          key={key}
                          onClick={() => setSocialTab(key)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                          style={{
                            background:
                              socialTab === key ? "var(--button-bg)" : "transparent",
                            color:
                              socialTab === key ? "var(--button-ink)" : "var(--ink-muted)",
                          }}
                        >
                          <Icon size={12} /> {key}
                        </button>
                      ))}
                    </div>
                    <div
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      {socialTab === "facebook" && (
                        <p>
                          {a.social.facebook.postText}{" "}
                          <span style={{ color: "var(--accent)" }}>
                            {a.social.facebook.callToAction}
                          </span>
                        </p>
                      )}
                      {socialTab === "instagram" && (
                        <p>
                          {a.social.instagram.caption}
                          <br />
                          <span className="text-xs opacity-70">
                            {a.social.instagram.visualConcept}
                          </span>
                        </p>
                      )}
                      {socialTab === "tiktok" && (
                        <p>
                          {a.social.tiktok.hook}
                          <br />
                          <span className="text-xs opacity-70">
                            {a.social.tiktok.script}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
