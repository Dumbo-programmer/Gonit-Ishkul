import { describe, expect, it } from "vitest";
import { getStore } from "@/lib/store";

const ALLOWED_NAMES = ["Tawhid", "Samin", "Siratim", "Sadat", "Sehtaj", "Omar"];

const CATEGORIES = ["TRIVIA", "SOLUTIONS", "MO_TRAINING", "ARTICLE_WRITING"];

describe("seed data (Phase 4 reframe)", () => {
  const store = getStore();

  it("recycles only the six approved names across all people", () => {
    const names = new Set<string>();
    for (const user of store.users) names.add(user.name);
    for (const app of store.applications) names.add(app.fullName);
    for (const course of store.courses) names.add(course.instructor);
    for (const article of store.articles) names.add(article.authorName);

    for (const name of names) {
      expect(ALLOWED_NAMES).toContain(name);
    }
    for (const name of ALLOWED_NAMES) {
      expect(names.has(name)).toBe(true);
    }
  });

  it("seeds free knowledge tracks by category with no pricing", () => {
    expect(store.courses.length).toBeGreaterThanOrEqual(5);
    for (const course of store.courses) {
      expect(CATEGORIES).toContain(course.category);
      expect("priceBdt" in course).toBe(false);
    }
  });

  it("always provides a universal admin account", () => {
    const superadmin = store.users.find(
      (u) => u.email === "superadmin@gonitishkul.local",
    );
    expect(superadmin?.role).toBe("ADMIN");
  });

  it("seeds published and pending articles", () => {
    expect(store.articles.length).toBeGreaterThanOrEqual(5);
    expect(store.articles.some((a) => a.status === "PUBLISHED")).toBe(true);
    expect(store.articles.some((a) => a.status === "PENDING")).toBe(true);
  });
});
