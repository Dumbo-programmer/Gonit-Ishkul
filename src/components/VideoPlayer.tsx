"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Gauge,
  ListVideo,
  Maximize,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { formatDuration } from "@/lib/learning";
import type { LectureChapter } from "@/lib/types";

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export function VideoPlayer({
  videoUrl,
  poster,
  title,
  chapters,
  initialTime = 0,
  onProgress,
  onCompleted,
}: {
  videoUrl: string;
  poster: string;
  title: string;
  chapters: LectureChapter[];
  initialTime?: number;
  onProgress: (seconds: number) => void;
  onCompleted: () => void;
}) {
  const { lang, t } = useLang();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastSavedRef = useRef(0);
  const completedRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(initialTime);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showChapters, setShowChapters] = useState(false);

  const flush = useCallback(
    (seconds: number, force = false) => {
      if (!force && Math.abs(seconds - lastSavedRef.current) < 10) return;
      lastSavedRef.current = seconds;
      onProgress(seconds);
    },
    [onProgress],
  );

  useEffect(() => {
    const el = videoRef.current;
    if (el && initialTime > 0) el.currentTime = initialTime;
  }, [initialTime]);

  useEffect(() => {
    const el = videoRef.current;
    return () => {
      if (el) flush(el.currentTime, true);
    };
  }, [flush]);

  const toggle = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
    } else {
      el.pause();
    }
  }, []);

  const seek = useCallback((seconds: number) => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = seconds;
    setCurrent(seconds);
  }, []);

  const onTimeUpdate = () => {
    const el = videoRef.current;
    if (!el) return;
    setCurrent(el.currentTime);
    flush(el.currentTime);
    if (
      !completedRef.current &&
      el.duration > 0 &&
      el.currentTime / el.duration >= 0.9
    ) {
      completedRef.current = true;
      onCompleted();
    }
  };

  const progressPercent = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div className="overflow-hidden rounded-3xl border border-brand-lavender/25 bg-black shadow-card">
      <div className="relative aspect-video w-full">
        <video
          ref={videoRef}
          src={videoUrl}
          poster={poster}
          preload="metadata"
          playsInline
          className="h-full w-full object-contain"
          onPlay={() => setPlaying(true)}
          onPause={() => {
            setPlaying(false);
            const el = videoRef.current;
            if (el) flush(el.currentTime, true);
          }}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
          onEnded={() => {
            setPlaying(false);
            const el = videoRef.current;
            if (el) flush(el.duration, true);
            if (!completedRef.current) {
              completedRef.current = true;
              onCompleted();
            }
          }}
          onClick={toggle}
        />

        {!playing && (
          <button
            type="button"
            onClick={toggle}
            aria-label={t("courses.continueLearning")}
            className="absolute inset-0 flex items-center justify-center bg-black/25 transition hover:bg-black/35"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-orange text-white shadow-bubble">
              <Play className="h-7 w-7 translate-x-0.5" fill="currentColor" />
            </span>
          </button>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-3 pb-3 pt-10">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step="0.1"
            value={current}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="seek"
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/30 accent-brand-orange"
            style={{
              background: `linear-gradient(to right, var(--brand-orange) ${progressPercent}%, rgba(255,255,255,0.3) ${progressPercent}%)`,
            }}
          />

          <div className="mt-2 flex items-center gap-2 text-white">
            <button type="button" onClick={toggle} aria-label="play/pause" className="rounded-full p-1 hover:bg-white/15">
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button type="button" onClick={() => seek(Math.max(0, current - 10))} aria-label="back 10s" className="rounded-full p-1 hover:bg-white/15">
              <RotateCcw className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold tabular-nums">
              {formatDuration(current)} / {formatDuration(duration)}
            </span>

            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowChapters((s) => !s)}
                aria-label={t("courses.chapters")}
                className={`rounded-full p-1 hover:bg-white/15 ${showChapters ? "bg-white/20" : ""}`}
              >
                <ListVideo className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const el = videoRef.current;
                  if (!el) return;
                  el.muted = !el.muted;
                  setMuted(el.muted);
                }}
                aria-label="mute"
                className="rounded-full p-1 hover:bg-white/15"
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
                  setSpeed(next);
                  const el = videoRef.current;
                  if (el) el.playbackRate = next;
                }}
                aria-label="speed"
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold hover:bg-white/15"
              >
                <Gauge className="h-3.5 w-3.5" />
                {speed}x
              </button>
              <button
                type="button"
                onClick={() => videoRef.current?.requestFullscreen?.()}
                aria-label="fullscreen"
                className="rounded-full p-1 hover:bg-white/15"
              >
                <Maximize className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showChapters && (
        <div className="bg-brand-charcoal px-4 py-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-white/60">
            {t("courses.chapters")} · {title}
          </p>
          <div className="flex flex-wrap gap-2">
            {chapters.map((ch, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  seek(ch.atSec);
                  const el = videoRef.current;
                  if (el && el.paused) void el.play();
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  current >= ch.atSec && (i === chapters.length - 1 || current < chapters[i + 1].atSec)
                    ? "bg-brand-orange text-white"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                {formatDuration(ch.atSec)} · {lang === "bn" ? ch.labelBn : ch.labelEn}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
