"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Building2 } from "lucide-react";
import { createClubWithRepAction } from "@/app/admin/clubs/actions";
import { INITIAL_CLUB_FORM_STATE } from "@/lib/clubForm";
import { Spinner } from "@/components/PageLoader";
import { useLang } from "@/lib/i18n/LangContext";

function Submit({ idle, pending }: { idle: string; pending: string }) {
  const { pending: isPending } = useFormStatus();
  return (
    <button type="submit" disabled={isPending} className="btn-primary disabled:opacity-60">
      {isPending ? <Spinner className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
      {isPending ? pending : idle}
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="mt-1 block text-xs font-semibold text-brand-red">{message}</span>;
}

export function AdminCreateClubForm() {
  const { lang } = useLang();
  const bn = lang === "bn";
  const [state, formAction] = useFormState(createClubWithRepAction, INITIAL_CLUB_FORM_STATE);
  const errors = state.errors ?? {};

  const L = {
    nameBn: bn ? "ক্লাবের নাম (বাংলা)" : "Club name (Bangla)",
    name: bn ? "ক্লাবের নাম (ইংরেজি)" : "Club name (English)",
    institution: bn ? "প্রতিষ্ঠান" : "Institution",
    district: bn ? "জেলা" : "District",
    founded: bn ? "প্রতিষ্ঠার বছর" : "Founded year",
    about: bn ? "ক্লাব পরিচিতি" : "About the club",
    aboutEn: bn ? "পরিচিতি (ইংরেজি)" : "About (English)",
    logo: bn ? "লোগো লিংক" : "Logo link",
    website: bn ? "ওয়েবসাইট" : "Website",
    facebook: bn ? "ফেসবুক পেজ" : "Facebook page",
    email: bn ? "যোগাযোগের ইমেইল" : "Contact email",
    phone: bn ? "যোগাযোগের ফোন" : "Contact phone",
    repName: bn ? "প্রতিনিধির নাম" : "Representative name",
    repEmail: bn ? "প্রতিনিধির লগইন ইমেইল" : "Representative login email",
    repPassword: bn ? "প্রতিনিধির পাসওয়ার্ড" : "Representative password",
    create: bn ? "ক্লাব তৈরি করো" : "Create club",
    creating: bn ? "তৈরি হচ্ছে…" : "Creating…",
    note: bn
      ? "ক্লাবটি সাথে সাথেই অনুমোদিত ও প্রকাশিত হবে, এবং এই প্রতিনিধি অ্যাকাউন্ট দিয়ে লগইন করতে পারবেন।"
      : "The club is approved and published immediately, and the representative can sign in with this account.",
  };

  return (
    <form action={formAction} className="card space-y-5">
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
          <span className="field-label">{L.nameBn}</span>
          <input name="nameBn" className="field-input" required />
          <FieldError message={errors.nameBn} />
        </label>
        <label className="block">
          <span className="field-label">{L.name}</span>
          <input name="name" className="field-input" required />
          <FieldError message={errors.name} />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <label className="block sm:col-span-2">
          <span className="field-label">{L.institution}</span>
          <input name="institution" className="field-input" required />
          <FieldError message={errors.institution} />
        </label>
        <label className="block">
          <span className="field-label">{L.district}</span>
          <input name="district" className="field-input" required />
          <FieldError message={errors.district} />
        </label>
      </div>

      <label className="block max-w-[12rem]">
        <span className="field-label">{L.founded}</span>
        <input name="foundedYear" type="number" min={1900} max={2100} className="field-input" />
        <FieldError message={errors.foundedYear} />
      </label>

      <label className="block">
        <span className="field-label">{L.about}</span>
        <textarea name="about" className="field-input min-h-[110px]" required />
        <FieldError message={errors.about} />
      </label>

      <label className="block">
        <span className="field-label">{L.aboutEn}</span>
        <textarea name="aboutEn" className="field-input min-h-[80px]" />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">{L.logo}</span>
          <input name="logoUrl" className="field-input" />
          <FieldError message={errors.logoUrl} />
        </label>
        <label className="block">
          <span className="field-label">{L.website}</span>
          <input name="website" className="field-input" />
          <FieldError message={errors.website} />
        </label>
        <label className="block">
          <span className="field-label">{L.facebook}</span>
          <input name="facebook" className="field-input" />
          <FieldError message={errors.facebook} />
        </label>
        <label className="block">
          <span className="field-label">{L.email}</span>
          <input name="contactEmail" type="email" className="field-input" required />
          <FieldError message={errors.contactEmail} />
        </label>
        <label className="block">
          <span className="field-label">{L.phone}</span>
          <input name="contactPhone" className="field-input" />
        </label>
      </div>

      <fieldset className="space-y-5 rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-4">
        <legend className="px-2 text-sm font-bold text-brand-blue">
          {bn ? "প্রতিনিধি অ্যাকাউন্ট" : "Representative account"}
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="field-label">{L.repName}</span>
            <input name="repName" className="field-input" required />
            <FieldError message={errors.repName} />
          </label>
          <label className="block">
            <span className="field-label">{L.repEmail}</span>
            <input name="repEmail" type="email" className="field-input" required />
            <FieldError message={errors.repEmail} />
          </label>
        </div>
        <label className="block max-w-[18rem]">
          <span className="field-label">{L.repPassword}</span>
          <input name="repPassword" type="text" className="field-input" required minLength={6} />
          <FieldError message={errors.repPassword} />
        </label>
        <p className="text-xs text-brand-charcoal/55">{L.note}</p>
      </fieldset>

      <Submit idle={L.create} pending={L.creating} />
    </form>
  );
}
