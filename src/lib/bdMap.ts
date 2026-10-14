import raw from "@/data/bd-districts-paths.json";

export interface DistrictShape {
  d: string;
  cx: number;
  cy: number;
}

interface DistrictMapFile {
  viewBox: string;
  width: number;
  height: number;
  districts: Record<string, DistrictShape>;
}

const data = raw as DistrictMapFile;

export const BD_MAP_VIEWBOX = data.viewBox;
export const BD_MAP_WIDTH = data.width;
export const BD_MAP_HEIGHT = data.height;

/** Real ADM2 boundary outlines for all 64 districts, keyed by English district name. */
export const DISTRICT_SHAPES: Record<string, DistrictShape> = data.districts;

export function districtShapeName(districtEn: string): string | undefined {
  return DISTRICT_SHAPES[districtEn] ? districtEn : undefined;
}
