import React from "react";

/**
 * Signature design element: the relevance `score` is rendered as an
 * arc "signal dial" rather than a flat badge, since the score is the
 * real mechanic driving the whole feed's hierarchy.
 */
export default function SignalDial({ score, size = 40 }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score)) / 100;
  // monochrome: breakout stories (>= 85) get the strong ink colour, the rest the accent grey
  const color = score >= 85 ? "var(--ink)" : "var(--accent)";

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      title={`Score ${score}`}
    >
      <svg width={size} height={size} viewBox="0 0 36 36" className="-rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="var(--dial-track)" strokeWidth="2.5" />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeDasharray={`${c * pct} ${c}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <span
        className="absolute font-semibold tabular-nums"
        style={{ fontSize: size * 0.3, color: "var(--ink)" }}
      >
        {score}
      </span>
    </div>
  );
}
