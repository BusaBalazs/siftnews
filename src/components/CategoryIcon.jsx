import React from "react";

export default function CategoryIcon({ category, ...props }) {
  const name = (category || "").toLowerCase();
  let shape;

  switch (name) {
    case "technology":
      shape = <><rect x="6" y="6" width="12" height="12" rx="1.5" /><rect x="9" y="9" width="6" height="6" rx=".5" /><path d="M9 3v3m3-3v3m3-3v3M9 18v3m3-3v3m3-3v3M3 9h3m-3 3h3m-3 3h3m12-6h3m-3 3h3m-3 3h3" /></>;
      break;
    case "business":
      shape = <g fill="currentColor" stroke="none"><rect x="3" y="15" width="2.8" height="6" rx=".4" /><rect x="8.2" y="10.5" width="2.8" height="10.5" rx=".4" /><rect x="13.4" y="6" width="2.8" height="15" rx=".4" /><rect x="18.6" y="3" width="2.8" height="18" rx=".4" /></g>;
      break;
    case "politics":
      shape = <><polygon points="12,3 2,8.5 22,8.5" fill="currentColor" stroke="none" /><path d="M5 10.5v7m4.6-7v7m4.8-7v7m4.6-7v7" strokeWidth="2" /><path d="M3 19.5h18M1.8 21.5h20.4" /></>;
      break;
    case "science":
      shape = <><circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none" /><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(-25 12 12)" /><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(35 12 12)" /><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(95 12 12)" /></>;
      break;
    case "society":
      shape = <><circle cx="12" cy="12" r="9.5" /><ellipse cx="12" cy="12" rx="4.5" ry="9.5" /><path d="M12 2.5v19M2.5 12h19M4.3 7.2Q12 9.5 19.7 7.2M4.3 16.8Q12 14.5 19.7 16.8" /></>;
      break;
    default:
      shape = <><path d="M3 6.5h18M3 12h12M3 17.5h15.5" strokeWidth="1.8" /><rect x="18" y="10.5" width="3" height="3" rx=".4" fill="currentColor" stroke="none" /></>;
  }

  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>{shape}</svg>;
}
