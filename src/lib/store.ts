import { cache as reactCache } from "react";
import bcrypt from "bcryptjs";
import type {
  ApplicationRecord,
  ActivityRecord,
  BulletinRecord,
  ResourceItem,
  PointEntry,
  UserRecord,
  CourseRecord,
  LectureRecord,
  QuizRecord,
  EnrollmentRecord,
  LectureProgressRecord,
  CourseLevel,
  Attachment,
  ProblemRecord,
  SubmissionRecord,
  ContestRecord,
  ContestEntryRecord,
  PuzzleRecord,
  PuzzleSubmissionRecord,
  RatingRecord,
  ArticleRecord,
  CourseCategory,
  ProblemTopic,
  ProblemLevel,
  ProblemKind,
  SubmissionVerdict,
  ClubRecord,
  ClubEntryRecord,
} from "./types";
import { getAdapter } from "./data";
import type { DataAdapter } from "./data/types";

// `cache` only exists at runtime in Next's server bundle (React 18.3 canary).
// Fall back to a pass-through so non-Next consumers (Vitest, scripts) work.
type Cacher = <T extends (...args: never[]) => unknown>(fn: T) => T;
const cache: Cacher =
  (reactCache as unknown as Cacher | undefined) ?? ((fn) => fn);

export interface StoreShape {
  users: UserRecord[];
  applications: ApplicationRecord[];
  activities: ActivityRecord[];
  resourceItems: ResourceItem[];
  pointEntries: PointEntry[];
  bulletins: BulletinRecord[];
  courses: CourseRecord[];
  lectures: LectureRecord[];
  quizzes: QuizRecord[];
  enrollments: EnrollmentRecord[];
  lectureProgress: LectureProgressRecord[];
  problems: ProblemRecord[];
  submissions: SubmissionRecord[];
  contests: ContestRecord[];
  contestEntries: ContestEntryRecord[];
  puzzles: PuzzleRecord[];
  puzzleSubmissions: PuzzleSubmissionRecord[];
  ratings: RatingRecord[];
  articles: ArticleRecord[];
  clubs: ClubRecord[];
  clubEntries: ClubEntryRecord[];
}

const COLLECTIONS: (keyof StoreShape)[] = [
  "users",
  "applications",
  "activities",
  "resourceItems",
  "pointEntries",
  "bulletins",
  "courses",
  "lectures",
  "quizzes",
  "enrollments",
  "lectureProgress",
  "problems",
  "submissions",
  "contests",
  "contestEntries",
  "puzzles",
  "puzzleSubmissions",
  "ratings",
  "articles",
  "clubs",
  "clubEntries",
];

const emptyStore = (): StoreShape => ({
  users: [],
  applications: [],
  activities: [],
  resourceItems: [],
  pointEntries: [],
  bulletins: [],
  courses: [],
  lectures: [],
  quizzes: [],
  enrollments: [],
  lectureProgress: [],
  problems: [],
  submissions: [],
  contests: [],
  contestEntries: [],
  puzzles: [],
  puzzleSubmissions: [],
  ratings: [],
  articles: [],
  clubs: [],
  clubEntries: [],
});

/** Merge a persisted partial document into a fully-shaped store. */
function normalizeStore(partial: Partial<StoreShape> | null): StoreShape {
  const store = emptyStore();
  if (partial) {
    for (const key of COLLECTIONS) {
      if (Array.isArray(partial[key])) {
        (store[key] as unknown[]) = partial[key] as never;
      }
    }
  }
  return store;
}

/** A fully-seeded store, used the first time an empty backend is accessed. */
/**
 * Apply every per-collection seed guard to an existing store. Each guard is a
 * no-op when its collection is already populated, so this safely backfills
 * collections that were introduced after the store was first provisioned.
 * Returns `true` when anything changed.
 */
function backfillStore(store: StoreShape): boolean {
  const before = JSON.stringify(store);
  seedIfEmpty(store);
  seedArticlesIfEmpty(store);
  seedClubsIfEmpty(store);
  return JSON.stringify(store) !== before;
}

let jsonCache: StoreShape | null = null;
let seedPromise: Promise<void> | null = null;

/**
 * Populate a freshly provisioned backend exactly once. Guarded by a per-process
 * promise so concurrent cold-start requests don't double-seed.
 */
async function ensureSeed(adapter: DataAdapter): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const existing = normalizeStore(await adapter.load());
      if (backfillStore(existing)) {
        await adapter.save(existing);
      }
    })().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  await seedPromise;
}

/**
 * Load the store from the active backend, memoised once per request.
 *
 * - `json` mode keeps a per-process cache (fast, matches the previous
 *   in-memory behaviour).
 * - `postgres` mode reads once per request (via React `cache`) and seeds the
 *   database on first access. Without this, every repository call reloads the
 *   whole store, pushing data-heavy pages past the serverless timeout and
 *   surfacing as a client-side "Connection closed" error.
 */
export const getStore = cache(async (): Promise<StoreShape> => {
  const adapter = await getAdapter();
  if (adapter.kind === "json") {
    if (!jsonCache) {
      const store = normalizeStore(await adapter.load());
      if (backfillStore(store)) {
        await adapter.save(store);
      }
      jsonCache = store;
    }
    return jsonCache;
  }
  await ensureSeed(adapter);
  return normalizeStore(await adapter.load());
});

export async function persistStore(store: StoreShape): Promise<void> {
  const adapter = await getAdapter();
  await adapter.save(store);
  if (adapter.kind === "json") jsonCache = store;
}

