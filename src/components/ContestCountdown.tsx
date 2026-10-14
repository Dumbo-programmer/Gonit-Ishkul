"use client";

import { useEffect, useState } from "react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Hydration-safe live countdown to an ISO timestamp. */
export function ContestCountdown({
  to,
  className,
}: {
  to: string;
  className?: string;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return <span className={className}>--:--:--</span>;

  const seconds = Math.max(0, Math.floor((Date.parse(to) - now) / 1000));
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return (
    <span className={className}>
      {d > 0 && `${d}d `}
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}
