import React from "react";

/**
 * Category icons, drawn after the design mock-ups: a solid pediment building
 * (Politics), an open book (Society) and an atom (Technology), plus a flask
 * (Science), a briefcase (Business) and a ringed ellipsis (Other) in the same
 * duotone line style. Colour comes from `currentColor`; size from CSS
 * (or the width / height props).
 */

function Politics() {
  return (
    <>
      <path d="M3 12.2 16 4.2l13 8z" fill="currentColor" fillOpacity=".85" />
      <rect x="5" y="13.8" width="22" height="2" rx=".4" fill="currentColor" stroke="none" />
      {[7, 11, 15, 19, 23].map((x) => (
        <rect key={x} x={x} y="17.4" width="2" height="7.4" fill="currentColor" fillOpacity=".55" strokeWidth="1" />
      ))}
      <rect x="5" y="25.4" width="22" height="1.8" rx=".4" fill="currentColor" stroke="none" />
      <rect x="3" y="28" width="26" height="1.8" rx=".4" fill="currentColor" stroke="none" />
    </>
  );
}

function Society() {
  return (
    <>
      <path d="M3 7.5c4.6-1.5 9.2-1 12.2 1V25C12 23 7.5 22.8 3 24z" fill="currentColor" fillOpacity=".85" />
      <path d="M29 7.5c-4.6-1.5-9.2-1-12.2 1V25c3.2-2 7.7-2.2 12.2-1z" fill="currentColor" fillOpacity=".85" />
      <path d="M3 26.2c4.6-1 9.2-.4 13 1.8 3.8-2.2 8.4-2.8 13-1.8" />
    </>
  );
}

function Technology() {
  return (
    <>
      <ellipse cx="16" cy="16" rx="12.5" ry="4.8" />
      <ellipse cx="16" cy="16" rx="12.5" ry="4.8" transform="rotate(60 16 16)" />
      <ellipse cx="16" cy="16" rx="12.5" ry="4.8" transform="rotate(120 16 16)" />
      <circle cx="16" cy="16" r="2" fill="currentColor" stroke="none" />
    </>
  );
}

function Science() {
  return (
    <>
      <path d="M12 4h8" />
      <path d="M13.5 4v8.2L6.6 24.4A2.4 2.4 0 0 0 8.7 28h14.6a2.4 2.4 0 0 0 2.1-3.6L18.5 12.2V4" />
      <path d="M9.4 19.6h13.2l2.8 4.8a2.4 2.4 0 0 1-2.1 3.6H8.7a2.4 2.4 0 0 1-2.1-3.6z" fill="currentColor" fillOpacity=".4" stroke="none" />
      <circle cx="14.2" cy="23.4" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="18.6" cy="22" r=".9" fill="currentColor" stroke="none" />
    </>
  );
}

function Business() {
  return (
    <>
      <rect x="4" y="10" width="24" height="16" rx="2.2" fill="currentColor" fillOpacity=".14" />
      <path d="M12 10V8.2A2.2 2.2 0 0 1 14.2 6h3.6A2.2 2.2 0 0 1 20 8.2V10" />
      <path d="M4 17h24" />
      <rect x="14" y="15" width="4" height="4" rx=".8" fill="currentColor" stroke="none" />
    </>
  );
}

function Other() {
  return (
    <>
      <circle cx="16" cy="16" r="11.5" fill="currentColor" fillOpacity=".1" />
      <circle cx="10.8" cy="16" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="21.2" cy="16" r="1.5" fill="currentColor" stroke="none" />
    </>
  );
}

const ICONS = { politics: Politics, society: Society, technology: Technology, science: Science, business: Business, other: Other };

// existing / legacy DB values that reuse one of the six icons
const ALIASES = { tech: "technology", cybersecurity: "technology", sport: "other", sports: "other" };

export function iconKey(category) {
  const key = String(category ?? "").trim().toLowerCase();
  const resolved = ALIASES[key] ?? key;
  return ICONS[resolved] ? resolved : "other";
}

export default function CategoryIcon({ category, ...props }) {
  const Icon = ICONS[iconKey(category)];
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <Icon />
    </svg>
  );
}
