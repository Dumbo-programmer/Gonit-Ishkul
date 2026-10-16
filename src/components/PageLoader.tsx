import { cn } from "@/lib/utils";

export function PageLoader({
  label = "লোড হচ্ছে…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 px-4 py-20",
        className,
      )}
    >
      <span className="relative grid h-14 w-14 place-items-center">
        <span className="absolute inset-0 rounded-full border-4 border-brand-lavender/25" />
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-brand-orange border-r-brand-purple" />
        <span className="h-2.5 w-2.5 rounded-full bg-brand-blue" />
      </span>
      <p className="text-sm font-semibold text-brand-charcoal/60">{label}</p>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
    />
  );
}
