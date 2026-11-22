import React from "react";
import { X } from "lucide-react";
import PopularCard from "./PopularCard";

export default function PopularModal({ articles, lang, t, onOpen, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: "rgba(10,10,14,0.6)", backdropFilter: "blur(3px)" }}
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-md max-h-[75vh] rounded-t-2xl md:rounded-2xl overflow-hidden flex flex-col"
        style={{ background: "var(--card)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h3 className="font-semibold font-display" style={{ color: "var(--ink)" }}>
            {t.popularTitle}
          </h3>
          <button
            onClick={onClose}
            aria-label={t.close}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "var(--badge-bg)", color: "var(--ink)" }}
          >
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto p-3 flex flex-col gap-1">
          {articles.map((a) => (
            <PopularCard
              key={a.id ?? a.url + a.publishedAt}
              a={a}
              lang={lang}
              onOpen={(article) => {
                onOpen(article);
                onClose();
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
