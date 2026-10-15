import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  hint,
}: {
  icon?: LucideIcon;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-brand-lavender/40 bg-gradient-to-b from-white to-brand-purple/5 px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient-soft text-brand-purple ring-1 ring-brand-lavender/30">
        <Icon className="h-7 w-7" />
      </span>
      <p className="font-display text-lg font-bold text-brand-blue">{title}</p>
      {hint && <p className="max-w-sm text-sm text-brand-charcoal/60">{hint}</p>}
    </div>
  );
}