function seedIfEmpty(store: StoreShape) {
  if (store.users.length > 0) return;
  const now = new Date().toISOString();
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@gonitishkul.local";
  const adminPass = process.env.SEED_ADMIN_PASSWORD ?? "Admin@12345";

  const admin: UserRecord = {
    id: "usr_admin",
    name: "Tawhid",
    email: adminEmail,
    passwordHash: bcrypt.hashSync(adminPass, 10),
    role: "ADMIN",
    createdAt: now,
  };
  const superAdminEmail = process.env.SEED_SUPERADMIN_EMAIL ?? "superadmin@gonitishkul.local";
  const superAdminPass = process.env.SEED_SUPERADMIN_PASSWORD ?? "SuperAdmin@12345";
  const superadmin: UserRecord = {
    id: "usr_superadmin",
    name: "Omar",
    email: superAdminEmail,
    passwordHash: bcrypt.hashSync(superAdminPass, 10),
    role: "ADMIN",
    createdAt: now,
  };
  const mentor: UserRecord = {
    id: "usr_mentor",
    name: "Samin",
    email: "mentor@gonitishkul.local",
    passwordHash: bcrypt.hashSync("Mentor@12345", 10),
    role: "MENTOR",
    createdAt: now,
  };

  const ambassadorUsers = [
    {
      id: "usr_amb1",
      name: "Siratim",
      district: "Dhaka",
      email: "sakib@example.com",
    },
    {
      id: "usr_amb2",
      name: "Sadat",
      district: "Chattogram",
      email: "nusrat@example.com",
    },
    {
      id: "usr_amb3",
      name: "Sehtaj",
      district: "Rajshahi",
      email: "rifat@example.com",
    },
    {
      id: "usr_amb4",
      name: "Omar",
      district: "Sylhet",
      email: "tasnim@example.com",
    },
    {
      id: "usr_amb5",
      name: "Tawhid",
      district: "Khulna",
      email: "mehjabin@example.com",
    },
  ];

  store.users.push(admin, superadmin, mentor);
  const pointsPlan: Record<string, number> = {
    usr_amb1: 520,
    usr_amb2: 410,
    usr_amb3: 335,
    usr_amb4: 210,
    usr_amb5: 95,
  };

  for (const amb of ambassadorUsers) {
    store.users.push({
      id: amb.id,
      name: amb.name,
      email: amb.email,
      passwordHash: bcrypt.hashSync("Doot@12345", 10),
      role: "AMBASSADOR",
      createdAt: now,
    });
    store.applications.push({
      id: `app_${amb.id}`,
      trackingCode: `GD-${amb.id.toUpperCase().replace("USR_", "")}0KQ`,
      fullName: amb.name,
      email: amb.email,
      phone: "015xx-xxxxxx",
      university: "University of Dhaka",
      department: "Mathematics",
      district: amb.district,
      division: "Dhaka",
      statement:
        "আমি গণিতের প্রতি ভালোবাসা নিয়ে জেলার শিক্ষার্থীদের মাঝে গণিতের সংস্কৃতি ছড়িয়ে দিতে চাই।",
      status: "ACCEPTED",
      timeline: [
        { status: "SUBMITTED", createdAt: now },
        { status: "UNDER_REVIEW", note: "ফর্ম হাতে পেয়েছি।", createdAt: now },
        { status: "ACCEPTED", note: "শুভেচ্ছা! তুমি গণিত দূত।", createdAt: now },
      ],
      userId: amb.id,
      createdAt: now,
      updatedAt: now,
    });
    store.pointEntries.push(
      ...[
        {
          id: `pt_${amb.id}_1`,
          userId: amb.id,
          source: "ACTIVITY" as const,
          points: 60,
          reason: "ক্যাম্পাস সার্কেল আয়োজন",
          createdAt: now,
        },
        {
          id: `pt_${amb.id}_2`,
          userId: amb.id,
          source: "BONUS" as const,
          points: pointsPlan[amb.id] - 60,
          reason: "অনুমোদিত কার্যক্রমের সামঞ্জস্য",
          createdAt: now,
        },
      ],
    );
  }

  const kits: ResourceItem[] = [
    {
      id: "kit_logo_pack",
      title: "Official Logo & Brand Kit",
      category: "Branding",
      description:
        "Prothom Alo Gonit Ishkul logo in PNG/SVG with proper color usage guide.",
      fileUrl: "/brand/logo.png",
      fileType: "image/png",
      fileSizeKb: 112,
      downloads: 1420,
    },
    {
      id: "kit_poster",
      title: "Event Poster Template",
      category: "Posters",
      description:
        "Editable poster template (Bangla) for local math festivals and workshops.",
      fileUrl: "/brand/slogan.png",
      fileType: "image/png",
      fileSizeKb: 1502,
      downloads: 986,
    },
    {
      id: "kit_deck",
      title: "Ambassador Presentation Deck",
      category: "Deck",
      description:
        "Intro slide deck explaining Gonit Ishkul and the Gonit Doot program.",
      fileUrl: "/brand/gonit-bhaiya.jpeg",
      fileType: "image/jpeg",
      fileSizeKb: 151,
      downloads: 611,
    },
  ];
  store.resourceItems.push(...kits);

  store.bulletins.push({
    id: "blt_1",
    title: "স্বাগতম — Gonit Doot Season 1",
    body: "চলতি মৌসুমে সকল দূতকে সেলফ ওরিয়েন্টেশন মডিউল সম্পন্ন করার অনুরোধ করা হলো।",
    pinned: true,
    createdAt: now,
  });

  store.activities.push(
    {
      id: "act_1",
      ambassadorId: "usr_amb1",
      type: "CAMPUS_CIRCLE",
      title: "গণিত সার্কেল — ঢাকা বিশ্ববিদ্যালয়",
      description: "সাপ্তাহিক সমস্যা সমাধান সেশন, ২৫ জন অংশগ্রহণকারী।",
      district: "Dhaka",
      participants: 25,
      points: 63,
      status: "APPROVED",
      createdAt: now,
    },
    {
      id: "act_2",
      ambassadorId: "usr_amb2",
      type: "WORKSHOP",
      title: "Scholarship Math Workshop",
      description: "রেলওয়ে স্কুল ও কলেজে প্রাথমিক গণিত কর্মশালা।",
      district: "Chattogram",
      participants: 40,
      points: 60,
      status: "APPROVED",
      createdAt: now,
    },
    {
      id: "act_3",
      ambassadorId: "usr_amb3",
      type: "SCHOOL_VISIT",
      title: "ইশকুল সফর — রাজশাহী",
      description: "৩টি স্কুলে গণিত ক্লাব গঠনের প্রস্তাবনা।",
      district: "Rajshahi",
      participants: 60,
      points: 60,
      status: "PENDING",
      createdAt: now,
    },
  );

  seedCourses(store, now);
  seedArena(store, now);
}

