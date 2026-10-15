import { CalendarDays, CheckCircle2, Lightbulb, Newspaper, NotebookPen, XCircle } from "lucide-react";
import {
  CLUB_ENTRY_TYPES,
  PROBLEM_LEVELS,
  PROBLEM_TOPICS,
  clubEntryTypeMeta,
  moderationStatusMeta,
} from "@/lib/clubs";
import { formatDate } from "@/lib/utils";
import { reviewClubEntryAction, deleteClubEntryAdminAction } from "@/app/admin/clubs/actions";
import type { ClubEntryRecord, ClubEntryType } from "@/lib/types";

const TYPE_ICON: Record<ClubEntryType, typeof Lightbulb> = {
  PROBLEM: Lightbulb,
  NOTE: NotebookPen,
  ARTICLE: Newspaper,
  EVENT: CalendarDays,
};

export function ClubEntryModeration({
  entry,
  clubName,
}: {
  entry: ClubEntryRecord;
  clubName?: string;
}) {
  const meta = clubEntryTypeMeta(entry.type);
  const Status = moderationStatusMeta(entry.status);
  const Icon = TYPE_ICON[entry.type];

  return (
    <div className="card space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge text-white" style={{ backgroundColor: meta.tint }}>
          <Icon className="h-3.5 w-3.5" /> {meta.bn}
        </span>
        <span className="badge" style={{ backgroundColor: `${Status.tint}1a`, color: Status.tint }}>
          {Status.bn}
        </span>
        {clubName && (
          <span className="text-xs font-semibold text-brand-purple">{clubName}</span>
        )}
        <span className="text-xs text-brand-charcoal/50">
          {entry.submittedByName} · {formatDate(entry.updatedAt)}
        </span>
      </div>

      <h3 className="font-display text-lg font-bold text-brand-blue">{entry.title}</h3>
      {entry.summary && <p className="text-sm text-brand-charcoal/70">{entry.summary}</p>}
      <details className="rounded-2xl bg-brand-lavender/10 px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold text-brand-blue">
          কনটেন্ট দেখুন ও সম্পাদনা করুন
        </summary>
        <p className="mt-2 whitespace-pre-wrap text-sm text-brand-charcoal/80">{entry.body}</p>
      </details>

      <form action={reviewClubEntryAction} className="space-y-4 border-t border-brand-lavender/25 pt-4">
        <input type="hidden" name="entryId" value={entry.id} />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="field-label">ধরন</span>
            <select name="type" className="field-input" defaultValue={entry.type}>
              {CLUB_ENTRY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.bn}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">শিরোনাম (পরিবর্তনসহ অনুমোদন)</span>
            <input name="title" className="field-input" defaultValue={entry.title} />
          </label>
        </div>

        <label className="block">
          <span className="field-label">সারসংক্ষেপ</span>
          <input name="summary" className="field-input" defaultValue={entry.summary} />
        </label>

        <label className="block">
          <span className="field-label">বিবরণ (LaTeX-এ $...$ সমর্থিত)</span>
          <textarea name="body" className="field-input min-h-[140px] font-mono text-sm" defaultValue={entry.body} />
        </label>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="field-label">বিষয়</span>
            <select name="topic" className="field-input" defaultValue={entry.topic ?? ""}>
              <option value="">—</option>
              {PROBLEM_TOPICS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.bn}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">স্তর</span>
            <select name="level" className="field-input" defaultValue={entry.level ?? ""}>
              <option value="">—</option>
              {PROBLEM_LEVELS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.bn}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">কঠিনতা</span>
            <input
              name="difficulty"
              type="number"
              min={1}
              max={5}
              className="field-input"
              defaultValue={entry.difficulty}
            />
          </label>
          <label className="block">
            <span className="field-label">উত্তর</span>
            <input name="answer" className="field-input" defaultValue={entry.answer} />
          </label>
          <label className="block">
            <span className="field-label">ইভেন্টের তারিখ</span>
            <input name="eventDate" type="date" className="field-input" defaultValue={entry.eventDate?.slice(0, 10)} />
          </label>
          <label className="block">
            <span className="field-label">স্থান</span>
            <input name="location" className="field-input" defaultValue={entry.location} />
          </label>
          <label className="block lg:col-span-2">
            <span className="field-label">ট্যাগ (কমা দিয়ে)</span>
            <input name="tags" className="field-input" defaultValue={entry.tags.join(", ")} />
          </label>
        </div>

        <input
          name="reviewerNote"
          className="field-input"
          placeholder="পর্যালোচকের মন্তব্য (বাতিলের কারণসহ)"
          defaultValue={entry.reviewerNote}
        />

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" name="decision" value="APPROVED" className="btn-primary">
            <CheckCircle2 className="h-4 w-4" /> পরিবর্তনসহ অনুমোদন
          </button>
          <button type="submit" name="decision" value="REJECTED" className="btn-ghost text-brand-red">
            <XCircle className="h-4 w-4" /> বাতিল
          </button>
        </div>
      </form>

      <form action={deleteClubEntryAdminAction}>
        <input type="hidden" name="entryId" value={entry.id} />
        <button type="submit" className="text-xs font-semibold text-brand-red hover:underline">
          জমাটি মুছে ফেলো
        </button>
      </form>
    </div>
  );
}
