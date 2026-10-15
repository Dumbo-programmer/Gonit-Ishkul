"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import { updateClubProfileAction } from "@/app/clubs/actions";
import { INITIAL_CLUB_FORM_STATE } from "@/lib/clubForm";
import { useLang } from "@/lib/i18n/LangContext";
import type { ClubRecord } from "@/lib/types";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      <Save className="h-4 w-4" /> {pending ? "…" : label}
    </button>
  );
}

export function ClubProfileForm({ club }: { club: ClubRecord }) {
  const { lang } = useLang();
  const bn = lang === "bn";
  const [state, formAction] = useFormState(updateClubProfileAction, INITIAL_CLUB_FORM_STATE);

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
    save: bn ? "পরিবর্তন সংরক্ষণ করুন" : "Save changes",
  };

  return (
    <form action={formAction} className="card space-y-5">
      <input type="hidden" name="clubId" value={club.id} />

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
          <input name="nameBn" className="field-input" defaultValue={club.nameBn} required />
        </label>
        <label className="block">
          <span className="field-label">{L.name}</span>
          <input name="name" className="field-input" defaultValue={club.name} required />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <label className="block sm:col-span-2">
          <span className="field-label">{L.institution}</span>
          <input name="institution" className="field-input" defaultValue={club.institution} required />
        </label>
        <label className="block">
          <span className="field-label">{L.district}</span>
          <input name="district" className="field-input" defaultValue={club.district} required />
        </label>
      </div>

      <label className="block max-w-[12rem]">
        <span className="field-label">{L.founded}</span>
        <input
          name="foundedYear"
          type="number"
          min={1900}
          max={2100}
          className="field-input"
          defaultValue={club.foundedYear}
        />
      </label>

      <label className="block">
        <span className="field-label">{L.about}</span>
        <textarea name="about" className="field-input min-h-[110px]" defaultValue={club.about} required />
      </label>

      <label className="block">
        <span className="field-label">{L.aboutEn}</span>
        <textarea name="aboutEn" className="field-input min-h-[80px]" defaultValue={club.aboutEn} />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">{L.logo}</span>
          <input name="logoUrl" className="field-input" defaultValue={club.logoUrl} />
        </label>
        <label className="block">
          <span className="field-label">{L.website}</span>
          <input name="website" className="field-input" defaultValue={club.website} />
        </label>
        <label className="block">
          <span className="field-label">{L.facebook}</span>
          <input name="facebook" className="field-input" defaultValue={club.facebook} />
        </label>
        <label className="block">
          <span className="field-label">{L.email}</span>
          <input name="contactEmail" type="email" className="field-input" defaultValue={club.contactEmail} required />
        </label>
        <label className="block">
          <span className="field-label">{L.phone}</span>
          <input name="contactPhone" className="field-input" defaultValue={club.contactPhone} />
        </label>
      </div>

      <Submit label={L.save} />
    </form>
  );
}
