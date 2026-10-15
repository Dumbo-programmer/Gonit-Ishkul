"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Building2, Send } from "lucide-react";
import { registerClubAction } from "@/app/clubs/actions";
import { INITIAL_CLUB_FORM_STATE } from "@/lib/clubForm";
import { useLang } from "@/lib/i18n/LangContext";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      <Send className="h-4 w-4" /> {pending ? "…" : label}
    </button>
  );
}

export function RegisterClubForm() {
  const { lang } = useLang();
  const bn = lang === "bn";
  const [state, formAction] = useFormState(registerClubAction, INITIAL_CLUB_FORM_STATE);

  const L = {
    nameBn: bn ? "ক্লাবের নাম (বাংলা)" : "Club name (Bangla)",
    name: bn ? "ক্লাবের নাম (ইংরেজি)" : "Club name (English)",
    institution: bn ? "প্রতিষ্ঠান (স্কুল/কলেজ/বিশ্ববিদ্যালয়)" : "Institution (school/college/university)",
    district: bn ? "জেলা" : "District",
    founded: bn ? "প্রতিষ্ঠার বছর" : "Founded year",
    about: bn ? "ক্লাব পরিচিতি" : "About the club",
    aboutEn: bn ? "পরিচিতি (ইংরেজি, ঐচ্ছিক)" : "About (English, optional)",
    logo: bn ? "লোগো লিংক" : "Logo link",
    website: bn ? "ওয়েবসাইট" : "Website",
    facebook: bn ? "ফেসবুক পেজ" : "Facebook page",
    email: bn ? "যোগাযোগের ইমেইল" : "Contact email",
    phone: bn ? "যোগাযোগের ফোন" : "Contact phone",
    submit: bn ? "ক্লাব নিবন্ধন জমা দিন" : "Submit club registration",
    note: bn
      ? "জমা দেওয়ার পর অ্যাডমিন পর্যালোচনা করবেন; অনুমোদিত হলে ক্লাবটি সর্বজনীন হবে ও আপনি প্রতিনিধি হিসেবে ক্লাবটি পরিচালনা করতে পারবেন।"
      : "An admin will review after submission; once approved the club becomes public and you manage it as its representative.",
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
          <input name="nameBn" className="field-input" required minLength={2} />
          {state.errors?.nameBn && (
            <span className="mt-1 block text-xs text-brand-red">{state.errors.nameBn}</span>
          )}
        </label>
        <label className="block">
          <span className="field-label">{L.name}</span>
          <input name="name" className="field-input" required minLength={2} />
          {state.errors?.name && (
            <span className="mt-1 block text-xs text-brand-red">{state.errors.name}</span>
          )}
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <label className="block sm:col-span-2">
          <span className="field-label">{L.institution}</span>
          <input name="institution" className="field-input" required />
          {state.errors?.institution && (
            <span className="mt-1 block text-xs text-brand-red">{state.errors.institution}</span>
          )}
        </label>
        <label className="block">
          <span className="field-label">{L.district}</span>
          <input name="district" className="field-input" required />
        </label>
      </div>

      <label className="block max-w-[12rem]">
        <span className="field-label">{L.founded}</span>
        <input name="foundedYear" type="number" min={1900} max={2100} className="field-input" />
      </label>

      <label className="block">
        <span className="field-label">{L.about}</span>
        <textarea name="about" className="field-input min-h-[110px]" required minLength={30} />
        {state.errors?.about && (
          <span className="mt-1 block text-xs text-brand-red">{state.errors.about}</span>
        )}
      </label>

      <label className="block">
        <span className="field-label">{L.aboutEn}</span>
        <textarea name="aboutEn" className="field-input min-h-[80px]" />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">{L.logo}</span>
          <input name="logoUrl" className="field-input" placeholder="/brand/logo.png" />
        </label>
        <label className="block">
          <span className="field-label">{L.website}</span>
          <input name="website" className="field-input" placeholder="https://…" />
        </label>
        <label className="block">
          <span className="field-label">{L.facebook}</span>
          <input name="facebook" className="field-input" placeholder="https://facebook.com/…" />
        </label>
        <label className="block">
          <span className="field-label">{L.email}</span>
          <input name="contactEmail" type="email" className="field-input" required />
          {state.errors?.contactEmail && (
            <span className="mt-1 block text-xs text-brand-red">{state.errors.contactEmail}</span>
          )}
        </label>
        <label className="block">
          <span className="field-label">{L.phone}</span>
          <input name="contactPhone" className="field-input" placeholder="01XXXXXXXXX" />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <Submit label={L.submit} />
        <span className="inline-flex items-start gap-1.5 text-xs text-brand-charcoal/60">
          <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {L.note}
        </span>
      </div>
    </form>
  );
}
