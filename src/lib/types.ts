export type Role =
  | "ADMIN"
  | "INSTRUCTOR"
  | "MENTOR"
  | "AMBASSADOR"
  | "STUDENT";

export type ApplicationStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "ACCEPTED"
  | "REJECTED";

export type ActivityType =
  | "CAMPUS_CIRCLE"
  | "WORKSHOP"
  | "SOCIAL_MEDIA"
  | "SCHOOL_VISIT"
  | "CONTEST_HOSTED"
  | "ARTICLE_PUBLISHED";

export type ActivityStatus = "PENDING" | "APPROVED" | "REJECTED";

export type PointSource =
  | "ACTIVITY"
  | "CONTEST_SOLVE"
  | "ARTICLE_PUBLISHED"
  | "BONUS"
  | "ADJUSTMENT";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string | null;
  role: Role;
  image?: string | null;
  createdAt: string;
}

export interface TimelineEntry {
  status: ApplicationStatus;
  note?: string;
  createdAt: string;
}

export interface ApplicationRecord {
  id: string;
  trackingCode: string;
  fullName: string;
  email: string;
  phone: string;
  university: string;
  department: string;
  district: string;
  division: string;
  studentId?: string;
  statement: string;
  resumeUrl?: string;
  shareUrl?: string;
  status: ApplicationStatus;
  reviewerNote?: string;
  timeline: TimelineEntry[];
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityRecord {
  id: string;
  ambassadorId: string;
  type: ActivityType;
  title: string;
  description: string;
  district: string;
  participants: number;
  proofUrl?: string;
  points: number;
  status: ActivityStatus;
  reviewNote?: string;
  createdAt: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  category: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSizeKb: number;
  downloads: number;
}

export interface PointEntry {
  id: string;
  userId: string;
  source: PointSource;
  points: number;
  reason: string;
  createdAt: string;
}

export interface BulletinRecord {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  createdAt: string;
}

// ─── Phase 2: Learning & Video Class Platform ───────────────────────────────

export type CourseLevel =
  | "PRIMARY"
  | "JUNIOR"
  | "SECONDARY"
  | "HIGHER_SECONDARY"
  | "BDMO_PREP";

export type CourseCategory =
  | "TRIVIA"
  | "SOLUTIONS"
  | "MO_TRAINING"
  | "ARTICLE_WRITING";

export interface Attachment {
  id: string;
  titleBn: string;
  titleEn: string;
  type: "slides" | "practice" | "notes" | "solution";
  fileUrl: string;
  sizeKb: number;
}

export interface CourseRecord {
  id: string;
  slug: string;
  titleBn: string;
  titleEn: string;
  level: CourseLevel;
  category: CourseCategory;
  descBn: string;
  descEn: string;
  instructor: string;
  published: boolean;
  createdAt: string;
}

export interface LectureChapter {
  labelBn: string;
  labelEn: string;
  atSec: number;
}

export interface LectureRecord {
  id: string;
  courseId: string;
  order: number;
  titleBn: string;
  titleEn: string;
  videoUrl: string;
  poster: string;
  durationSec: number;
  chapters: LectureChapter[];
  attachments: Attachment[];
}

export interface QuizQuestion {
  id: string;
  promptBn: string;
  promptEn: string;
  options: { bn: string; en: string }[];
  answerIndex: number;
  explanation?: string;
}

export interface QuizRecord {
  lectureId: string;
  passPercent: number;
  questions: QuizQuestion[];
}

export interface EnrollmentRecord {
  id: string;
  userId: string;
  courseId: string;
  createdAt: string;
}

export interface LectureProgressRecord {
  id: string;
  userId: string;
  courseId: string;
  lectureId: string;
  watchedSec: number;
  completed: boolean;
  quizPassed: boolean;
  updatedAt: string;
}

// ─── Phase 3: Problem Solving & Contest Arena ───────────────────────────────

export type ProblemTopic =
  | "NUMBER_THEORY"
  | "GEOMETRY"
  | "COMBINATORICS"
  | "ALGEBRA"
  | "PROOFS";

export type ProblemLevel =
  | "PRIMARY"
  | "JUNIOR"
  | "SECONDARY"
  | "HIGHER_SECONDARY"
  | "BDMO_REGIONAL"
  | "BDMO_NATIONAL"
  | "IMO";

export type ProblemKind = "NUMERIC" | "PROOF";

export type SubmissionVerdict = "PENDING" | "ACCEPTED" | "PARTIAL" | "WRONG";

export interface ProblemRecord {
  id: string;
  slug: string;
  titleBn: string;
  titleEn: string;
  statementBn: string;
  statementEn: string;
  topic: ProblemTopic;
  levels: ProblemLevel[];
  difficulty: number;
  source: string;
  kind: ProblemKind;
  answer?: string;
  tolerance?: number;
  basePoints: number;
  solutionBn?: string;
  solutionEn?: string;
  published: boolean;
  createdAt: string;
}

export interface SubmissionRecord {
  id: string;
  problemId: string;
  userId: string;
  kind: ProblemKind;
  content: string;
  attachments: string[];
  verdict: SubmissionVerdict;
  score: number;
  feedback?: string;
  gradedById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContestRecord {
  id: string;
  slug: string;
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
  startAt: string;
  endAt: string;
  durationMin: number;
  problemIds: string[];
  published: boolean;
  editorialBn?: string;
  editorialEn?: string;
  createdAt: string;
}

export interface ContestEntryRecord {
  id: string;
  contestId: string;
  userId: string;
  startedAt: string;
  submittedAt?: string;
  answers: Record<string, string>;
  score: number;
  ratingBefore?: number;
  ratingAfter?: number;
  createdAt: string;
}

export interface PuzzleRecord {
  id: string;
  weekLabel: string;
  questionBn: string;
  questionEn: string;
  hintBn?: string;
  hintEn?: string;
  answer: string;
  imageUrl?: string;
  revealAt: string;
  published: boolean;
  createdAt: string;
}

export interface PuzzleSubmissionRecord {
  id: string;
  puzzleId: string;
  userId: string;
  content: string;
  isCorrect: boolean;
  createdAt: string;
}

export interface RatingRecord {
  id: string;
  userId: string;
  rating: number;
  contests: number;
  updatedAt: string;
}

// ─── Phase 4: Articles & Knowledge Sharing ──────────────────────────────────

export type ArticleAudience = "PUBLIC" | "AMBASSADOR";

export type ArticleStatus = "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED";

export interface ArticleRecord {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  category: CourseCategory;
  audience: ArticleAudience;
  tags: string[];
  coverUrl?: string;
  authorId: string;
  authorName: string;
  status: ArticleStatus;
  reviewerNote?: string;
  views: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
