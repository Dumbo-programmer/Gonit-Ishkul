"use client";

import { useFormState, useFormStatus } from "react-dom";
import { PenLine, Send } from "lucide-react";
import {
  submitArticleAction,
  updateArticleAction,
} from "@/app/articles/actions";
import { INITIAL_ARTICLE_STATE } from "@/lib/articleForm";
import { COURSE_CATEGORIES } from "@/lib/learning";
import { useLang } from "@/lib/i18n/LangContext";
import type { ArticleAudience, CourseCategory } from "@/lib/types";

export interface ArticleFormValues {
  id?: string;
  title: string;
  summary: string;
  body: string;
  category: CourseCategory;
  audience: ArticleAudience;
  tags: string[];
  coverUrl?: string;
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      <Send className="h-4 w-4" />
      {pending ? "…" : label}
    </button>
  );
}

export function ArticleForm({
  mode,
  canAmbassadorChannel,
  values,
}: {
  mode: "create" | "edit";
  canAmbassadorChannel: boolean;
  values?: ArticleFormValues;
}) {
  const { lang } = useLang();
  const action = mode === "create" ? submitArticleAction : updateArticleAction;
  const [state, formAction] = useFormState(action, INITIAL_ARTICLE_STATE);

  const bn = lang === "bn";
  const L = {
    title: bn ? "শিরোনাম" : "Title",
    summary: bn ? "সারসংক্ষেপ" : "Summary",
    body: bn ? "মূল লেখা (LaTeX-এ $...$ ব্যবহার করা যাবে)" : "Body (use $...$ for LaTeX)",
    category: bn ? "ক্যাটাগরি" : "Category",
    audience: bn ? "কাদের জন্য" : "Audience",
    public: bn ? "সবার জন্য (পাবলিক)" : "Everyone (public)",
    ambassador: bn ? "ক্যাম্পাস দূত চ্যানেল" : "Campus ambassador channel",
    tags: bn ? "ট্যাগ (কমা দিয়ে আলাদা)" : "Tags (comma separated)",
    cover: bn ? "কভার ছবির লিংক" : "Cover image link",
    publish: bn ? "পর্যালোচনার জন্য জমা দিন" : "Submit for review",
    save: bn ? "পরিবর্তন সংরক্ষণ করুন" : "Save changes",
  };

  return (
    <form action={formAction} className="card space-y-5">
      {values?.id && <input type="hidden" name="id" value={values.id} />}

      {state.message && (
        <p className="rounded-2xl bg-brand-red/10 px-4 py-2 text-sm font-semibold text-brand-red">
          {state.message}
        </p>
      )}

      <label className="block">
        <span className="field-label">{L.title}</span>
        <input
          name="title"
          className="field-input"
          defaultValue={values?.title}
          required
          minLength={6}
        />
        {state.errors?.title && (
          <span className="mt-1 block text-xs text-brand-red">{state.errors.title}</span>
        )}
      </label>

      <label className="block">
        <span className="field-label">{L.summary}</span>
        <textarea
          name="summary"
          className="field-input min-h-[70px]"
          defaultValue={values?.summary}
          required
          minLength={20}
        />
      </label>

      <label className="block">
        <span className="field-label">{L.body}</span>
        <textarea
          name="body"
          className="field-input min-h-[220px] font-mono text-sm"
          defaultValue={values?.body}
          required
          minLength={80}
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">{L.category}</span>
          <select
            name="category"
            className="field-input"
            defaultValue={values?.category ?? "TRIVIA"}
          >
            {COURSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {bn ? c.bn : c.en}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="field-label">{L.audience}</span>
          <select
            name="audience"
            className="field-input"
            defaultValue={values?.audience ?? "PUBLIC"}
          >
            <option value="PUBLIC">{L.public}</option>
            {canAmbassadorChannel && (
              <option value="AMBASSADOR">{L.ambassador}</option>
            )}
          </select>
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">{L.tags}</span>
          <input
            name="tags"
            className="field-input"
            defaultValue={values?.tags?.join(", ")}
            placeholder="number theory, olympiad"
          />
        </label>
        <label className="block">
          <span className="field-label">{L.cover}</span>
          <input
            name="coverUrl"
            className="field-input"
            defaultValue={values?.coverUrl}
            placeholder="https://…"
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <Submit label={mode === "create" ? L.publish : L.save} />
        <span className="inline-flex items-center gap-1.5 text-xs text-brand-charcoal/60">
          <PenLine className="h-3.5 w-3.5" />
          {bn
            ? "জমা দেওয়ার পর মেন্টর/অ্যাডমিন পর্যালোচনা করবেন।"
            : "A mentor/admin will review after submission."}
        </span>
      </div>
    </form>
  );
}
