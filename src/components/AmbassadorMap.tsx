"use client";

import { useMemo, useState } from "react";
import { MapPin, Users, GraduationCap, X } from "lucide-react";
import {
  DISTRICTS,
  DIVISIONS,
  DIVISION_COLORS,
  type Division,
} from "@/lib/districts";
import {
  BD_MAP_VIEWBOX,
  DISTRICT_SHAPES,
} from "@/lib/bdMap";
import { useLang } from "@/lib/i18n/LangContext";
import { cn } from "@/lib/utils";

interface MapProps {
  coverage: Record<string, number>;
  schools?: Record<string, number>;
}

const DISTRICT_META = new Map(DISTRICTS.map((d) => [d.en, d]));

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

const NO_COVER = "#EDE8F7";
const LOW: [number, number, number] = [158, 128, 210];
const HIGH: [number, number, number] = [255, 120, 30];

function coverageFill(count: number, max: number) {
  if (count <= 0) return NO_COVER;
  const t = Math.min(1, 0.25 + 0.75 * (count / max));
  return `rgb(${lerp(LOW[0], HIGH[0], t)},${lerp(LOW[1], HIGH[1], t)},${lerp(
    LOW[2],
    HIGH[2],
    t,
  )})`;
}

export function AmbassadorMap({ coverage, schools = {} }: MapProps) {
  const { lang } = useLang();
  const [division, setDivision] = useState<Division | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<{ en: string; x: number; y: number } | null>(
    null,
  );

  const maxCoverage = useMemo(
    () => Math.max(1, ...Object.values(coverage)),
    [coverage],
  );

  const byDivision = useMemo(() => {
    const result = {} as Record<Division, number>;
    for (const div of DIVISIONS) result[div.en] = 0;
    for (const d of DISTRICTS) result[d.division] += coverage[d.en] ?? 0;
    return result;
  }, [coverage]);

  const totalDoots = Object.values(coverage).reduce((a, b) => a + b, 0);
  const coveredDistricts = DISTRICTS.filter((d) => (coverage[d.en] ?? 0) > 0).length;

  const visibleDivisions = division
    ? DIVISIONS.filter((d) => d.en === division)
    : DIVISIONS;

  const showLabel = (en: string) => {
    if (selected === en) return true;
    if (division) return DISTRICT_META.get(en)?.division === division;
    return (coverage[en] ?? 0) > 0;
  };

  const selectedMeta = selected ? DISTRICT_META.get(selected) : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setDivision(null);
              setSelected(null);
            }}
            className={cn(
              "rounded-full border-2 px-3 py-1.5 text-xs font-bold transition",
              division === null
                ? "border-brand-blue bg-brand-blue text-white"
                : "border-brand-lavender/40 text-brand-blue hover:border-brand-blue/60",
            )}
          >
            {lang === "bn" ? "সব বিভাগ" : "All divisions"}
          </button>
          {DIVISIONS.map((div) => (
            <button
              key={div.en}
              type="button"
              onClick={() => {
                setDivision((prev) => (prev === div.en ? null : div.en));
                setSelected(null);
              }}
              style={
                division === div.en
                  ? { backgroundColor: DIVISION_COLORS[div.en], borderColor: DIVISION_COLORS[div.en] }
                  : { borderColor: `${DIVISION_COLORS[div.en]}55` }
              }
              className={cn(
                "rounded-full border-2 px-3 py-1.5 text-xs font-bold transition",
                division === div.en ? "text-white" : "text-brand-charcoal/75 hover:opacity-90",
              )}
            >
              {lang === "bn" ? div.bn : div.en}
            </button>
          ))}
        </div>

        <div
          className="relative"
          onMouseLeave={() => setHover(null)}
        >
          <svg
            viewBox={BD_MAP_VIEWBOX}
            className="h-auto max-h-[34rem] w-full"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Bangladesh district coverage map"
          >
            <defs>
              <filter id="districtShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="3"
                  stdDeviation="3"
                  floodColor="#1B4594"
                  floodOpacity="0.16"
                />
              </filter>
            </defs>
            <g filter="url(#districtShadow)">
              {DISTRICTS.map((d) => {
                const shape = DISTRICT_SHAPES[d.en];
                if (!shape) return null;
                const count = coverage[d.en] ?? 0;
                const dimmed = division !== null && d.division !== division;
                const isSelected = selected === d.en;
                const isHover = hover?.en === d.en;
                return (
                  <path
                    key={d.en}
                    d={shape.d}
                    fill={coverageFill(count, maxCoverage)}
                    fillRule="evenodd"
                    stroke={isSelected ? "#1B4594" : "#FFFFFF"}
                    strokeWidth={isSelected ? 3 : 1}
                    vectorEffect="non-scaling-stroke"
                    opacity={dimmed ? 0.28 : 1}
                    className="cursor-pointer outline-none transition-[opacity,filter] duration-150"
                    style={{
                      filter: isHover ? "brightness(1.08) drop-shadow(0 0 3px rgba(27,69,148,0.5))" : undefined,
                    }}
                    onClick={() => setSelected((prev) => (prev === d.en ? null : d.en))}
                    onMouseMove={(e) => {
                      const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                      setHover({
                        en: d.en,
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      });
                    }}
                    onMouseEnter={() =>
                      setHover((h) => ({ en: d.en, x: h?.x ?? 0, y: h?.y ?? 0 }))
                    }
                  >
                    <title>
                      {`${lang === "bn" ? d.bn : d.en} — ${count} ${
                        lang === "bn" ? "দূত" : "doots"
                      }`}
                    </title>
                  </path>
                );
              })}

              {DISTRICTS.filter((d) => DISTRICT_SHAPES[d.en]).map((d) => {
                if (!showLabel(d.en)) return null;
                const shape = DISTRICT_SHAPES[d.en];
                const count = coverage[d.en] ?? 0;
                return (
                  <text
                    key={`label-${d.en}`}
                    x={shape.cx}
                    y={shape.cy}
                    textAnchor="middle"
                    className="pointer-events-none select-none font-semibold"
                    style={{
                      fontSize: 11,
                      fill: count > 0 ? "#ffffff" : "#22222299",
                      paintOrder: "stroke",
                      stroke: count > 0 ? "rgba(34,34,34,0.35)" : "rgba(255,255,255,0.85)",
                      strokeWidth: 2.4,
                    }}
                  >
                    {lang === "bn" ? d.bn : d.en}
                  </text>
                );
              })}
            </g>
          </svg>

          {hover && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[120%] whitespace-nowrap rounded-xl bg-brand-charcoal px-3 py-1.5 text-xs font-semibold text-white shadow-card"
              style={{ left: hover.x, top: hover.y }}
            >
              {lang === "bn" ? DISTRICT_META.get(hover.en)?.bn : hover.en}
              <span className="ml-2 text-brand-orange">
                {coverage[hover.en] ?? 0} {lang === "bn" ? "দূত" : "doots"}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-brand-charcoal/60">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-5 rounded" style={{ background: NO_COVER }} />
            {lang === "bn" ? "কভারেজ নেই" : "No coverage"}
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-3 w-5 rounded"
              style={{ background: coverageFill(maxCoverage, maxCoverage) }}
            />
            {lang === "bn" ? "সর্বোচ্চ কভারেজ" : "Highest coverage"}
          </span>
        </div>
      </div>

      <div className="card flex flex-col">
        {selectedMeta ? (
          <>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-brand-orange" />
                <div>
                  <h3 className="text-lg font-bold text-brand-blue">
                    {lang === "bn" ? selectedMeta.bn : selectedMeta.en}
                  </h3>
                  <p className="text-xs text-brand-charcoal/60">
                    {lang === "bn"
                      ? DIVISIONS.find((d) => d.en === selectedMeta.division)?.bn
                      : selectedMeta.division}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full p-1.5 text-brand-charcoal/50 hover:bg-brand-lavender/15"
                aria-label="Clear selection"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat
                icon={<Users className="h-4 w-4" />}
                label={lang === "bn" ? "সক্রিয় দূত" : "Active doots"}
                value={coverage[selectedMeta.en] ?? 0}
              />
              <Stat
                icon={<GraduationCap className="h-4 w-4" />}
                label={lang === "bn" ? "স্কুল কার্যক্রম" : "School activities"}
                value={schools[selectedMeta.division] ?? 0}
              />
            </div>
            <div
              className="mt-4 rounded-2xl px-4 py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: DIVISION_COLORS[selectedMeta.division] }}
            >
              {coverage[selectedMeta.en]
                ? lang === "bn"
                  ? "এই জেলায় গণিত দূত সক্রিয় আছেন।"
                  : "An ambassador is active in this district."
                : lang === "bn"
                  ? "এখানে এখনো কোনো দূত নেই — তুমি হতে পারো!"
                  : "No ambassador here yet — you could be the first!"}
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-brand-orange" />
              <h3 className="text-lg font-bold text-brand-blue">
                {lang === "bn" ? "জেলা নির্বাচন করুন" : "Select a district"}
              </h3>
            </div>
            <p className="mb-4 text-xs text-brand-charcoal/60">
              {lang === "bn"
                ? `মোট ${totalDoots} জন দূত, ${coveredDistricts}/৬৪ জেলায় কভারেজ।`
                : `${totalDoots} doots across ${coveredDistricts}/64 districts.`}
            </p>
            <div className="space-y-2">
              {visibleDivisions.map((div) => (
                <div key={div.en}>
                  <p
                    className="mb-1 text-xs font-bold uppercase tracking-wide"
                    style={{ color: DIVISION_COLORS[div.en] }}
                  >
                    {lang === "bn" ? div.bn : div.en}
                  </p>
                  <ul className="grid grid-cols-2 gap-1.5">
                    {DISTRICTS.filter((d) => d.division === div.en).map((d) => {
                      const count = coverage[d.en] ?? 0;
                      return (
                        <li key={d.en}>
                          <button
                            type="button"
                            onClick={() => setSelected(d.en)}
                            className={cn(
                              "flex w-full items-center justify-between rounded-lg border px-2.5 py-1.5 text-[11px] transition",
                              count > 0
                                ? "border-brand-orange/40 bg-brand-orange/10 font-semibold text-brand-blue"
                                : "border-brand-lavender/20 text-brand-charcoal/55 hover:border-brand-lavender/50",
                            )}
                          >
                            <span>{lang === "bn" ? d.bn : d.en}</span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {count}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-brand-lavender/10 px-4 py-3">
      <div className="flex items-center gap-1.5 text-brand-orange">{icon}</div>
      <p className="mt-1 font-display text-2xl font-extrabold text-brand-blue">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-brand-charcoal/50">{label}</p>
    </div>
  );
}