function seedCourses(store: StoreShape, now: string) {
  const VIDEO_SAMPLES = [
    "ForBiggerBlazes",
    "ForBiggerEscapes",
    "ForBiggerFun",
    "ForBiggerJoyrides",
    "ElephantsDream",
    "Sintel",
    "TearsOfSteel",
    "ForBiggerMeltdowns",
    "VolkswagenGTIReview",
    "SubaruOutbackOnStreetAndDirt",
  ];
  const videoUrl = (n: number) =>
    `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/${VIDEO_SAMPLES[n % VIDEO_SAMPLES.length]}.mp4`;

  const attachments = (prefix: string): Attachment[] => [
    {
      id: `${prefix}_slides`,
      titleBn: "লেকচার স্লাইড",
      titleEn: "Lecture Slides",
      type: "slides",
      fileUrl: "/downloads/lecture-slides.pdf",
      sizeKb: 1,
    },
    {
      id: `${prefix}_practice`,
      titleBn: "অনুশীলন শিট",
      titleEn: "Practice Sheet",
      type: "practice",
      fileUrl: "/downloads/practice-sheet.pdf",
      sizeKb: 1,
    },
    {
      id: `${prefix}_notes`,
      titleBn: "ইনস্ট্রাক্টর নোট",
      titleEn: "Instructor Notes",
      type: "notes",
      fileUrl: "/downloads/lecture-notes.pdf",
      sizeKb: 1,
    },
  ];

  const q = (
    id: string,
    pb: string,
    pe: string,
    opts: [string, string][],
    answerIndex: number,
  ) => ({
    id,
    promptBn: pb,
    promptEn: pe,
    options: opts.map(([bn, en]) => ({ bn, en })),
    answerIndex,
  });

  const quizBanks: Record<CourseLevel, ReturnType<typeof q>[]> = {
    PRIMARY: [
      q("pq1", "৭ + ৫ = কত?", "What is 7 + 5?", [["১০", "10"], ["১১", "11"], ["১২", "12"], ["১৩", "13"]], 2),
      q("pq2", "২ × ৩ = কত?", "What is 2 × 3?", [["৫", "5"], ["৬", "6"], ["৭", "7"], ["৮", "8"]], 1),
      q("pq3", "২০ − ৮ = কত?", "What is 20 − 8?", [["১০", "10"], ["১১", "11"], ["১২", "12"], ["১৪", "14"]], 2),
    ],
    JUNIOR: [
      q("jq1", "১ থেকে ২০ পর্যন্ত কতটি মৌলিক সংখ্যা আছে?", "How many primes are there from 1 to 20?", [["৭", "7"], ["৮", "8"], ["৯", "9"], ["১০", "10"]], 1),
      q("jq2", "একটি ত্রিভুজের তিন কোণের সমষ্টি কত?", "Sum of the angles of a triangle?", [["৯০°", "90°"], ["১৮০°", "180°"], ["২৭০°", "270°"], ["৩৬০°", "360°"]], 1),
      q("jq3", "২, ৪, ৮, ১৬, … ধারার পরের সংখ্যা?", "Next term of 2, 4, 8, 16, …?", [["১৮", "18"], ["২৪", "24"], ["৩২", "32"], ["৬৪", "64"]], 2),
    ],
    SECONDARY: [
      q("sq1", "১৭ একটি মৌলিক সংখ্যা?", "Is 17 a prime number?", [["হ্যাঁ", "Yes"], ["না", "No"]], 0),
      q("sq2", "gcd(24, 36) কত?", "What is gcd(24, 36)?", [["৬", "6"], ["৮", "8"], ["১২", "12"], ["২৪", "24"]], 2),
      q("sq3", "5! (৫ ফ্যাক্টোরিয়াল) = কত?", "What is 5! ?", [["২০", "20"], ["৬০", "60"], ["১২০", "120"], ["৭২০", "720"]], 2),
    ],
    HIGHER_SECONDARY: [
      q("hq1", "d/dx (x²) = কত?", "d/dx (x²) = ?", [["x", "x"], ["2x", "2x"], ["x²", "x²"], ["2", "2"]], 1),
      q("hq2", "lim(x→0) sin(x)/x = কত?", "lim(x→0) sin(x)/x = ?", [["০", "0"], ["১", "1"], ["∞", "∞"], ["অস্পষ্ট", "undefined"]], 1),
      q("hq3", "∫ 2x dx = কত?", "∫ 2x dx = ?", [["x² + C", "x² + C"], ["2 + C", "2 + C"], ["x + C", "x + C"], ["2x² + C", "2x² + C"]], 0),
    ],
    BDMO_PREP: [
      q("bq1", "১ থেকে ১০০ পর্যন্ত কতটি সংখ্যা ৩ দ্বারা বিভাজ্য?", "How many integers from 1 to 100 are divisible by 3?", [["৩০", "30"], ["৩২", "32"], ["৩৩", "33"], ["৩৪", "34"]], 2),
      q("bq2", "f(x) = 2x + 1 হলে f(3) = কত?", "If f(x) = 2x + 1 then f(3) = ?", [["৫", "5"], ["৬", "6"], ["৭", "7"], ["৯", "9"]], 2),
      q("bq3", "একটি সুষম ষড়ভুজের প্রতিটি কোণ কত ডিগ্রি?", "Interior angle of a regular hexagon?", [["৯০°", "90°"], ["১০৮°", "108°"], ["১২০°", "120°"], ["১৪৪°", "144°"]], 2),
    ],
  };

  const courseSeed: {
    slug: string;
    level: CourseLevel;
    category: CourseCategory;
    titleBn: string;
    titleEn: string;
    descBn: string;
    descEn: string;
    instructor: string;
    lectures: { bn: string; en: string }[];
  }[] = [
    {
      slug: "math-trivia-shorts",
      level: "PRIMARY",
      category: "TRIVIA",
      titleBn: "গণিত ট্রিভিয়া শর্টস",
      titleEn: "Math Trivia Shorts",
      descBn: "সম্পূর্ণ ফ্রি — মজার গণিত তথ্য আর ছোট ছোট ট্রিভিয়া ভিডিওর ট্র্যাক।",
      descEn: "Completely free — a track of fun math facts and bite-sized trivia videos.",
      instructor: "Samin",
      lectures: [
        { bn: "অদ্ভুত সংখ্যার রহস্য", en: "Strange Number Facts" },
        { bn: "শূন্যের গল্প", en: "The Story of Zero" },
        { bn: "পাই-এর খেলা", en: "Pi Playground" },
      ],
    },
    {
      slug: "random-problem-solutions",
      level: "JUNIOR",
      category: "SOLUTIONS",
      titleBn: "এলোমেলো সমস্যা সমাধান",
      titleEn: "Random Problem Solutions",
      descBn: "সম্পূর্ণ ফ্রি — এলোমেলো বাছাই করা সমস্যার ধাপে ধাপে সমাধান।",
      descEn: "Completely free — step-by-step solutions to a grab-bag of problems.",
      instructor: "Siratim",
      lectures: [
        { bn: "একটি সংখ্যাতত্ত্ব সমস্যা", en: "A Number Theory Problem" },
        { bn: "জ্যামিতির ধাঁধা", en: "A Geometry Puzzle" },
        { bn: "সমাবেশ সমস্যা", en: "A Combinatorics Problem" },
      ],
    },
    {
      slug: "mo-training-number-theory",
      level: "SECONDARY",
      category: "MO_TRAINING",
      titleBn: "MO প্রশিক্ষণ: সংখ্যাতত্ত্ব",
      titleEn: "MO Training: Number Theory",
      descBn: "সম্পূর্ণ ফ্রি — অলিম্পিয়াডের সংখ্যাতত্ত্বের নিবিড় প্রশিক্ষণ।",
      descEn: "Completely free — intensive olympiad-style number theory training.",
      instructor: "Sadat",
      lectures: [
        { bn: "বিভাজ্যতা কৌশল", en: "Divisibility Techniques" },
        { bn: "মডুলার পাটিগণিত", en: "Modular Arithmetic" },
        { bn: "ডায়োফ্যান্টাইন ভাবনা", en: "Diophantine Thinking" },
      ],
    },
    {
      slug: "mo-training-geometry-algebra",
      level: "BDMO_PREP",
      category: "MO_TRAINING",
      titleBn: "MO প্রশিক্ষণ: জ্যামিতি ও বীজগণিত",
      titleEn: "MO Training: Geometry & Algebra",
      descBn: "সম্পূর্ণ ফ্রি — জ্যামিতি, ফাংশনাল সমীকরণ ও প্রমাণের কৌশল।",
      descEn: "Completely free — geometry, functional equations and proof strategy.",
      instructor: "Sehtaj",
      lectures: [
        { bn: "সহসমতা ও বৃত্ত", en: "Congruence & Circles" },
        { bn: "ফাংশনাল সমীকরণ", en: "Functional Equations" },
        { bn: "প্রমাণের কৌশল", en: "Proof Strategy" },
      ],
    },
    {
      slug: "writing-math-articles",
      level: "HIGHER_SECONDARY",
      category: "ARTICLE_WRITING",
      titleBn: "গণিত আর্টিকেল লেখা",
      titleEn: "Writing Math Articles",
      descBn: "সম্পূর্ণ ফ্রি — গণিত নিয়ে পড়া ও লেখা, গল্প বলার কৌশল।",
      descEn: "Completely free — reading and writing about mathematics, telling a story.",
      instructor: "Omar",
      lectures: [
        { bn: "ভালো প্রশ্ন বাছাই", en: "Choosing a Good Problem" },
        { bn: "গল্পে গণিত", en: "Mathematics in a Story" },
        { bn: "সম্পাদনা ও প্রকাশ", en: "Editing & Publishing" },
      ],
    },
  ];

  let v = 0;
  for (const c of courseSeed) {
    const courseId = `crs_${c.slug}`;
    store.courses.push({
      id: courseId,
      slug: c.slug,
      titleBn: c.titleBn,
      titleEn: c.titleEn,
      level: c.level,
      descBn: c.descBn,
      descEn: c.descEn,
      instructor: c.instructor,
      category: c.category,
      published: true,
      createdAt: now,
    });

    c.lectures.forEach((lec, i) => {
      const lectureId = `lec_${c.slug}_${i + 1}`;
      store.lectures.push({
        id: lectureId,
        courseId,
        order: i + 1,
        titleBn: lec.bn,
        titleEn: lec.en,
        videoUrl: videoUrl(v++),
        poster: "/brand/logo.png",
        durationSec: 600 + i * 180,
        chapters: [
          { labelBn: "ভূমিকা", labelEn: "Introduction", atSec: 0 },
          { labelBn: "মূল ধারণা", labelEn: "Core idea", atSec: 150 },
          { labelBn: "উদাহরণ", labelEn: "Worked examples", atSec: 360 },
          { labelBn: "সারসংক্ষেপ", labelEn: "Summary", atSec: 540 + i * 180 },
        ],
        attachments: attachments(lectureId),
      });
      store.quizzes.push({
        lectureId,
        passPercent: 60,
        questions: quizBanks[c.level].map((question, qi) => ({
          ...question,
          id: `${lectureId}_q${qi + 1}`,
        })),
      });
    });
  }

  // Demo enrollments + partial progress so the classroom is populated.
  store.enrollments.push(
    { id: "enr_1", userId: "usr_amb1", courseId: "crs_primary-math-batch-1", createdAt: now },
    { id: "enr_2", userId: "usr_amb2", courseId: "crs_primary-math-batch-1", createdAt: now },
    { id: "enr_3", userId: "usr_amb4", courseId: "crs_bdmo-prep-intensive", createdAt: now },
  );
  store.lectureProgress.push(
    {
      id: "prg_1",
      userId: "usr_amb1",
      courseId: "crs_primary-math-batch-1",
      lectureId: "lec_primary-math-batch-1_1",
      watchedSec: 640,
      completed: true,
      quizPassed: true,
      updatedAt: now,
    },
    {
      id: "prg_2",
      userId: "usr_amb1",
      courseId: "crs_primary-math-batch-1",
      lectureId: "lec_primary-math-batch-1_2",
      watchedSec: 120,
      completed: false,
      quizPassed: false,
      updatedAt: now,
    },
  );
}

