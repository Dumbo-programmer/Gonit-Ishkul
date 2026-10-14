export function ProgressBar({
  percent,
  className,
  tone = "brand",
}: {
  percent: number;
  className?: string;
  tone?: "brand" | "green";
}) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-brand-lavender/20 ${className ?? ""}`}
      role="progressbar"
      aria-valuenow={p}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          tone === "green"
            ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
            : "bg-gradient-to-r from-brand-orange to-brand-purple"
        }`}
        style={{ width: `${p}%` }}
      />
    </div>
  );
}
