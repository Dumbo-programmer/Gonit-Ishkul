import { describe, expect, it } from "vitest";
import { t, tList } from "@/lib/i18n/dictionary";

describe("i18n dictionary", () => {
  it("returns Bangla strings", () => {
    expect(t("common.home", "bn")).toBe("হোম");
  });

  it("returns English strings", () => {
    expect(t("common.home", "en")).toBe("Home");
  });

  it("falls back to the key for unknown paths", () => {
    expect(t("does.not.exist", "en")).toBe("exist");
  });

  it("returns bilingual lists for array keys", () => {
    const perks = tList("doot.perks", "bn");
    expect(perks.length).toBeGreaterThan(0);
    expect(perks[0]).toHaveProperty("bn");
    expect(perks[0]).toHaveProperty("en");
  });
});