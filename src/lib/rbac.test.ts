import { describe, expect, it } from "vitest";
import { can, ROLE_PERMISSIONS } from "@/lib/rbac";

describe("RBAC permission matrix", () => {
  it("grants admins every permission", () => {
    expect(can("ADMIN", "admin.all")).toBe(true);
    expect(can("ADMIN", "contests.grade")).toBe(true);
    expect(can("ADMIN", "ambassador.apply")).toBe(true);
  });

  it("lets students apply but not report activity", () => {
    expect(can("STUDENT", "ambassador.apply")).toBe(true);
    expect(can("STUDENT", "ambassador.reportActivity")).toBe(false);
  });

  it("lets ambassadors report activity but not review", () => {
    expect(can("AMBASSADOR", "ambassador.reportActivity")).toBe(true);
    expect(can("AMBASSADOR", "ambassador.review")).toBe(false);
  });

  it("lets mentors review applications", () => {
    expect(can("MENTOR", "ambassador.review")).toBe(true);
  });

  it("only grants admin.all to admins", () => {
    expect(can("MENTOR", "admin.all")).toBe(false);
    expect(can("INSTRUCTOR", "admin.all")).toBe(false);
  });

  it("defines a permission list for every role", () => {
    for (const perms of Object.values(ROLE_PERMISSIONS)) {
      expect(Array.isArray(perms)).toBe(true);
    }
  });
});