function seedArena(store: StoreShape, now: string) {
  const base = Date.parse(now);
  const at = (ms: number) => new Date(base + ms).toISOString();
  const DAY = 86_400_000;
  const HOUR = 3_600_000;

  const problemSeed: Omit<ProblemRecord, "id" | "createdAt">[] = [
    {
      slug: "sum-of-first-100",
      titleBn: "১ থেকে ১০০ পর্যন্ত যোগফল",
      titleEn: "Sum from 1 to 100",
      statementBn: "১ থেকে ১০০ পর্যন্ত সব পূর্ণসংখ্যার যোগফল বের করো, অর্থাৎ $1 + 2 + ... + 100$।",
      statementEn: "Find the sum of all integers from 1 to 100, i.e. $1 + 2 + ... + 100$.",
      topic: "NUMBER_THEORY",
      levels: ["PRIMARY", "JUNIOR"],
      difficulty: 1,
      source: "Gonit Ishkul Practice",
      kind: "NUMERIC",
      answer: "5050",
      tolerance: 0.0001,
      basePoints: 5,
      solutionBn: "সূত্র: $n(n+1)/2$। এখানে $100 × 101 / 2 = 5050$।",
      solutionEn: "Use $n(n+1)/2$: $100 × 101 / 2 = 5050$.",
      published: true,
    },
    {
      slug: "primes-below-50",
      titleBn: "৫০ এর নিচে মৌলিক সংখ্যা",
      titleEn: "Primes below 50",
      statementBn: "৫০ এর ছোট কতটি মৌলিক সংখ্যা আছে?",
      statementEn: "How many prime numbers are there below 50?",
      topic: "NUMBER_THEORY",
      levels: ["JUNIOR", "SECONDARY"],
      difficulty: 1,
      source: "BdMO Junior",
      kind: "NUMERIC",
      answer: "15",
      tolerance: 0.0001,
      basePoints: 8,
      solutionBn: "২,৩,৫,৭,১১,১৩,১৭,১৯,২৩,২৯,৩১,৩৭,৪১,৪৩,৪৭ — মোট ১৫টি।",
      solutionEn: "2,3,5,7,11,13,17,19,23,29,31,37,41,43,47 — 15 primes.",
      published: true,
    },
    {
      slug: "gcd-lcm-other-number",
      titleBn: "গসাগু-লসাগু থেকে অপর সংখ্যা",
      titleEn: "Other number from gcd & lcm",
      statementBn: "দুইটি সংখ্যার গসাগু $6$ ও লসাগু $72$। একটি সংখ্যা $18$ হলে অপরটি কত?",
      statementEn: "Two numbers have gcd $6$ and lcm $72$. If one is $18$, what is the other?",
      topic: "NUMBER_THEORY",
      levels: ["SECONDARY"],
      difficulty: 2,
      source: "BdMO Regional",
      kind: "NUMERIC",
      answer: "24",
      tolerance: 0.0001,
      basePoints: 10,
      solutionBn: "গসাগু × লসাগু = সংখ্যা দুটির গুণফল। তাই অপরটি $= 6×72/18 = 24$।",
      solutionEn: "gcd × lcm = product, so the other is $6×72/18 = 24$.",
      published: true,
    },
    {
      slug: "factorial-trailing-zeros",
      titleBn: "১০০! এর শেষে শূন্য",
      titleEn: "Trailing zeros in 100!",
      statementBn: "১০০! ($100!$) এর দশমিক রূপে শেষে কতটি শূন্য থাকবে?",
      statementEn: "How many trailing zeros does 100! ($100!$) have?",
      topic: "NUMBER_THEORY",
      levels: ["SECONDARY", "BDMO_REGIONAL"],
      difficulty: 3,
      source: "BdMO Regional 2019",
      kind: "NUMERIC",
      answer: "24",
      tolerance: 0.0001,
      basePoints: 12,
      solutionBn: "৫ এর গুণিতক: $⌊100/5⌋ + ⌊100/25⌋ = 20 + 4 = 24$।",
      solutionEn: "Count factors of 5: $⌊100/5⌋ + ⌊100/25⌋ = 20 + 4 = 24$.",
      published: true,
    },
    {
      slug: "quadratic-larger-root",
      titleBn: "দ্বিঘাত সমীকরণের বড় মূল",
      titleEn: "Larger root of a quadratic",
      statementBn: "সমীকরণ $x^2 - 5x + 6 = 0$ এর বড় মূল কত?",
      statementEn: "What is the larger root of $x^2 - 5x + 6 = 0$?",
      topic: "ALGEBRA",
      levels: ["JUNIOR", "SECONDARY"],
      difficulty: 1,
      source: "Gonit Ishkul Practice",
      kind: "NUMERIC",
      answer: "3",
      tolerance: 0.0001,
      basePoints: 8,
      solutionBn: "$(x-2)(x-3)=0$, মূল দুটি $2$ ও $3$; বড়টি $3$।",
      solutionEn: "$(x-2)(x-3)=0$ gives roots $2, 3$; the larger is $3$.",
      published: true,
    },
    {
      slug: "polygon-angle-sum",
      titleBn: "ষড়ভুজের কোণের সমষ্টি",
      titleEn: "Angle sum of a hexagon",
      statementBn: "একটি সুষম ষড়ভুজের অন্তঃকোণগুলোর সমষ্টি কত ডিগ্রি?",
      statementEn: "What is the sum (in degrees) of the interior angles of a regular hexagon?",
      topic: "GEOMETRY",
      levels: ["PRIMARY", "JUNIOR"],
      difficulty: 1,
      source: "Gonit Ishkul Practice",
      kind: "NUMERIC",
      answer: "720",
      tolerance: 0.0001,
      basePoints: 6,
      solutionBn: "$(n-2)×180 = (6-2)×180 = 720$।",
      solutionEn: "$(n-2)×180 = (6-2)×180 = 720$.",
      published: true,
    },
    {
      slug: "pythagorean-hypotenuse",
      titleBn: "সমকোণী ত্রিভুজের অতিভুজ",
      titleEn: "Hypotenuse of a right triangle",
      statementBn: "একটি সমকোণী ত্রিভুজের বাহু দুটি $9$ ও $12$; অতিভুজ কত?",
      statementEn: "A right triangle has legs $9$ and $12$; find the hypotenuse.",
      topic: "GEOMETRY",
      levels: ["JUNIOR"],
      difficulty: 1,
      source: "Gonit Ishkul Practice",
      kind: "NUMERIC",
      answer: "15",
      tolerance: 0.0001,
      basePoints: 8,
      solutionBn: "পিথাগোরাস: $9^2 + 12^2 = 225 = 15^2$।",
      solutionEn: "$9^2 + 12^2 = 225 = 15^2$, so the hypotenuse is $15$.",
      published: true,
    },
    {
      slug: "tangent-length",
      titleBn: "স্পর্শকের দৈর্ঘ্য",
      titleEn: "Length of a tangent",
      statementBn: "কেন্দ্র থেকে $13$ একক দূরে একটি বিন্দু থেকে $5$ একক ব্যাসার্ধের বৃত্তে অঙ্কিত স্পর্শকের দৈর্ঘ্য কত?",
      statementEn: "A tangent is drawn to a circle of radius $5$ from a point $13$ units from the centre. Find its length.",
      topic: "GEOMETRY",
      levels: ["SECONDARY", "BDMO_REGIONAL"],
      difficulty: 2,
      source: "BdMO Regional",
      kind: "NUMERIC",
      answer: "12",
      tolerance: 0.0001,
      basePoints: 12,
      solutionBn: "স্পর্শক কেন্দ্রে লম্ব: $√(13^2 - 5^2) = √144 = 12$।",
      solutionEn: "Radius ⟂ tangent, so $√(13^2 - 5^2) = √144 = 12$.",
      published: true,
    },
    {
      slug: "handshake-count",
      titleBn: "হ্যান্ডশেক সমস্যা",
      titleEn: "Handshake problem",
      statementBn: "$10$ জনের একটি দলে প্রত্যেকে প্রত্যেকের সাথে একবার হ্যান্ডশেক করলে মোট কতটি হ্যান্ডশেক হবে?",
      statementEn: "In a group of $10$, everyone shakes hands once with everyone else. How many handshakes occur?",
      topic: "COMBINATORICS",
      levels: ["JUNIOR", "SECONDARY"],
      difficulty: 2,
      source: "Gonit Ishkul Practice",
      kind: "NUMERIC",
      answer: "45",
      tolerance: 0.0001,
      basePoints: 10,
      solutionBn: "$C(10,2) = 10×9/2 = 45$।",
      solutionEn: "$C(10,2) = 10×9/2 = 45$.",
      published: true,
    },
    {
      slug: "no-two-consecutive-ones",
      titleBn: "পরপর ১ নেই এমন বাইনারি স্ট্রিং",
      titleEn: "Binary strings with no two consecutive 1s",
      statementBn: "দৈর্ঘ্য $5$ এর কতটি বাইনারি স্ট্রিং আছে যাতে কোনো দুইটি $1$ পাশাপাশি নেই?",
      statementEn: "How many binary strings of length $5$ contain no two consecutive $1$s?",
      topic: "COMBINATORICS",
      levels: ["SECONDARY", "BDMO_REGIONAL"],
      difficulty: 3,
      source: "BdMO Regional 2018",
      kind: "NUMERIC",
      answer: "13",
      tolerance: 0.0001,
      basePoints: 12,
      solutionBn: "ফিবোনাচি: দৈর্ঘ্য n-এর সংখ্যা $F(n+2)$; $F(7) = 13$।",
      solutionEn: "Fibonacci recurrence gives $F(7) = 13$.",
      published: true,
    },
    {
      slug: "power-mod-five",
      titleBn: "৭ এর ১০০ ঘাত (মড ৫)",
      titleEn: "7 to the 100th (mod 5)",
      statementBn: "$7^{100}$ কে $5$ দিয়ে ভাগ করলে ভাগশেষ কত?",
      statementEn: "What is the remainder when $7^{100}$ is divided by $5$?",
      topic: "NUMBER_THEORY",
      levels: ["HIGHER_SECONDARY", "BDMO_REGIONAL"],
      difficulty: 3,
      source: "Gonit Ishkul Practice",
      kind: "NUMERIC",
      answer: "1",
      tolerance: 0.0001,
      basePoints: 14,
      solutionBn: "$7 ≡ 2 (mod 5)$; $2^4 ≡ 1$ এবং $100$ চার দিয়ে বিভাজ্য, তাই ভাগশেষ $1$।",
      solutionEn: "$7 ≡ 2 (mod 5)$ and $2^4 ≡ 1$; since $4 | 100$, the remainder is $1$.",
      published: true,
    },
    {
      slug: "infinite-primes-proof",
      titleBn: "অসীম মৌলিক সংখ্যার প্রমাণ",
      titleEn: "Proof: infinitely many primes",
      statementBn: "প্রমাণ করো যে অসীম সংখ্যক মৌলিক সংখ্যা আছে।",
      statementEn: "Prove that there are infinitely many prime numbers.",
      topic: "PROOFS",
      levels: ["JUNIOR", "SECONDARY"],
      difficulty: 2,
      source: "Classic (Euclid)",
      kind: "PROOF",
      basePoints: 15,
      solutionBn: "ধরো মৌলিক সংখ্যা সসীম: $p_1, ..., p_n$। তবে $N = p_1 p_2 ... p_n + 1$ কোনো $p_i$ দ্বারা বিভাজ্য নয় — বিরোধ।",
      solutionEn: "Assume finitely many primes $p_1,...,p_n$. Then $N = p_1...p_n + 1$ is divisible by none of them — contradiction.",
      published: true,
    },
    {
      slug: "functional-equation-proof",
      titleBn: "ফাংশনাল সমীকরণ",
      titleEn: "Functional equation",
      statementBn: "সব ফাংশন $f : ℝ → ℝ$ নির্ণয় করো যাতে সব $x, y$ এর জন্য $f(x+y) = f(x) + f(y) + xy$ হয়।",
      statementEn: "Find all functions $f : ℝ → ℝ$ such that $f(x+y) = f(x) + f(y) + xy$ for all $x, y$.",
      topic: "ALGEBRA",
      levels: ["BDMO_NATIONAL", "IMO"],
      difficulty: 5,
      source: "IMO Shortlist",
      kind: "PROOF",
      basePoints: 25,
      solutionBn: "$g(x) = f(x) - x^2/2$ বসালে $g(x+y) = g(x) + g(y)$ (কসি); তাই $f(x) = x^2/2 + cx$।",
      solutionEn: "Set $g(x) = f(x) - x^2/2$; then $g$ is additive, so $f(x) = x^2/2 + cx$.",
      published: true,
    },
    {
      slug: "triangle-inequality-proof",
      titleBn: "ত্রিভুজের অসমতার প্রমাণ",
      titleEn: "Proof: triangle inequality",
      statementBn: "প্রমাণ করো: যেকোনো বাস্তব $a, b$ এর জন্য $|a+b| ≤ |a| + |b|$।",
      statementEn: "Prove that $|a+b| ≤ |a| + |b|$ for all real $a, b$.",
      topic: "PROOFS",
      levels: ["BDMO_NATIONAL"],
      difficulty: 4,
      source: "BdMO National",
      kind: "PROOF",
      basePoints: 20,
      solutionBn: "$(|a|+|b|)^2 - (a+b)^2 = 2(|ab| - ab) ≥ 0$; উভয় পক্ষ ধনাত্মক, তাই ফলটি সত্য।",
      solutionEn: "$(|a|+|b|)^2 - (a+b)^2 = 2(|ab| - ab) ≥ 0$, and both sides are non-negative.",
      published: true,
    },
  ];

  for (const p of problemSeed) {
    store.problems.push({ ...p, id: `prb_${p.slug}`, createdAt: now });
  }

  const contestSeed: Omit<ContestRecord, "id" | "createdAt">[] = [
    {
      slug: "weekly-arena-1",
      titleBn: "সাপ্তাহিক অ্যারিনা — পর্ব ১",
      titleEn: "Weekly Arena — Round 1",
      descBn: "ভিত্তি স্তরের চারটি সমস্যার ২ ঘণ্টার টাইমড কনটেস্ট।",
      descEn: "A 2-hour timed contest with four foundation-level problems.",
      startAt: at(-3 * DAY),
      endAt: at(-3 * DAY + 2 * HOUR),
      durationMin: 120,
      problemIds: [
        "prb_sum-of-first-100",
        "prb_quadratic-larger-root",
        "prb_handshake-count",
        "prb_polygon-angle-sum",
      ],
      published: true,
      editorialBn: "সারসংক্ষেপ: দ্রুত যোগের জন্য সূত্র ব্যবহার করো; হ্যান্ডশেকের জন্য সমাবেশ।",
      editorialEn: "Editorial: use the arithmetic-sum formula, and combinations for handshakes.",
    },
    {
      slug: "weekly-arena-2",
      titleBn: "সাপ্তাহিক অ্যারিনা — পর্ব ২",
      titleEn: "Weekly Arena — Round 2",
      descBn: "সংখ্যাতত্ত্ব ও সমাবেশের পাঁচটি সমস্যা — এখন লাইভ!",
      descEn: "Five number-theory and combinatorics problems — live now!",
      startAt: at(-1 * HOUR),
      endAt: at(3 * HOUR),
      durationMin: 90,
      problemIds: [
        "prb_gcd-lcm-other-number",
        "prb_factorial-trailing-zeros",
        "prb_tangent-length",
        "prb_no-two-consecutive-ones",
        "prb_power-mod-five",
      ],
      published: true,
    },
    {
      slug: "bdmo-mock-1",
      titleBn: "BdMO মক পরীক্ষা ১",
      titleEn: "BdMO Mock Test 1",
      descBn: "জাতীয়/IMO স্তরের প্রমাণমূলক সমস্যার মক পরীক্ষা।",
      descEn: "A mock olympiad focused on proof-based national/IMO-level problems.",
      startAt: at(2 * DAY),
      endAt: at(2 * DAY + 3 * HOUR),
      durationMin: 180,
      problemIds: [
        "prb_infinite-primes-proof",
        "prb_functional-equation-proof",
        "prb_triangle-inequality-proof",
      ],
      published: true,
    },
  ];

  for (const c of contestSeed) {
    store.contests.push({ ...c, id: `cnt_${c.slug}`, createdAt: now });
  }

  store.contestEntries.push(
    {
      id: "cen_1",
      contestId: "cnt_weekly-arena-1",
      userId: "usr_amb1",
      startedAt: at(-3 * DAY + 10 * 60000),
      submittedAt: at(-3 * DAY + 70 * 60000),
      answers: { "prb_sum-of-first-100": "5050", "prb_quadratic-larger-root": "3" },
      score: 13,
      ratingBefore: 1280,
      ratingAfter: 1305,
      createdAt: at(-3 * DAY + 10 * 60000),
    },
    {
      id: "cen_2",
      contestId: "cnt_weekly-arena-1",
      userId: "usr_amb2",
      startedAt: at(-3 * DAY + 20 * 60000),
      submittedAt: at(-3 * DAY + 80 * 60000),
      answers: { "prb_handshake-count": "45", "prb_polygon-angle-sum": "720" },
      score: 16,
      ratingBefore: 1300,
      ratingAfter: 1292,
      createdAt: at(-3 * DAY + 20 * 60000),
    },
    {
      id: "cen_3",
      contestId: "cnt_weekly-arena-1",
      userId: "usr_amb3",
      startedAt: at(-3 * DAY + 5 * 60000),
      submittedAt: at(-3 * DAY + 90 * 60000),
      answers: {
        "prb_sum-of-first-100": "5050",
        "prb_quadratic-larger-root": "3",
        "prb_handshake-count": "45",
        "prb_polygon-angle-sum": "720",
      },
      score: 29,
      ratingBefore: 1380,
      ratingAfter: 1400,
      createdAt: at(-3 * DAY + 5 * 60000),
    },
  );

  store.ratings.push(
    { id: "rtg_1", userId: "usr_amb1", rating: 1305, contests: 1, updatedAt: now },
    { id: "rtg_2", userId: "usr_amb2", rating: 1292, contests: 1, updatedAt: now },
    { id: "rtg_3", userId: "usr_amb3", rating: 1400, contests: 1, updatedAt: now },
    { id: "rtg_4", userId: "usr_amb4", rating: 1200, contests: 0, updatedAt: now },
  );

  store.puzzles.push(
    {
      id: "gb_week1",
      weekLabel: "সপ্তাহ ১",
      questionBn: "১ থেকে ১০০ পর্যন্ত সব সংখ্যার যোগফল কত?",
      questionEn: "What is the sum of all numbers from 1 to 100?",
      hintBn: "জোড়া বানিয়ে ভাবো।",
      hintEn: "Think in pairs.",
      answer: "5050",
      revealAt: at(-7 * DAY),
      published: true,
      createdAt: now,
    },
    {
      id: "gb_week2",
      weekLabel: "সপ্তাহ ২",
      questionBn: "দুই অঙ্কের কতটি সংখ্যা $3$ ও $5$ উভয় দ্বারা বিভাজ্য?",
      questionEn: "How many two-digit numbers are divisible by both $3$ and $5$?",
      hintBn: "উভয় দ্বারা বিভাজ্য মানে $15$ এর গুণিতক।",
      hintEn: "Divisible by both means a multiple of $15$.",
      answer: "6",
      revealAt: at(3 * DAY),
      published: true,
      createdAt: now,
    },
  );

  store.puzzleSubmissions.push(
    {
      id: "psub_1",
      puzzleId: "gb_week1",
      userId: "usr_amb1",
      content: "5050",
      isCorrect: true,
      createdAt: at(-8 * DAY),
    },
    {
      id: "psub_2",
      puzzleId: "gb_week1",
      userId: "usr_amb2",
      content: "5000",
      isCorrect: false,
      createdAt: at(-8 * DAY),
    },
  );
}

