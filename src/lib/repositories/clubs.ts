import { getStore, persistStore, uid } from "@/lib/store";
import { slugify } from "@/lib/utils";
import type {
  ClubEntryRecord,
  ClubEntryType,
  ClubRecord,
  ClubStatus,
  ModerationStatus,
  ProblemLevel,
  ProblemTopic,
} from "@/lib/types";

export interface ClubInput {
  name: string;
  nameBn: string;
  logoUrl?: string;
  about: string;
  aboutEn?: string;
  district: string;
  institution: string;
  foundedYear?: number;
  website?: string;
  facebook?: string;
  contactEmail: string;
  contactPhone?: string;
}

export interface ClubEntryInput {
  clubId: string;
  type: ClubEntryType;
  title: string;
  summary?: string;
  body: string;
  topic?: ProblemTopic;
  level?: ProblemLevel;
  difficulty?: number;
  answer?: string;
  eventDate?: string;
  location?: string;
  linkUrl?: string;
  imageUrl?: string;
  tags: string[];
}

function uniqueSlug(store: ReturnType<typeof getStore>, base: string): string {
  const root = slugify(base) || `club-${Date.now()}`;
  let slug = root;
  let n = 2;
  while (store.clubs.some((c) => c.slug === slug)) {
    slug = `${root}-${n}`;
    n += 1;
  }
  return slug;
}

// ─── Clubs ──────────────────────────────────────────────────────────────────

export function listClubs(): ClubRecord[] {
  return [...getStore().clubs].sort((a, b) => a.nameBn.localeCompare(b.nameBn));
}

export function listPublishedClubs(): ClubRecord[] {
  return getStore()
    .clubs.filter((c) => c.status === "APPROVED" && c.published)
    .sort((a, b) => a.nameBn.localeCompare(b.nameBn));
}

