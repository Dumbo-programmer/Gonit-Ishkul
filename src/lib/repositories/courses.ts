import { getStore, persistStore, uid } from "@/lib/store";
import { slugify } from "@/lib/utils";
import type {
  CourseCategory,
  CourseLevel,
  CourseRecord,
  LectureRecord,
  QuizRecord,
  EnrollmentRecord,
} from "@/lib/types";
import type { ProgressMap } from "@/lib/learning";
import { isWatchedComplete } from "@/lib/learning";

export async function listCourses(): Promise<CourseRecord[]> {
  return (await getStore())
    .courses.filter((c) => c.published)
    .map((c) => ({ ...c }));
}

export async function listAllCourses(): Promise<CourseRecord[]> {
  return [...(await getStore()).courses].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
}

export interface CourseInput {
  titleBn: string;
  titleEn: string;
  level: CourseLevel;
  category: CourseCategory;
  descBn: string;
  descEn: string;
  instructor: string;
  published: boolean;
}

async function uniqueCourseSlug(base: string, ignoreId?: string): Promise<string> {
  const store = await getStore();
  const root = slugify(base) || `course-${Date.now()}`;
  let slug = root;
  let n = 2;
  while (store.courses.some((c) => c.slug === slug && c.id !== ignoreId)) {
    slug = `${root}-${n}`;
    n += 1;
  }
  return slug;
}

export async function createCourse(input: CourseInput): Promise<CourseRecord> {
  const store = await getStore();
  const course: CourseRecord = {
    id: uid("crs"),
    slug: await uniqueCourseSlug(input.titleEn || input.titleBn),
    titleBn: input.titleBn,
    titleEn: input.titleEn,
    level: input.level,
    category: input.category,
    descBn: input.descBn,
    descEn: input.descEn,
    instructor: input.instructor,
    published: input.published,
    createdAt: new Date().toISOString(),
  };
  store.courses.push(course);
  await persistStore(store);
  return course;
}

export async function updateCourse(
  id: string,
  input: CourseInput,
): Promise<CourseRecord | undefined> {
  const store = await getStore();
  const course = store.courses.find((c) => c.id === id);
  if (!course) return undefined;
  if (input.titleEn !== course.titleEn || input.titleBn !== course.titleBn) {
    course.slug = await uniqueCourseSlug(input.titleEn || input.titleBn, id);
  }
  course.titleBn = input.titleBn;
  course.titleEn = input.titleEn;
  course.level = input.level;
  course.category = input.category;
  course.descBn = input.descBn;
  course.descEn = input.descEn;
  course.instructor = input.instructor;
  course.published = input.published;
  await persistStore(store);
  return course;
}

export async function setCoursePublished(id: string, published: boolean): Promise<void> {
  const store = await getStore();
  const course = store.courses.find((c) => c.id === id);
  if (!course) return;
  course.published = published;
  await persistStore(store);
}

export async function deleteCourse(id: string): Promise<boolean> {
  const store = await getStore();
  const index = store.courses.findIndex((c) => c.id === id);
  if (index === -1) return false;
  const lectureIds = store.lectures
    .filter((l) => l.courseId === id)
    .map((l) => l.id);
  store.courses.splice(index, 1);
  store.lectures = store.lectures.filter((l) => l.courseId !== id);
  store.quizzes = store.quizzes.filter((q) => !lectureIds.includes(q.lectureId));
  store.enrollments = store.enrollments.filter((e) => e.courseId !== id);
  store.lectureProgress = store.lectureProgress.filter((p) => p.courseId !== id);
  await persistStore(store);
  return true;
}

export interface LectureInput {
  titleBn: string;
  titleEn: string;
  videoUrl: string;
  poster: string;
  durationSec: number;
}

export async function createLecture(
  courseId: string,
  input: LectureInput,
): Promise<LectureRecord> {
  const store = await getStore();
  const order =
    store.lectures.filter((l) => l.courseId === courseId).reduce(
      (max, l) => Math.max(max, l.order),
      0,
    ) + 1;
  const lecture: LectureRecord = {
    id: uid("lec"),
    courseId,
    order,
    titleBn: input.titleBn,
    titleEn: input.titleEn,
    videoUrl: input.videoUrl,
    poster: input.poster,
    durationSec: input.durationSec,
    chapters: [],
    attachments: [],
  };
  store.lectures.push(lecture);
  await persistStore(store);
  return lecture;
}

export async function updateLecture(
  id: string,
  input: LectureInput,
): Promise<LectureRecord | undefined> {
  const store = await getStore();
  const lecture = store.lectures.find((l) => l.id === id);
  if (!lecture) return undefined;
  lecture.titleBn = input.titleBn;
  lecture.titleEn = input.titleEn;
  lecture.videoUrl = input.videoUrl;
  lecture.poster = input.poster;
  lecture.durationSec = input.durationSec;
  await persistStore(store);
  return lecture;
}

