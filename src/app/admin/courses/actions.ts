"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/rbac";
import type { AdminFormState } from "@/lib/adminForms";
import {
  createCourse,
  createLecture,
  deleteCourse,
  deleteLecture,
  moveLecture,
  setCoursePublished,
  updateCourse,
  updateLecture,
  type CourseInput,
  type LectureInput,
} from "@/lib/repositories/courses";

const LEVELS = ["PRIMARY", "JUNIOR", "SECONDARY", "HIGHER_SECONDARY", "BDMO_PREP"] as const;
const CATEGORIES = ["TRIVIA", "SOLUTIONS", "MO_TRAINING", "ARTICLE_WRITING"] as const;

const courseSchema = z.object({
  titleBn: z.string().trim().min(3, "বাংলা শিরোনাম দিন"),
  titleEn: z.string().trim().min(3, "ইংরেজি শিরোনাম দিন"),
  level: z.enum(LEVELS),
  category: z.enum(CATEGORIES),
  descBn: z.string().trim().min(10, "বাংলা বিবরণ দিন"),
  descEn: z.string().trim().min(10, "ইংরেজি বিবরণ দিন"),
  instructor: z.string().trim().min(2, "ইন্সট্রাক্টরের নাম দিন"),
  published: z.boolean(),
});

const lectureSchema = z.object({
  titleBn: z.string().trim().min(3, "বাংলা শিরোনাম দিন"),
  titleEn: z.string().trim().min(3, "ইংরেজি শিরোনাম দিন"),
  videoUrl: z.string().trim().url("সঠিক ভিডিও লিংক দিন"),
  poster: z.string().trim().url("সঠিক পোস্টার লিংক দিন").optional().or(z.literal("")),
  durationSec: z.coerce.number().int().min(1, "সময়কাল সেকেন্ডে দিন"),
});

async function requireManager(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return Boolean(session?.user && can(session.user.role, "courses.manage"));
}

function collectErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) errors[String(issue.path[0])] = issue.message;
  return errors;
}

function readCourse(formData: FormData): z.infer<typeof courseSchema> {
  const raw = Object.fromEntries(formData.entries());
  return courseSchema.parse({ ...raw, published: formData.get("published") === "on" });
}

export async function createCourseAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await requireManager())) {
    return { ok: false, message: "আপনার কোর্স ব্যবস্থাপনার অনুমতি নেই।" };
  }
  let data: z.infer<typeof courseSchema>;
  try {
    data = readCourse(formData);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { ok: false, message: "ফর্মে ত্রুটি আছে", errors: collectErrors(err) };
    }
    throw err;
  }
  const course = await createCourse(data as CourseInput);
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  return { ok: true, message: "কোর্স তৈরি হয়েছে।", createdId: course.id };
}

export async function updateCourseAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await requireManager())) {
    return { ok: false, message: "আপনার কোর্স ব্যবস্থাপনার অনুমতি নেই।" };
  }
  const id = String(formData.get("id") ?? "");
  let data: z.infer<typeof courseSchema>;
  try {
    data = readCourse(formData);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { ok: false, message: "ফর্মে ত্রুটি আছে", errors: collectErrors(err) };
    }
    throw err;
  }
  const course = await updateCourse(id, data as CourseInput);
  if (!course) return { ok: false, message: "কোর্স পাওয়া যায়নি।" };
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${id}`);
  revalidatePath("/courses");
  revalidatePath(`/courses/${course.slug}`);
  return { ok: true, message: "কোর্স হালনাগাদ হয়েছে।" };
}

export async function createLectureAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await requireManager())) {
    return { ok: false, message: "আপনার কোর্স ব্যবস্থাপনার অনুমতি নেই।" };
  }
  const courseId = String(formData.get("courseId") ?? "");
  let data: z.infer<typeof lectureSchema>;
  try {
    data = lectureSchema.parse(Object.fromEntries(formData.entries()));
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { ok: false, message: "ফর্মে ত্রুটি আছে", errors: collectErrors(err) };
    }
    throw err;
  }
  const lecture = await createLecture(courseId, {
    titleBn: data.titleBn,
    titleEn: data.titleEn,
    videoUrl: data.videoUrl,
    poster: data.poster || "",
    durationSec: data.durationSec,
  } as LectureInput);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/courses");
  return { ok: true, message: "লেকচার যোগ হয়েছে।", createdId: lecture.id };
}

export async function updateLectureAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await requireManager())) {
    return { ok: false, message: "আপনার কোর্স ব্যবস্থাপনার অনুমতি নেই।" };
  }
  const courseId = String(formData.get("courseId") ?? "");
  const id = String(formData.get("id") ?? "");
  let data: z.infer<typeof lectureSchema>;
  try {
    data = lectureSchema.parse(Object.fromEntries(formData.entries()));
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { ok: false, message: "ফর্মে ত্রুটি আছে", errors: collectErrors(err) };
    }
    throw err;
  }
  const lecture = await updateLecture(id, {
    titleBn: data.titleBn,
    titleEn: data.titleEn,
    videoUrl: data.videoUrl,
    poster: data.poster || "",
    durationSec: data.durationSec,
  } as LectureInput);
  if (!lecture) return { ok: false, message: "লেকচার পাওয়া যায়নি।" };
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/courses");
  return { ok: true, message: "লেকচার হালনাগাদ হয়েছে।" };
}

export async function toggleCoursePublishAction(formData: FormData): Promise<void> {
  if (!(await requireManager())) return;
  const id = String(formData.get("id") ?? "");
  const published = String(formData.get("published") ?? "") === "true";
  await setCoursePublished(id, published);
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}

export async function deleteCourseAction(formData: FormData): Promise<void> {
  if (!(await requireManager())) return;
  const id = String(formData.get("id") ?? "");
  await deleteCourse(id);
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}

export async function deleteLectureAction(formData: FormData): Promise<void> {
  if (!(await requireManager())) return;
  const id = String(formData.get("id") ?? "");
  await deleteLecture(id);
  revalidatePath(`/admin/courses/${String(formData.get("courseId") ?? "")}`);
  revalidatePath("/courses");
}

export async function moveLectureAction(formData: FormData): Promise<void> {
  if (!(await requireManager())) return;
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (direction !== "up" && direction !== "down") return;
  await moveLecture(id, direction);
  revalidatePath(`/admin/courses/${String(formData.get("courseId") ?? "")}`);
}
