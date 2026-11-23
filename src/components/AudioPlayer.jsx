import React, { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, Loader2, Volume2, Volume1, VolumeX, RotateCw } from "lucide-react";
import { STRINGS } from "../i18n/strings";
import { claimPlayback, releasePlayback, setVolume, toggleMute, useAudioSettings } from "../lib/audioManager";

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Compact MP3 player that lives inside an article card.
 * The file is NOT downloaded until the visitor presses play (preload="none"),
 * so a page full of cards doesn't pull dozens of MP3s.
 */
export default function AudioPlayer({ src, lang }) {
  const t = STRINGS[lang];
  const audioRef = useRef(null);
  const { volume, muted } = useAudioSettings();

  const [status, setStatus] = useState("idle"); // idle | loading | playing | paused | error
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  // keep the <audio> element in sync with the shared volume / mute state
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
    el.muted = muted;
  }, [volume, muted]);

  // on unmount (e.g. language switch remounts the player) stop and release
  useEffect(() => {
    const el = audioRef.current;
    return () => {
      if (el) {
        el.pause();
        releasePlayback(el);
      }
    };
  }, []);

  const play = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    claimPlayback(el);
    setStatus((s) => (s === "playing" ? s : "loading"));
    el.play().catch((err) => {
      // AbortError = play() was interrupted by a pause()/load(), not a real failure
      if (err?.name !== "AbortError") setStatus("error");
    });
  }, []);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) play();
    else el.pause();
  };

  const retry = () => {
    const el = audioRef.current;
    if (!el) return;
    setStatus("idle");
    el.load();
    play();
  };

  const seek = (e) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    const value = Number(e.target.value);
    el.currentTime = value;
    setCurrent(value);
  };

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const shownVolume = muted ? 0 : volume;
  const progressPct = duration ? (current / duration) * 100 : 0;
  const playing = status === "playing";

  return (
    <div
      role="group"
      aria-label={t.listen}
      // clicks inside the player must not open the article modal
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-2 rounded-md px-2 py-1.5"
      style={{ border: "1px solid var(--border)" }}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onDurationChange={(e) => setDuration(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 0)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onWaiting={() => setStatus("loading")}
        onPlaying={() => setStatus("playing")}
        onPause={() => setStatus((s) => (s === "error" ? s : "paused"))}
        onEnded={() => setStatus("paused")}
        onError={() => setStatus("error")}
      />

      {status === "error" ? (
        <>
          <span className="flex-1 text-[11px]  truncate" style={{ color: "var(--ink-muted)" }}>
            {t.audioError}
          </span>
          <button
            onClick={retry}
            aria-label={t.audioRetry}
            title={t.audioRetry}
            className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center"
            style={{ color: "var(--ink)" }}
          >
            <RotateCw size={14} />
          </button>
        </>
      ) : (
        <>
          <button
            onClick={togglePlay}
            aria-label={playing ? t.audioPause : t.audioPlay}
            title={playing ? t.audioPause : t.audioPlay}
            className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-white transition-transform active:scale-90"
            style={{ background: "var(--button-bg)", color: "var(--button-ink)" }}
          >
            {status === "loading" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : playing ? (
              <Pause size={13} fill="currentColor" />
            ) : (
              <Play size={13} fill="currentColor" style={{ marginLeft: 1 }} />
            )}
          </button>

          <input
            type="range"
            className="audio-range min-w-0 flex-1"
            min={0}
            max={duration || 1}
            step={0.1}
            value={Math.min(current, duration || 1)}
            onChange={seek}
            disabled={!duration}
            aria-label={t.listen}
            style={{ "--fill": `${progressPct}%` }}
          />

          <span className="text-[11px]  tabular-nums shrink-0" style={{ color: "var(--ink-faint)" }}>
            {duration ? `${formatTime(current)} / ${formatTime(duration)}` : formatTime(current)}
          </span>

          {/* volume: click = mute / unmute, hover or focus = slider */}
          <div className="relative group shrink-0">
            <button
              onClick={toggleMute}
              aria-label={muted ? t.audioUnmute : t.audioMute}
              title={t.audioVolume}
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ color: "var(--ink-muted)" }}
            >
              <VolumeIcon size={15} />
            </button>
            <div className="absolute bottom-full right-0 pb-2 hidden group-hover:block group-focus-within:block z-10">
              <div
                className="w-28 rounded-md px-3 py-2.5 shadow-lg"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
              >
                <input
                  type="range"
                  className="audio-range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={shownVolume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  aria-label={t.audioVolume}
                  style={{ "--fill": `${shownVolume * 100}%` }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
