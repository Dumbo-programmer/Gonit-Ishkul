"use client";

import { useFormState, useFormStatus } from "react-dom";
import { PlusCircle, Save } from "lucide-react";
import {
  createLectureAction,
  updateLectureAction,
} from "@/app/admin/courses/actions";
import { INITIAL_ADMIN_FORM_STATE } from "@/lib/adminForms";
import { useLang } from "@/lib/i18n/LangContext";

export interface LectureFormValues {
  id?: string;
  titleBn: string;
  titleEn: string;
  videoUrl: string;
  poster: string;
  durationSec: number;
}

function Submit({ label, create }: { label: string; create: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-secondary !px-4 !py-2">
      {create ? <PlusCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
      {pending ? "…" : label}
    </button>
  );
}

export function LectureAdminForm({
  mode = "create",
  courseId,
  values,
}: {
  mode?: "create" | "edit";
  courseId: string;
  values?: LectureFormValues;
}) {
  const { lang } = useLang();
  const action = mode === "create" ? createLectureAction : updateLectureAction;
  const [state, formAction] = useFormState(action, INITIAL_ADMIN_FORM_STATE);
  const bn = lang === "bn";

  const L = {
    titleBn: bn ? "শিরোনাম (বাংলা)" : "Title (Bangla)",
    titleEn: bn ? "শিরোনাম (ইংরেজি)" : "Title (English)",
    video: bn ? "ভিডিও লিংক" : "Video URL",
    poster: bn ? "পোস্টার লিংক" : "Poster URL",
    duration: bn ? "সময়কাল (সেকেন্ড)" : "Duration (seconds)",
    add: bn ? "লেকচার যোগ করুন" : "Add lecture",
    save: bn ? "সংরক্ষণ" : "Save",
  };

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="courseId" value={courseId} />
      {values?.id && <input type="hidden" name="id" value={values.id} />}

      {state.message && (
        <p
          className={
            state.ok
              ? "rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"
              : "rounded-2xl bg-brand-red/10 px-4 py-2 text-sm font-semibold text-brand-red"
          }
        >
          {state.message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">{L.titleBn}</span>
          <input name="titleBn" className="field-input" defaultValue={values?.titleBn} required />
        </label>
        <label className="block">
          <span className="field-label">{L.titleEn}</span>
          <input name="titleEn" className="field-input" defaultValue={values?.titleEn} required />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">{L.video}</span>
          <input
            name="videoUrl"
            className="field-input"
            defaultValue={values?.videoUrl}
            placeholder="https://…/video.mp4"
            required
          />
          {state.errors?.videoUrl && (
            <span className="mt-1 block text-xs text-brand-red">{state.errors.videoUrl}</span>
          )}
        </label>
        <label className="block">
          <span className="field-label">{L.poster}</span>
          <input
            name="poster"
            className="field-input"
            defaultValue={values?.poster}
            placeholder="https://…/poster.jpg"
          />
        </label>
      </div>

      <label className="block sm:w-1/2">
        <span className="field-label">{L.duration}</span>
        <input
          name="durationSec"
          type="number"
          min={1}
          className="field-input"
          defaultValue={values?.durationSec ?? 300}
          required
        />
      </label>

      <Submit label={mode === "create" ? L.add : L.save} create={mode === "create"} />
    </form>
  );
}