function seedArticlesIfEmpty(store: StoreShape) {
  if (store.articles.length > 0) return;
  const now = new Date().toISOString();
  const day = 86_400_000;
  const at = (ms: number) => new Date(Date.parse(now) + ms).toISOString();

  const seed: Omit<ArticleRecord, "id" | "createdAt" | "updatedAt">[] = [
    {
      slug: "why-zero-factorial-is-one",
      title: "কেন ০! = ১ ?",
      summary: "ফ্যাক্টোরিয়ালের সংজ্ঞা থেকে শুরু করে শূন্য ফ্যাক্টোরিয়াল কেন এক — একটি সহজ ব্যাখ্যা।",
      body:
        "আমরা জানি $n! = n \\times (n-1)!$। এখান থেকে $1! = 1 \\times 0!$, অর্থাৎ $0! = 1$। " +
        "গণনার দৃষ্টিতেও $0!$ মানে একটি খালি গুণফল, যার মান সংজ্ঞা অনুযায়ী $1$।",
      category: "TRIVIA",
      audience: "PUBLIC",
      tags: ["factorial", "combinatorics"],
      authorId: "usr_amb1",
      authorName: "Siratim",
      status: "PUBLISHED",
      views: 214,
      publishedAt: at(-6 * day),
    },
    {
      slug: "solving-sum-of-first-n-squares",
      title: "প্রথম n সংখ্যার বর্গের যোগফল",
      summary: "এলোমেলো একটি সমস্যা: $1^2 + 2^2 + \\dots + n^2$ এর সূত্র বের করার ধাপে ধাপে সমাধান।",
      body:
        "সূত্র: $\\sum_{k=1}^{n} k^2 = \\frac{n(n+1)(2n+1)}{6}$। " +
        "প্রমাণের একটি উপায় হলো $\\sum (k^3 - (k-1)^3)$ কলনবিদ্যা ব্যবহার করা।",
      category: "SOLUTIONS",
      audience: "PUBLIC",
      tags: ["algebra", "series"],
      authorId: "usr_amb2",
      authorName: "Sadat",
      status: "PUBLISHED",
      views: 158,
      publishedAt: at(-4 * day),
    },
    {
      slug: "modular-arithmetic-olympiad-toolkit",
      title: "অলিম্পিয়াডে মডুলার পাটিগণিত",
      summary: "MO প্রশিক্ষণের জন্য মডুলো ভাগশেষ, ফার্মা ও ইউলারের প্রয়োজনীয় কৌশল।",
      body:
        "মডুলার পাটিগণিত অলিম্পিয়াডের অন্যতম শক্তিশালী হাতিয়ার। " +
        "ফার্মার ছোট উপপাদ্য: $a^{p-1} \\equiv 1 \\pmod{p}$ যখন $p$ মৌলিক ও $a$ সহমৌলিক।",
      category: "MO_TRAINING",
      audience: "AMBASSADOR",
      tags: ["number theory", "modulo"],
      authorId: "usr_mentor",
      authorName: "Samin",
      status: "PUBLISHED",
      views: 97,
      publishedAt: at(-2 * day),
    },
    {
      slug: "telling-stories-with-mathematics",
      title: "গণিত দিয়ে গল্প বলা",
      summary: "শিক্ষার্থীদের জন্য আর্টিকেল লেখার পাঠ — শুরু থেকে প্রকাশ পর্যন্ত।",
      body:
        "একটি ভালো গণিত-আর্টিকেল শুরু হয় একটি তীক্ষ্ণ প্রশ্ন দিয়ে, তারপর আসে গল্প, দৃষ্টান্ত ও প্রমাণ। " +
        "পাঠকের কৌতূহল ধরে রাখাই আসল কাজ।",
      category: "ARTICLE_WRITING",
      audience: "AMBASSADOR",
      tags: ["writing", "education"],
      authorId: "usr_amb3",
      authorName: "Sehtaj",
      status: "PENDING",
      views: 0,
    },
    {
      slug: "pigeonhole-principle-intro",
      title: "কবুতরের খোপ নীতি — একটি পরিচয়",
      summary: "সহজ ভাষায় পিজিয়নহোল নীতি এবং এর অলিম্পিয়াড প্রয়োগ।",
      body:
        "যদি $n$ টি বস্তুকে $m$ টি খোপে রাখা হয় যেখানে $n > m$, তবে অন্তত একটি খোপে একাধিক বস্তু থাকবে। " +
        "এই সহজ নীতিই অনেক কঠিন সমস্যার সমাধান দেয়।",
      category: "SOLUTIONS",
      audience: "PUBLIC",
      tags: ["combinatorics", "pigeonhole"],
      authorId: "usr_amb4",
      authorName: "Omar",
      status: "PENDING",
      views: 0,
    },
  ];

  for (const article of seed) {
    store.articles.push({
      ...article,
      id: `art_${article.slug}`,
      createdAt: now,
      updatedAt: now,
    });
  }
}

