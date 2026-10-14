"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import {
  createCourseAction,
  updateCourseAction,
} from "@/app/admin/courses/actions";
import { INITIAL_ADMIN_FORM_STATE } from "@/lib/adminForms";
import { COURSE_CATEGORIES, LEVELS } from "@/lib/learning";
import { useLang } from "@/lib/i18n/LangContext";
import type { CourseCategory, CourseLevel } from "@/lib/types";

export interface CourseFormValues {
  id?: string;
  titleBn: string;
  titleEn: string;
  level: CourseLevel;
  category: CourseCategory;
  descBn: string;
  descEn: string;
  instructor: string;
  published: boolean;
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      <Save className="h-4 w-4" />
      {pending ? "…" : label}
    </button>
  );
}

export function CourseAdminForm({
  mode,
  values,
}: {
  mode: "create" | "edit";
  values?: CourseFormValues;
}) {
  const { lang } = useLang();
  const router = useRouter();
  const action = mode === "create" ? createCourseAction : updateCourseAction;
  const [state, formAction] = useFormState(action, INITIAL_ADMIN_FORM_STATE);

  useEffect(() => {
    if (mode === "create" && state.ok && state.createdId) {
      router.push(`/admin/courses/${state.createdId}`);
    }
  }, [mode, state.ok, state.createdId, router]);

  const bn = lang === "bn";
  const L = {
    titleBn: bn ? "শিরোনাম (বাংলা)" : "Title (Bangla)",
    titleEn: bn ? "শিরোনাম (ইংরেজি)" : "Title (English)",
    level: bn ? "স্তর" : "Level",
    category: bn ? "ক্যাটাগরি" : "Category",
    descBn: bn ? "বিবরণ (বাংলা)" : "Description (Bangla)",
    descEn: bn ? "বিবরণ (ইংরেজি)" : "Description (English)",
    instructor: bn ? "ইন্সট্রাক্টর" : "Instructor",
    published: bn ? "প্রকাশিত" : "Published",
    save: mode === "create" ? (bn ? "কোর্স তৈরি করুন" : "Create course") : bn ? "সংরক্ষণ" : "Save",
  };

  return (
    <form action={formAction} className="card space-y-5">
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

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">{L.titleBn}</span>
          <input name="titleBn" className="field-input" defaultValue={values?.titleBn} required />
          {state.errors?.titleBn && (
            <span className="mt-1 block text-xs text-brand-red">{state.errors.titleBn}</span>
          )}
        </label>
        <label className="block">
          <span className="field-label">{L.titleEn}</span>
          <input name="titleEn" className="field-input" defaultValue={values?.titleEn} required />
          {state.errors?.titleEn && (
            <span className="mt-1 block text-xs text-brand-red">{state.errors.titleEn}</span>
          )}
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">{L.level}</span>
          <select name="level" className="field-input" defaultValue={values?.level ?? "PRIMARY"}>
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {bn ? l.bn : l.en}
              </option>
            ))}
          </select>
        </label>
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
      </div>

      <label className="block">
        <span className="field-label">{L.descBn}</span>
        <textarea
          name="descBn"
          className="field-input min-h-[80px]"
          defaultValue={values?.descBn}
          required
        />
      </label>
      <label className="block">
        <span className="field-label">{L.descEn}</span>
        <textarea
          name="descEn"
          className="field-input min-h-[80px]"
          defaultValue={values?.descEn}
          required
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">{L.instructor}</span>
          <input
            name="instructor"
            className="field-input"
            defaultValue={values?.instructor}
            required
          />
        </label>
        <label className="flex items-center gap-3 self-end pb-2">
          <input
            type="checkbox"
            name="published"
            defaultChecked={values?.published ?? true}
            className="h-5 w-5 accent-brand-orange"
          />
          <span className="field-label !mb-0">{L.published}</span>
        </label>
      </div>

      <Submit label={L.save} />
    </form>
  );
}
