"use client";

import { cn } from "@/lib/utils";

const DOODLES = [
  { symbol: "∑", top: "6%", left: "3%", size: "text-5xl", duration: "11s", delay: "0s" },
  { symbol: "π", top: "62%", left: "7%", size: "text-4xl", duration: "9s", delay: "1.2s" },
  { symbol: "√", top: "18%", left: "92%", size: "text-5xl", duration: "13s", delay: "0.6s" },
  { symbol: "∞", top: "70%", left: "88%", size: "text-4xl", duration: "10s", delay: "2s" },
  { symbol: "∫", top: "40%", left: "48%", size: "text-3xl", duration: "12s", delay: "0.9s" },
  { symbol: "θ", top: "12%", left: "70%", size: "text-3xl", duration: "9.5s", delay: "1.6s" },
  { symbol: "Δ", top: "80%", left: "30%", size: "text-3xl", duration: "10.5s", delay: "0.3s" },
];

export function MathDoodles({
  className,
  tone = "brand",
}: {
  className?: string;
  tone?: "brand" | "light";
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {DOODLES.map((d) => (
        <span
          key={d.symbol + d.left}
          className={cn(
            "absolute select-none font-display font-extrabold motion-safe:animate-float",
            d.size,
            tone === "light" ? "text-white/10" : "text-brand-purple/10",
          )}
          style={{
            top: d.top,
            left: d.left,
            animationDuration: d.duration,
            animationDelay: d.delay,
          }}
        >
          {d.symbol}
        </span>
      ))}
    </div>
  );
}
