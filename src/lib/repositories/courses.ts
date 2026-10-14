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

export function listCourses(): CourseRecord[] {
  return getStore()
    .courses.filter((c) => c.published)
    .map((c) => ({ ...c }));
}

export function listAllCourses(): CourseRecord[] {
  return [...getStore().courses].sort((a, b) =>
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

function uniqueCourseSlug(base: string, ignoreId?: string): string {
  const store = getStore();
  const root = slugify(base) || `course-${Date.now()}`;
  let slug = root;
  let n = 2;
  while (store.courses.some((c) => c.slug === slug && c.id !== ignoreId)) {
    slug = `${root}-${n}`;
    n += 1;
  }
  return slug;
}

export function createCourse(input: CourseInput): CourseRecord {
  const store = getStore();
  const course: CourseRecord = {
    id: uid("crs"),
    slug: uniqueCourseSlug(input.titleEn || input.titleBn),
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
  persistStore(store);
  return course;
}

export function updateCourse(
  id: string,
  input: CourseInput,
): CourseRecord | undefined {
  const store = getStore();
  const course = store.courses.find((c) => c.id === id);
  if (!course) return undefined;
  if (input.titleEn !== course.titleEn || input.titleBn !== course.titleBn) {
    course.slug = uniqueCourseSlug(input.titleEn || input.titleBn, id);
  }
  course.titleBn = input.titleBn;
  course.titleEn = input.titleEn;
  course.level = input.level;
  course.category = input.category;
  course.descBn = input.descBn;
  course.descEn = input.descEn;
  course.instructor = input.instructor;
  course.published = input.published;
  persistStore(store);
  return course;
}

export function setCoursePublished(id: string, published: boolean): void {
  const store = getStore();
  const course = store.courses.find((c) => c.id === id);
  if (!course) return;
  course.published = published;
  persistStore(store);
}

export function deleteCourse(id: string): boolean {
  const store = getStore();
  const index = store.courses.findIndex((c) => c.id === id);
  if (index === -1) return false;
  const lectureIds = store.lectures.filter((l) => l.courseId === id).map((l) => l.id);
  store.courses.splice(index, 1);
  store.lectures = store.lectures.filter((l) => l.courseId !== id);
  store.quizzes = store.quizzes.filter((q) => !lectureIds.includes(q.lectureId));
  store.enrollments = store.enrollments.filter((e) => e.courseId !== id);
  store.lectureProgress = store.lectureProgress.filter((p) => p.courseId !== id);
  persistStore(store);
  return true;
}

export interface LectureInput {
  titleBn: string;
  titleEn: string;
  videoUrl: string;
  poster: string;
  durationSec: number;
}

export function createLecture(
  courseId: string,
  input: LectureInput,
): LectureRecord {
  const store = getStore();
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
  persistStore(store);
  return lecture;
}

export function updateLecture(
  id: string,
  input: LectureInput,
): LectureRecord | undefined {
  const store = getStore();
  const lecture = store.lectures.find((l) => l.id === id);
  if (!lecture) return undefined;
  lecture.titleBn = input.titleBn;
  lecture.titleEn = input.titleEn;
  lecture.videoUrl = input.videoUrl;
  lecture.poster = input.poster;
  lecture.durationSec = input.durationSec;
  persistStore(store);
  return lecture;
}

export function deleteLecture(id: string): boolean {
  const store = getStore();
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
  persistStore(store);
  return true;
}

export function moveLecture(id: string, direction: "up" | "down"): void {
  const store = getStore();
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
  persistStore(store);
}


export function getCourseBySlug(slug: string): CourseRecord | undefined {
  return getStore().courses.find((c) => c.slug === slug);
}

export function getCourseById(id: string): CourseRecord | undefined {
  return getStore().courses.find((c) => c.id === id);
}

export function listLectures(courseId: string): LectureRecord[] {
  return getStore()
    .lectures.filter((l) => l.courseId === courseId)
    .sort((a, b) => a.order - b.order);
}

export function getLecture(id: string): LectureRecord | undefined {
  return getStore().lectures.find((l) => l.id === id);
}

export function getQuiz(lectureId: string): QuizRecord | undefined {
  return getStore().quizzes.find((q) => q.lectureId === lectureId);
}

export function isEnrolled(userId: string, courseId: string): boolean {
  return getStore().enrollments.some(
    (e) => e.userId === userId && e.courseId === courseId,
  );
}

export function enroll(userId: string, courseId: string): EnrollmentRecord {
  const store = getStore();
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
  persistStore(store);
  return record;
}

export function listEnrollments(userId: string): EnrollmentRecord[] {
  return getStore().enrollments.filter((e) => e.userId === userId);
}

export function getProgressMap(userId: string, courseId: string): ProgressMap {
  const map: ProgressMap = {};
  for (const p of getStore().lectureProgress) {
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

export function saveWatchProgress(
  userId: string,
  courseId: string,
  lectureId: string,
  watchedSec: number,
): void {
  const store = getStore();
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
  persistStore(store);
}

export function setQuizResult(
  userId: string,
  courseId: string,
  lectureId: string,
  passed: boolean,
): void {
  const store = getStore();
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
  persistStore(store);
}
