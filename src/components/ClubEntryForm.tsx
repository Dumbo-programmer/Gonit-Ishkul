"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Send } from "lucide-react";
import { createClubEntryAction, updateClubEntryAction } from "@/app/clubs/actions";
import { INITIAL_CLUB_FORM_STATE } from "@/lib/clubForm";
import { CLUB_ENTRY_TYPES, PROBLEM_LEVELS, PROBLEM_TOPICS } from "@/lib/clubs";
import { useLang } from "@/lib/i18n/LangContext";
import type { ClubEntryRecord, ClubEntryType } from "@/lib/types";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      <Send className="h-4 w-4" /> {pending ? "…" : label}
    </button>
  );
}

export function ClubEntryForm({
  clubId,
  mode,
  values,
}: {
  clubId: string;
  mode: "create" | "edit";
  values?: ClubEntryRecord;
}) {
  const { lang } = useLang();
  const bn = lang === "bn";
  const [type, setType] = useState<ClubEntryType>(values?.type ?? "PROBLEM");
  const action = mode === "create" ? createClubEntryAction : updateClubEntryAction;
  const [state, formAction] = useFormState(action, INITIAL_CLUB_FORM_STATE);

  const L = {
    type: bn ? "ধরন" : "Type",
    title: bn ? "শিরোনাম" : "Title",
    summary: bn ? "সারসংক্ষেপ" : "Summary",
    body: bn ? "বিবরণ (LaTeX-এ $...$ ব্যবহার করা যাবে)" : "Details (use $...$ for LaTeX)",
    topic: bn ? "বিষয়" : "Topic",
    level: bn ? "স্তর" : "Level",
    difficulty: bn ? "কঠিনতা (১-৫)" : "Difficulty (1-5)",
    answer: bn ? "উত্তর (ঐচ্ছিক)" : "Answer (optional)",
    eventDate: bn ? "ইভেন্টের তারিখ" : "Event date",
    location: bn ? "স্থান" : "Location",
    link: bn ? "প্রাসঙ্গিক লিংক" : "Related link",
    image: bn ? "ছবির লিংক" : "Image link",
    tags: bn ? "ট্যাগ (কমা দিয়ে আলাদা)" : "Tags (comma separated)",
    create: bn ? "জমা দিন (অনুমোদনের জন্য)" : "Submit for approval",
    save: bn ? "পরিবর্তন সংরক্ষণ করুন" : "Save changes",
  };

  return (
    <form action={formAction} className="card space-y-5">
      <input type="hidden" name="clubId" value={clubId} />
      {values?.id && <input type="hidden" name="id" value={values.id} />}

      {state.message && (
        <p
          className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
            state.ok ? "bg-[#0EA5A5]/10 text-[#0EA5A5]" : "bg-brand-red/10 text-brand-red"
          }`}
        >
          {state.message}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">{L.type}</span>
          <select
            name="type"
            className="field-input"
            value={type}
            onChange={(e) => setType(e.target.value as ClubEntryType)}
          >
            {CLUB_ENTRY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {bn ? t.bn : t.en}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="field-label">{L.title}</span>
          <input name="title" className="field-input" defaultValue={values?.title} required minLength={4} />
          {state.errors?.title && (
            <span className="mt-1 block text-xs text-brand-red">{state.errors.title}</span>
          )}
        </label>
      </div>

      <label className="block">
        <span className="field-label">{L.summary}</span>
        <textarea name="summary" className="field-input min-h-[60px]" defaultValue={values?.summary} />
      </label>

      <label className="block">
        <span className="field-label">{L.body}</span>
        <textarea
          name="body"
          className="field-input min-h-[160px] font-mono text-sm"
          defaultValue={values?.body}
          required
          minLength={20}
        />
        {state.errors?.body && (
          <span className="mt-1 block text-xs text-brand-red">{state.errors.body}</span>
        )}
      </label>

      {type === "PROBLEM" && (
        <div className="grid gap-5 rounded-2xl bg-brand-lavender/10 p-4 sm:grid-cols-2">
          <label className="block">
            <span className="field-label">{L.topic}</span>
            <select name="topic" className="field-input" defaultValue={values?.topic ?? "NUMBER_THEORY"}>
              {PROBLEM_TOPICS.map((o) => (
                <option key={o.value} value={o.value}>
                  {bn ? o.bn : o.en}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">{L.level}</span>
            <select name="level" className="field-input" defaultValue={values?.level ?? "SECONDARY"}>
              {PROBLEM_LEVELS.map((o) => (
                <option key={o.value} value={o.value}>
                  {bn ? o.bn : o.en}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">{L.difficulty}</span>
            <input
              name="difficulty"
              type="number"
              min={1}
              max={5}
              className="field-input"
              defaultValue={values?.difficulty ?? 2}
            />
          </label>
          <label className="block">
            <span className="field-label">{L.answer}</span>
            <input name="answer" className="field-input" defaultValue={values?.answer} />
          </label>
        </div>
      )}

      {type === "EVENT" && (
        <div className="grid gap-5 rounded-2xl bg-brand-orange/10 p-4 sm:grid-cols-2">
          <label className="block">
            <span className="field-label">{L.eventDate}</span>
            <input name="eventDate" type="date" className="field-input" defaultValue={values?.eventDate?.slice(0, 10)} />
          </label>
          <label className="block">
            <span className="field-label">{L.location}</span>
            <input name="location" className="field-input" defaultValue={values?.location} />
          </label>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">{L.link}</span>
          <input name="linkUrl" className="field-input" defaultValue={values?.linkUrl} placeholder="https://…" />
        </label>
        <label className="block">
          <span className="field-label">{L.image}</span>
          <input name="imageUrl" className="field-input" defaultValue={values?.imageUrl} placeholder="https://…" />
        </label>
      </div>

      <label className="block">
        <span className="field-label">{L.tags}</span>
        <input name="tags" className="field-input" defaultValue={values?.tags?.join(", ")} />
      </label>

      <Submit label={mode === "create" ? L.create : L.save} />
    </form>
  );
}