function seedClubsIfEmpty(store: StoreShape) {
  if (store.clubs.length > 0) return;
  const now = new Date().toISOString();
  const day = 86_400_000;
  const at = (ms: number) => new Date(Date.parse(now) + ms).toISOString();

  // Representative logins (names kept within the curated demo cast).
  const reps: { id: string; name: string; email: string }[] = [
    { id: "usr_club_dhaka", name: "Tawhid", email: "dumath@gonitishkul.local" },
    { id: "usr_club_ndc", name: "Samin", email: "ndcmath@gonitishkul.local" },
    { id: "usr_club_rc", name: "Siratim", email: "rcmath@gonitishkul.local" },
  ];
  for (const rep of reps) {
    if (store.users.some((u) => u.email === rep.email)) continue;
    store.users.push({
      id: rep.id,
      name: rep.name,
      email: rep.email,
      passwordHash: bcrypt.hashSync("Club@12345", 10),
      role: "CLUB",
      createdAt: now,
    });
  }

  const clubs: ClubRecord[] = [
    {
      id: "club_du",
      slug: "dhaka-university-math-club",
      name: "Dhaka University Math Club",
      nameBn: "ঢাকা বিশ্ববিদ্যালয় গণিত ক্লাব",
      logoUrl: "/brand/logo.png",
      about:
        "ঢাকা বিশ্ববিদ্যালয়ের শিক্ষার্থীদের গণিতচর্চার প্রাণকেন্দ্র। সাপ্তাহিক সমস্যা সেশন, অলিম্পিয়াড কর্মশালা ও ক্যাম্পাস গণিত উৎসব আয়োজন করে।",
      aboutEn:
        "A hub for mathematical practice at the University of Dhaka — weekly problem sessions, olympiad workshops and campus math festivals.",
      district: "Dhaka",
      institution: "University of Dhaka",
      foundedYear: 2016,
      facebook: "https://www.facebook.com/PA.GonitIshkul/",
      contactEmail: "dumath@gonitishkul.local",
      representativeUserId: "usr_club_dhaka",
      representativeName: "Tawhid",
      status: "APPROVED",
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "club_ndc",
      slug: "notre-dame-math-club",
      name: "Notre Dame Math Club",
      nameBn: "নটর ডেম গণিত ক্লাব",
      logoUrl: "/brand/logo.png",
      about:
        "স্কুল শিক্ষার্থীদের জন্য গণিত অলিম্পিয়াড প্রস্তুতি ও মজার গণিত কর্মশালার একটি সক্রিয় ক্লাব।",
      aboutEn:
        "An active club preparing school students for math olympiads through fun, hands-on workshops.",
      district: "Dhaka",
      institution: "Notre Dame College",
      foundedYear: 2014,
      contactEmail: "ndcmath@gonitishkul.local",
      representativeUserId: "usr_club_ndc",
      representativeName: "Samin",
      status: "APPROVED",
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "club_rc",
      slug: "rajshahi-college-math-society",
      name: "Rajshahi College Math Society",
      nameBn: "রাজশাহী কলেজ গণিত সোসাইটি",
      about:
        "উত্তরবঙ্গের শিক্ষার্থীদের মধ্যে গণিতের সংস্কৃতি ছড়িয়ে দিতে কাজ করা একটি নতুন ক্লাব।",
      aboutEn:
        "A newly founded society spreading mathematical culture among students in northern Bangladesh.",
      district: "Rajshahi",
      institution: "Rajshahi College",
      foundedYear: 2021,
      contactEmail: "rcmath@gonitishkul.local",
      representativeUserId: "usr_club_rc",
      representativeName: "Siratim",
      status: "PENDING",
      published: false,
      createdAt: now,
      updatedAt: now,
    },
  ];
  store.clubs.push(...clubs);

  const entrySeed: Omit<ClubEntryRecord, "id" | "createdAt" | "updatedAt">[] = [
    {
      clubId: "club_du",
      type: "PROBLEM",
      title: "প্রমাণ করো: √2 অমূলদ",
      summary: "ক্লাসিক অমূলদতার প্রমাণ — শিক্ষানবিশদের জন্য আদর্শ।",
      body: "ধরো $\\sqrt{2} = p/q$ যেখানে $p, q$ সহমৌলিক। তবে $p^2 = 2q^2$, ফলে $p$ জোড় — বিরোধ।",
      topic: "PROOFS",
      level: "SECONDARY",
      difficulty: 2,
      answer: "√2 অমূলদ",
      tags: ["number theory", "proof"],
      status: "APPROVED",
      submittedById: "usr_club_dhaka",
      submittedByName: "Tawhid",
      approvedAt: at(-5 * day),
    },
    {
      clubId: "club_du",
      type: "NOTE",
      title: "মডুলার পাটিগণিতের নোট",
      summary: "ভাগশেষ, সহসমতা ও ছোট ফার্মার উপপাদ্যের সংক্ষিপ্ত নোট।",
      body: "সহসমতা $a \\equiv b \\pmod{n}$ মানে $n \\mid (a-b)$। ফার্মা: $a^{p-1} \\equiv 1 \\pmod{p}$।",
      tags: ["number theory", "modulo"],
      status: "APPROVED",
      submittedById: "usr_club_dhaka",
      submittedByName: "Tawhid",
      approvedAt: at(-4 * day),
    },
    {
      clubId: "club_du",
      type: "ARTICLE",
      title: "কেন গণিত সার্কেল গুরুত্বপূর্ণ",
      summary: "নিয়মিত সমস্যা সমাধান সেশন কীভাবে শিক্ষার্থীদের গড়ে তোলে।",
      body:
        "একটি গণিত সার্কেল কেবল সমস্যা সমাধান নয় — এটি প্রশ্ন করার, ভুল করা ও আবার চেষ্টা করার নিরাপদ জায়গা। " +
        "ধারাবাহিক চর্চাই অলিম্পিয়াড সাফল্যের মূল চাবিকাঠি।",
      tags: ["community", "education"],
      status: "APPROVED",
      submittedById: "usr_club_dhaka",
      submittedByName: "Tawhid",
      approvedAt: at(-3 * day),
    },
    {
      clubId: "club_du",
      type: "EVENT",
      title: "ক্যাম্পাস গণিত উৎসব ২০২৬",
      summary: "দিনব্যাপী সমস্যা সমাধান প্রতিযোগিতা ও কর্মশালা।",
      body: "সকাল ৯টা থেকে বিকেল ৫টা — জুনিয়র, সেকেন্ডারি ও উচ্চমাধ্যমিক বিভাগে তিনটি পৃথক প্রতিযোগিতা।",
      eventDate: at(14 * day),
      location: "University of Dhaka, Curzon Hall",
      tags: ["festival", "contest"],
      status: "APPROVED",
      submittedById: "usr_club_dhaka",
      submittedByName: "Tawhid",
      approvedAt: at(-2 * day),
    },
    {
      clubId: "club_du",
      type: "NOTE",
      title: "সাপ্তাহিক অনুশীলন সেট (অনুমোদন অপেক্ষমাণ)",
      summary: "এই সপ্তাহের অনুশীলন সমস্যার সেট — পর্যালোচনার অপেক্ষায়।",
      body: "১. $2^n + 1$ কতগুলো মৌলিক হবে? ২. একটি ত্রিভুজের মধ্যমা সংক্রান্ত অসমতা প্রমাণ করো।",
      tags: ["practice"],
      status: "PENDING",
      submittedById: "usr_club_dhaka",
      submittedByName: "Tawhid",
    },
    {
      clubId: "club_du",
      type: "ARTICLE",
      title: "গণিত ইশকুল প্রতিবেদন (বাতিল)",
      summary: "দুঃখিত, এই লেখাটি মানসম্মত নয়।",
      body: "দ্রুত অসম্পূর্ণ খসড়া।",
      tags: ["draft"],
      status: "REJECTED",
      reviewerNote: "লেখাটি অসম্পূর্ণ — মূল বক্তব্য যোগ করে আবার জমা দাও।",
      submittedById: "usr_club_dhaka",
      submittedByName: "Tawhid",
    },
    {
      clubId: "club_ndc",
      type: "PROBLEM",
      title: "হ্যান্ডশেক সমস্যা",
      summary: "সমাবেশের সহজ প্রয়োগ।",
      body: "$10$ জনের দলে প্রত্যেকে প্রত্যেকের সাথে একবার করমর্দন করলে মোট কতটি করমর্দন?",
      topic: "COMBINATORICS",
      level: "JUNIOR",
      difficulty: 1,
      answer: "45",
      tags: ["combinatorics"],
      status: "APPROVED",
      submittedById: "usr_club_ndc",
      submittedByName: "Samin",
      approvedAt: at(-3 * day),
    },
    {
      clubId: "club_ndc",
      type: "EVENT",
      title: "স্কুল গণিত কর্মশালা",
      summary: "নটর ডেম প্রাঙ্গণে দিনব্যাপী কর্মশালা।",
      body: "শ্রেণি ৬-১০ এর শিক্ষার্থীদের জন্য হাতে-কলমে জ্যামিতি ও সংখ্যাতত্ত্ব কর্মশালা।",
      eventDate: at(7 * day),
      location: "Notre Dame College, Dhaka",
      tags: ["workshop"],
      status: "APPROVED",
      submittedById: "usr_club_ndc",
      submittedByName: "Samin",
      approvedAt: at(-1 * day),
    },
    {
      clubId: "club_ndc",
      type: "ARTICLE",
      title: "অলিম্পিয়াড প্রস্তুতির রুটিন",
      summary: "ছোট শিক্ষার্থীদের জন্য সাপ্তাহিক প্রস্তুতি রুটিন।",
      body: "প্রতিদিন ৩০ মিনিট সমস্যা, সপ্তাহে একদিন পূর্ণ পরীক্ষা, মাসে একটি প্রতিযোগিতা — এভাবেই এগিয়ে চলো।",
      tags: ["prep", "routine"],
      status: "PENDING",
      submittedById: "usr_club_ndc",
      submittedByName: "Samin",
    },
    {
      clubId: "club_rc",
      type: "EVENT",
      title: "রাজশাহী গণিত সভা (ক্লাব অনুমোদনের অপেক্ষায়)",
      summary: "প্রথম সভার পরিকল্পনা।",
      body: "নতুন সদস্য আহ্বান ও অলিম্পিয়াড দল গঠনের প্রাথমিক আলোচনা।",
      eventDate: at(21 * day),
      location: "Rajshahi College",
      tags: ["meetup"],
      status: "PENDING",
      submittedById: "usr_club_rc",
      submittedByName: "Siratim",
    },
  ];

  for (const entry of entrySeed) {
    store.clubEntries.push({
      ...entry,
      id: `cle_${store.clubEntries.length + 1}_${entry.clubId}`,
      createdAt: now,
      updatedAt: now,
    });
  }
}

let seq = 0;
export function uid(prefix: string) {
  seq += 1;
  return `${prefix}_${Date.now().toString(36)}${seq.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}