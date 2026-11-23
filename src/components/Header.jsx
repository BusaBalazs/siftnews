import React from "react";
import { Sun, Moon } from "lucide-react";
import FxTicker from "./FxTicker";
import { categoryLabel } from "../lib/helpers";
import { STRINGS } from "../i18n/strings";

export default function Header({ lang, setLang, theme, setTheme, categories, category, setCategory }) {
  const t = STRINGS[lang];
  const date = new Intl.DateTimeFormat(lang === "hu" ? "hu-HU" : "en-US", {
    year: "numeric", month: "long", day: "numeric",
  }).format(new Date());

  return (
    <header className="site-header page-width">
      <div className="utility-bar">
        <time>{date}</time>
        <FxTicker lang={lang} />
        <div className="header-controls">
          <div className="language-switch" aria-label="Language">
            {["hu", "en"].map((language) => (
              <button key={language} onClick={() => setLang(language)} aria-pressed={lang === language}>
                {language.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="theme-toggle" onClick={() => setTheme((th) => th === "dark" ? "light" : "dark")} aria-label={theme === "dark" ? t.themeLight : t.themeDark} title={theme === "dark" ? t.themeLight : t.themeDark}>
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
      <div className="brand-row">
        <a href="#top" className="brand" aria-label="SiftNews">SIFT<span>NEWS</span></a>
        <nav className="category-nav" aria-label={t.categories}>
          {["all", ...categories].map((c) => (
            <button key={c} className={category === c ? "is-active" : ""} onClick={() => setCategory(c)} aria-pressed={category === c}>
              <span>{c === "all" ? t.all : categoryLabel(c, lang)}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
