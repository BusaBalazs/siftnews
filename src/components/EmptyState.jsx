import React from "react";
import { Newspaper } from "lucide-react";

export default function EmptyState({ title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center px-4">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: "var(--badge-bg)" }}
      >
        <Newspaper size={22} style={{ color: "var(--ink-faint)" }} />
      </div>
      <h3 className="text-lg font-semibold font-display" style={{ color: "var(--ink)" }}>
        {title}
      </h3>
      <p className="text-sm max-w-sm" style={{ color: "var(--ink-muted)" }}>
        {subtitle}
      </p>
    </div>
  );
}
