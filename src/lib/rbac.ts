import type { Role } from "./types";

export type Permission =
  | "ambassador.apply"
  | "ambassador.viewStatus"
  | "ambassador.reportActivity"
  | "ambassador.downloadKit"
  | "ambassador.viewLeaderboard"
  | "ambassador.review"
  | "content.publish"
  | "contests.grade"
  | "courses.manage"
  | "articles.submit"
  | "articles.review"
  | "ambassadors.manage"
  | "metrics.view"
  | "admin.all";

// RBAC matrix. Ambassadors themselves may not review applications;
// that is reserved for mentors and admins.
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  STUDENT: [
    "ambassador.apply",
    "ambassador.viewStatus",
    "ambassador.viewLeaderboard",
    "articles.submit",
  ],
  AMBASSADOR: [
    "ambassador.viewStatus",
    "ambassador.reportActivity",
    "ambassador.downloadKit",
    "ambassador.viewLeaderboard",
    "articles.submit",
  ],
  MENTOR: [
    "ambassador.apply",
    "ambassador.viewStatus",
    "ambassador.reportActivity",
    "ambassador.downloadKit",
    "ambassador.viewLeaderboard",
    "ambassador.review",
    "contests.grade",
    "articles.submit",
    "articles.review",
    "metrics.view",
  ],
  INSTRUCTOR: [
    "ambassador.viewLeaderboard",
    "contests.grade",
    "courses.manage",
    "articles.submit",
    "articles.review",
  ],
  ADMIN: ["admin.all"],
};

export function can(
  role: Role,
  permission: Permission,
): boolean {
  if (role === "ADMIN") return true;
  if (permission === "admin.all") return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export const DEFAULT_ROLE: Role = "STUDENT";

export const ROLE_LABELS: Record<Role, { bn: string; en: string }> = {
  ADMIN: { bn: "অ্যাডমিন", en: "Admin" },
  INSTRUCTOR: { bn: "কোর্স ইন্সট্রাক্টর", en: "Instructor" },
  MENTOR: { bn: "মেন্টর / মূল্যায়নকারী", en: "Mentor" },
  AMBASSADOR: { bn: "গণিত দূত", en: "Ambassador" },
  STUDENT: { bn: "শিক্ষার্থী", en: "Student" },
};