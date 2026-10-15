import type {
  ClubEntryType,
  ClubStatus,
  ModerationStatus,
  ProblemLevel,
  ProblemTopic,
} from "@/lib/types";

export const PROBLEM_TOPICS: { value: ProblemTopic; bn: string; en: string }[] = [
  { value: "NUMBER_THEORY", bn: "সংখ্যাতত্ত্ব", en: "Number Theory" },
  { value: "GEOMETRY", bn: "জ্যামিতি", en: "Geometry" },
  { value: "COMBINATORICS", bn: "সমাবেশ", en: "Combinatorics" },
  { value: "ALGEBRA", bn: "বীজগণিত", en: "Algebra" },
  { value: "PROOFS", bn: "প্রমাণ", en: "Proofs" },
];

export const PROBLEM_LEVELS: { value: ProblemLevel; bn: string; en: string }[] = [
  { value: "PRIMARY", bn: "প্রাথমিক", en: "Primary" },
  { value: "JUNIOR", bn: "জুনিয়র", en: "Junior" },
  { value: "SECONDARY", bn: "সেকেন্ডারি", en: "Secondary" },
  { value: "HIGHER_SECONDARY", bn: "উচ্চ মাধ্যমিক", en: "Higher Secondary" },
  { value: "BDMO_REGIONAL", bn: "বিডিএমও আঞ্চলিক", en: "BdMO Regional" },
  { value: "BDMO_NATIONAL", bn: "বিডিএমও জাতীয়", en: "BdMO National" },
  { value: "IMO", bn: "আইএমও", en: "IMO" },
];

export interface ClubEntryTypeMeta {
  value: ClubEntryType;
  bn: string;
  en: string;
  tint: string;
}

export const CLUB_ENTRY_TYPES: ClubEntryTypeMeta[] = [
  { value: "PROBLEM", bn: "সমস্যা", en: "Problem", tint: "#1B4594" },
  { value: "NOTE", bn: "নোট", en: "Note", tint: "#7952B3" },
  { value: "ARTICLE", bn: "আর্টিকেল", en: "Article", tint: "#0EA5A5" },
  { value: "EVENT", bn: "ইভেন্ট", en: "Event", tint: "#FF781E" },
];

export function clubEntryTypeMeta(type: ClubEntryType): ClubEntryTypeMeta {
  return CLUB_ENTRY_TYPES.find((t) => t.value === type) ?? CLUB_ENTRY_TYPES[0];
}

export const CLUB_STATUS_META: Record<ClubStatus, { bn: string; en: string; tint: string }> = {
  PENDING: { bn: "অনুমোদন অপেক্ষমাণ", en: "Pending review", tint: "#FF781E" },
  APPROVED: { bn: "অনুমোদিত", en: "Approved", tint: "#0EA5A5" },
  REJECTED: { bn: "বাতিল", en: "Rejected", tint: "#ED1C24" },
  SUSPENDED: { bn: "স্থগিত", en: "Suspended", tint: "#6B7280" },
};

export function clubStatusMeta(status: ClubStatus) {
  return CLUB_STATUS_META[status] ?? CLUB_STATUS_META.PENDING;
}

export const MODERATION_STATUS_META: Record<
  ModerationStatus,
  { bn: string; en: string; tint: string }
> = {
  PENDING: { bn: "পর্যালোচনা অপেক্ষমাণ", en: "Pending review", tint: "#FF781E" },
  APPROVED: { bn: "অনুমোদিত", en: "Approved", tint: "#0EA5A5" },
  REJECTED: { bn: "বাতিল", en: "Rejected", tint: "#ED1C24" },
};

export function moderationStatusMeta(status: ModerationStatus) {
  return MODERATION_STATUS_META[status] ?? MODERATION_STATUS_META.PENDING;
}