export function listClubsByStatus(status: ClubStatus): ClubRecord[] {
  return getStore()
    .clubs.filter((c) => c.status === status)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getClubById(id: string): ClubRecord | undefined {
  return getStore().clubs.find((c) => c.id === id);
}

export function getClubBySlug(slug: string): ClubRecord | undefined {
  return getStore().clubs.find((c) => c.slug === slug);
}

export function getClubByRepresentative(userId: string): ClubRecord | undefined {
  return getStore().clubs.find((c) => c.representativeUserId === userId);
}

export function createClub(
  input: ClubInput,
  representative: { id: string; name: string },
): ClubRecord {
  const store = getStore();
  const now = new Date().toISOString();
  const record: ClubRecord = {
    id: uid("club"),
    slug: uniqueSlug(store, input.nameBn || input.name),
    name: input.name,
    nameBn: input.nameBn,
    logoUrl: input.logoUrl,
    about: input.about,
    aboutEn: input.aboutEn,
    district: input.district,
    institution: input.institution,
    foundedYear: input.foundedYear,
    website: input.website,
    facebook: input.facebook,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    representativeUserId: representative.id,
    representativeName: representative.name,
    status: "PENDING",
    published: false,
    createdAt: now,
    updatedAt: now,
  };
  store.clubs.push(record);
  persistStore(store);
  return record;
}

/**
 * Updates club details. Representative edits send the club back for review
 * (status PENDING, unpublished); admin edits keep the current review state.
 */
export function updateClub(
  id: string,
  input: ClubInput,
  options: { requireReview?: boolean } = {},
): ClubRecord | undefined {
  const store = getStore();
  const club = store.clubs.find((c) => c.id === id);
  if (!club) return undefined;
  club.name = input.name;
  club.nameBn = input.nameBn;
  club.logoUrl = input.logoUrl;
  club.about = input.about;
  club.aboutEn = input.aboutEn;
  club.district = input.district;
  club.institution = input.institution;
  club.foundedYear = input.foundedYear;
  club.website = input.website;
  club.facebook = input.facebook;
  club.contactEmail = input.contactEmail;
  club.contactPhone = input.contactPhone;
  if (options.requireReview) {
    club.status = "PENDING";
    club.published = false;
  }
  club.updatedAt = new Date().toISOString();
  persistStore(store);
  return club;
}

export function reviewClub(
  id: string,
  decision: Extract<ClubStatus, "APPROVED" | "REJECTED" | "SUSPENDED">,
  reviewerNote?: string,
): ClubRecord | undefined {
  const store = getStore();
  const club = store.clubs.find((c) => c.id === id);
  if (!club) return undefined;
  club.status = decision;
  club.reviewerNote = reviewerNote;
  club.published = decision === "APPROVED";
  club.updatedAt = new Date().toISOString();
  persistStore(store);
  return club;
}

export function setClubPublished(id: string, published: boolean): ClubRecord | undefined {
  const store = getStore();
  const club = store.clubs.find((c) => c.id === id);
  if (!club) return undefined;
  club.published = published;
  club.updatedAt = new Date().toISOString();
  persistStore(store);
  return club;
}

export function deleteClub(id: string): boolean {
  const store = getStore();
  const index = store.clubs.findIndex((c) => c.id === id);
  if (index === -1) return false;
  store.clubs.splice(index, 1);
  store.clubEntries = store.clubEntries.filter((e) => e.clubId !== id);
  persistStore(store);
  return true;
}

// ─── Club entries ───────────────────────────────────────────────────────────

export function listClubEntries(clubId: string): ClubEntryRecord[] {
  return getStore()
    .clubEntries.filter((e) => e.clubId === clubId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function listApprovedClubEntries(clubId: string): ClubEntryRecord[] {
  return getStore()
    .clubEntries.filter((e) => e.clubId === clubId && e.status === "APPROVED")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function listClubEntriesByStatus(status: ModerationStatus): ClubEntryRecord[] {
  return getStore()
    .clubEntries.filter((e) => e.status === status)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function listAllClubEntries(): ClubEntryRecord[] {
  return [...getStore().clubEntries].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export function getClubEntryById(id: string): ClubEntryRecord | undefined {
  return getStore().clubEntries.find((e) => e.id === id);
}

export function createClubEntry(
  input: ClubEntryInput,
  submitter: { id: string; name: string },
): ClubEntryRecord {
  const store = getStore();
  const now = new Date().toISOString();
  const record: ClubEntryRecord = {
    id: uid("cle"),
    clubId: input.clubId,
    type: input.type,
    title: input.title,
    summary: input.summary,
    body: input.body,
    topic: input.topic,
    level: input.level,
    difficulty: input.difficulty,
    answer: input.answer,
    eventDate: input.eventDate,
    location: input.location,
    linkUrl: input.linkUrl,
    imageUrl: input.imageUrl,
    tags: input.tags,
    status: "PENDING",
    submittedById: submitter.id,
    submittedByName: submitter.name,
    createdAt: now,
    updatedAt: now,
  };
  store.clubEntries.push(record);
  persistStore(store);
  return record;
}

export function updateClubEntry(
  id: string,
  submitterId: string,
  input: ClubEntryInput,
): ClubEntryRecord | undefined {
  const store = getStore();
  const entry = store.clubEntries.find((e) => e.id === id);
  if (!entry || entry.submittedById !== submitterId) return undefined;
  entry.type = input.type;
  entry.title = input.title;
  entry.summary = input.summary;
  entry.body = input.body;
  entry.topic = input.topic;
  entry.level = input.level;
  entry.difficulty = input.difficulty;
  entry.answer = input.answer;
  entry.eventDate = input.eventDate;
  entry.location = input.location;
  entry.linkUrl = input.linkUrl;
  entry.imageUrl = input.imageUrl;
  entry.tags = input.tags;
  entry.status = "PENDING";
  entry.reviewerNote = undefined;
  entry.updatedAt = new Date().toISOString();
  persistStore(store);
  return entry;
}

/** Moderator approval, optionally applying reviewer edits ("approve with changes"). */
export function reviewClubEntry(
  id: string,
  decision: Extract<ModerationStatus, "APPROVED" | "REJECTED">,
  reviewerNote?: string,
  edits?: Partial<ClubEntryInput>,
): ClubEntryRecord | undefined {
  const store = getStore();
  const entry = store.clubEntries.find((e) => e.id === id);
  if (!entry) return undefined;
  if (decision === "APPROVED" && edits) {
    if (edits.title !== undefined) entry.title = edits.title;
    if (edits.summary !== undefined) entry.summary = edits.summary;
    if (edits.body !== undefined) entry.body = edits.body;
    if (edits.type !== undefined) entry.type = edits.type;
    if (edits.topic !== undefined) entry.topic = edits.topic;
    if (edits.level !== undefined) entry.level = edits.level;
    if (edits.difficulty !== undefined) entry.difficulty = edits.difficulty;
    if (edits.answer !== undefined) entry.answer = edits.answer;
    if (edits.eventDate !== undefined) entry.eventDate = edits.eventDate;
    if (edits.location !== undefined) entry.location = edits.location;
    if (edits.tags !== undefined) entry.tags = edits.tags;
  }
  const now = new Date().toISOString();
  entry.status = decision;
  entry.reviewerNote = reviewerNote;
  entry.updatedAt = now;
  if (decision === "APPROVED") entry.approvedAt = now;
  persistStore(store);
  return entry;
}

export function deleteClubEntry(id: string, submitterId?: string): boolean {
  const store = getStore();
  const index = store.clubEntries.findIndex(
    (e) => e.id === id && (submitterId === undefined || e.submittedById === submitterId),
  );
  if (index === -1) return false;
  store.clubEntries.splice(index, 1);
  persistStore(store);
  return true;
}

// ─── Aggregates ─────────────────────────────────────────────────────────────

export interface ClubEntryCounts {
  PROBLEM: number;
  NOTE: number;
  ARTICLE: number;
  EVENT: number;
  total: number;
}

export function clubEntryCounts(
  clubId: string,
  status: ModerationStatus = "APPROVED",
): ClubEntryCounts {
  const entries = getStore().clubEntries.filter(
    (e) => e.clubId === clubId && e.status === status,
  );
  const counts: ClubEntryCounts = {
    PROBLEM: 0,
    NOTE: 0,
    ARTICLE: 0,
    EVENT: 0,
    total: entries.length,
  };
  for (const entry of entries) counts[entry.type] += 1;
  return counts;
}

export interface ClubModerationSummary {
  pendingClubs: number;
  pendingEntries: number;
  totalClubs: number;
  totalEntries: number;
}

export function clubModerationSummary(): ClubModerationSummary {
  const store = getStore();
  return {
    pendingClubs: store.clubs.filter((c) => c.status === "PENDING").length,
    pendingEntries: store.clubEntries.filter((e) => e.status === "PENDING").length,
    totalClubs: store.clubs.length,
    totalEntries: store.clubEntries.length,
  };
}
