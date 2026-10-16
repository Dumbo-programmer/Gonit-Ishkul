"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  enroll,
  getCourseBySlug,
  getQuiz,
  isEnrolled,
  saveWatchProgress,
  setQuizResult,
} from "@/lib/repositories/courses";
import { gradeQuiz, type QuizState } from "@/lib/learning";

export async function enrollAction(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  const slug = String(formData.get("slug") ?? "");
  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(`/courses/${slug}`)}`);
  }
  const course = await getCourseBySlug(slug);
  if (!course) redirect("/courses");

  await enroll(session.user.uid, course.id);
  revalidatePath(`/courses/${slug}`);
  redirect(`/courses/${slug}/learn`);
}

export async function saveWatchProgressAction(
  courseId: string,
  lectureId: string,
  watchedSec: number,
): Promise<{ ok: boolean }> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false };
  await saveWatchProgress(session.user.uid, courseId, lectureId, Math.round(watchedSec));
  return { ok: true };
}

export async function submitQuizAction(
  _prev: QuizState,
  formData: FormData,
): Promise<QuizState> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false, message: "লগ ইন করা প্রয়োজন।" };

  const courseId = String(formData.get("courseId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const lectureId = String(formData.get("lectureId") ?? "");
  const quiz = await getQuiz(lectureId);
  if (!quiz) return { ok: false, message: "কুইজ পাওয়া যায়নি।" };

  const answers = quiz.questions.map((_, i) => {
    const raw = formData.get(`answer_${i}`);
    return raw === null || raw === "" ? null : Number(raw);
  });

  const unanswered = answers.some((a) => a === null);
  if (unanswered) {
    return { ok: false, message: "সব প্রশ্নের উত্তর দিন।" };
  }

  const result = gradeQuiz(quiz.questions, answers, quiz.passPercent);
  const results = quiz.questions.map((question, i) => answers[i] === question.answerIndex);
  await setQuizResult(session.user.uid, courseId, lectureId, result.passed);

  if (slug) revalidatePath(`/courses/${slug}/learn`);

  return {
    ok: true,
    correct: result.correct,
    total: result.total,
    percent: result.percent,
    passed: result.passed,
    results,
    message: result.passed
      ? "দুর্দান্ত! পরের লেকচার আনলক হয়েছে।"
      : `পাস করতে ${quiz.passPercent}% প্রয়োজন। আবার চেষ্টা করুন।`,
  };
}

export async function isUserEnrolled(courseId: string): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return false;
  return await isEnrolled(session.user.uid, courseId);
}