export async function deleteLecture(id: string): Promise<boolean> {
  const store = await getStore();
  const index = store.lectures.findIndex((l) => l.id === id);
  if (index === -1) return false;
  const courseId = store.lectures[index].courseId;
  store.lectures.splice(index, 1);
  store.quizzes = store.quizzes.filter((q) => q.lectureId !== id);
  store.lectureProgress = store.lectureProgress.filter((p) => p.lectureId !== id);
  const remaining = store.lectures
    .filter((l) => l.courseId === courseId)
    .sort((a, b) => a.order - b.order);
  remaining.forEach((l, i) => {
    l.order = i + 1;
  });
  await persistStore(store);
  return true;
}

export async function moveLecture(id: string, direction: "up" | "down"): Promise<void> {
  const store = await getStore();
  const lecture = store.lectures.find((l) => l.id === id);
  if (!lecture) return;
  const siblings = store.lectures
    .filter((l) => l.courseId === lecture.courseId)
    .sort((a, b) => a.order - b.order);
  const pos = siblings.findIndex((l) => l.id === id);
  const swapWith = direction === "up" ? pos - 1 : pos + 1;
  if (swapWith < 0 || swapWith >= siblings.length) return;
  const other = siblings[swapWith];
  const tmp = lecture.order;
  lecture.order = other.order;
  other.order = tmp;
  await persistStore(store);
}

export async function getCourseBySlug(slug: string): Promise<CourseRecord | undefined> {
  return (await getStore()).courses.find((c) => c.slug === slug);
}

export async function getCourseById(id: string): Promise<CourseRecord | undefined> {
  return (await getStore()).courses.find((c) => c.id === id);
}

export async function listLectures(courseId: string): Promise<LectureRecord[]> {
  return (await getStore())
    .lectures.filter((l) => l.courseId === courseId)
    .sort((a, b) => a.order - b.order);
}

export async function getLecture(id: string): Promise<LectureRecord | undefined> {
  return (await getStore()).lectures.find((l) => l.id === id);
}

export async function getQuiz(lectureId: string): Promise<QuizRecord | undefined> {
  return (await getStore()).quizzes.find((q) => q.lectureId === lectureId);
}

export async function isEnrolled(userId: string, courseId: string): Promise<boolean> {
  return (await getStore()).enrollments.some(
    (e) => e.userId === userId && e.courseId === courseId,
  );
}

export async function enroll(userId: string, courseId: string): Promise<EnrollmentRecord> {
  const store = await getStore();
  const existing = store.enrollments.find(
    (e) => e.userId === userId && e.courseId === courseId,
  );
  if (existing) return existing;
  const record: EnrollmentRecord = {
    id: uid("enr"),
    userId,
    courseId,
    createdAt: new Date().toISOString(),
  };
  store.enrollments.push(record);
  await persistStore(store);
  return record;
}

export async function listEnrollments(userId: string): Promise<EnrollmentRecord[]> {
  return (await getStore()).enrollments.filter((e) => e.userId === userId);
}

export async function getProgressMap(
  userId: string,
  courseId: string,
): Promise<ProgressMap> {
  const map: ProgressMap = {};
  for (const p of (await getStore()).lectureProgress) {
    if (p.userId === userId && p.courseId === courseId) {
      map[p.lectureId] = {
        watchedSec: p.watchedSec,
        completed: p.completed,
        quizPassed: p.quizPassed,
      };
    }
  }
  return map;
}

export async function saveWatchProgress(
  userId: string,
  courseId: string,
  lectureId: string,
  watchedSec: number,
): Promise<void> {
  const store = await getStore();
  const lecture = store.lectures.find((l) => l.id === lectureId);
  if (!lecture) return;
  const clamped = Math.max(0, Math.min(watchedSec, lecture.durationSec));
  let record = store.lectureProgress.find(
    (p) => p.userId === userId && p.lectureId === lectureId,
  );
  const now = new Date().toISOString();
  if (!record) {
    record = {
      id: uid("prg"),
      userId,
      courseId,
      lectureId,
      watchedSec: clamped,
      completed: false,
      quizPassed: false,
      updatedAt: now,
    };
    store.lectureProgress.push(record);
  }
  record.watchedSec = Math.max(record.watchedSec, clamped);
  record.completed = isWatchedComplete(record.watchedSec, lecture.durationSec);
  record.updatedAt = now;
  await persistStore(store);
}

export async function setQuizResult(
  userId: string,
  courseId: string,
  lectureId: string,
  passed: boolean,
): Promise<void> {
  const store = await getStore();
  let record = store.lectureProgress.find(
    (p) => p.userId === userId && p.lectureId === lectureId,
  );
  const now = new Date().toISOString();
  if (!record) {
    record = {
      id: uid("prg"),
      userId,
      courseId,
      lectureId,
      watchedSec: 0,
      completed: false,
      quizPassed: false,
      updatedAt: now,
    };
    store.lectureProgress.push(record);
  }
  if (passed) record.quizPassed = true;
  record.updatedAt = now;
  await persistStore(store);
}
