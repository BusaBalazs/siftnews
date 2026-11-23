import React from "react";
import { X } from "lucide-react";
import PopularCard from "./PopularCard";

export default function PopularModal({ articles, lang, t, onOpen, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: "rgba(26,33,36,0.7)", backdropFilter: "blur(3px)" }}
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-md max-h-[75vh] rounded-t-xl md:rounded-xl overflow-hidden flex flex-col"
        style={{ background: "var(--card)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h3 className="font-bold uppercase tracking-wide text-[15px]" style={{ color: "var(--ink)" }}>
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
        <div className="overflow-y-auto px-4 pb-2 flex flex-col">
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
