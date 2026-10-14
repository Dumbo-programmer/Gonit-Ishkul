import { describe, expect, it } from "vitest";
import { DISTRICTS } from "@/lib/districts";
import { BD_MAP_VIEWBOX, DISTRICT_SHAPES } from "@/lib/bdMap";

describe("Bangladesh district map data", () => {
  it("contains a boundary shape for all 64 districts", () => {
    expect(DISTRICTS).toHaveLength(64);
    for (const district of DISTRICTS) {
      const shape = DISTRICT_SHAPES[district.en];
      expect(shape, `missing shape for ${district.en}`).toBeDefined();
      expect(shape.d.startsWith("M")).toBe(true);
      expect(shape.d.endsWith("Z")).toBe(true);
    }
  });

  it("exposes a valid SVG viewBox", () => {
    expect(BD_MAP_VIEWBOX).toMatch(/^0 0 [\d.]+ [\d.]+$/);
  });

  it("places label centroids inside the viewBox", () => {
    const [, , w, h] = BD_MAP_VIEWBOX.split(" ").map(Number);
    for (const shape of Object.values(DISTRICT_SHAPES)) {
      expect(shape.cx).toBeGreaterThanOrEqual(0);
      expect(shape.cx).toBeLessThanOrEqual(w);
      expect(shape.cy).toBeGreaterThanOrEqual(0);
      expect(shape.cy).toBeLessThanOrEqual(h);
    }
  });
});