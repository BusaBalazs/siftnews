import React from "react";

/**
 * "Sifting" loading animation — a 3x3 grid of squares that light up in a
 * wandering pattern, echoing the score-dial's arc-fill motion and the
 * app's name (SiftNews → sifting through stories).
 */
export default function LoadingState({ label }) {
  const order = [0, 1, 2, 5, 8, 7, 6, 3, 4]; // spiral fill order

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24">
      <div className="grid grid-cols-3 gap-1.5" style={{ width: 66, height: 66 }}>
        {Array.from({ length: 9 }).map((_, i) => {
          const delay = order.indexOf(i) * 0.12;
          return (
            <span
              key={i}
              className="rounded-md"
              style={{
                background: "var(--accent)",
                animation: `siftPulse 1.35s ease-in-out ${delay}s infinite`,
              }}
            />
          );
        })}
      </div>
      <p className="text-sm font-mono animate-pulse" style={{ color: "var(--ink-faint)" }}>
        {label}
      </p>
      <style>{`
        @keyframes siftPulse {
          0%, 70%, 100% { opacity: 0.15; transform: scale(0.75); }
          35% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
