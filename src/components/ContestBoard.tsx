"use client";

import { Medal, Swords } from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { ContestList, type ContestListItem } from "@/components/ContestList";

export interface RatingRow {
  userId: string;
  name: string;
  rating: number;
  contests: number;
}

export function ContestBoard({
  contests,
  ratings,
}: {
  contests: ContestListItem[];
  ratings: RatingRow[];
}) {
  const { t } = useLang();

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <div className="text-center">
        <span className="badge bg-brand-orange/10 text-brand-orange">
          <Swords className="h-4 w-4" />
          {t("arena.contestTitle")}
        </span>
        <h1 className="section-title title-accent center mt-4">{t("arena.contestTitle")}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-brand-charcoal/65">{t("arena.contestSubtitle")}</p>
      </div>

      <div className="mt-10">
        <ContestList contests={contests} />
      </div>

      {ratings.length > 0 && (
        <section className="mt-12">
          <h2 className="section-title title-accent mt-1 inline-flex items-center gap-2 !text-2xl">
            <Medal className="h-6 w-6 text-brand-orange" />
            {t("arena.ratingBoard")}
          </h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-brand-lavender/20">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-purple/10 font-display text-brand-charcoal/70">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">{t("arena.name")}</th>
                  <th className="px-4 py-2 text-right">{t("arena.rating")}</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map((r, i) => (
                  <tr
                    key={r.userId}
                    className="odd:bg-white even:bg-brand-purple/5 transition hover:bg-brand-orange/5"
                  >
                    <td className="px-4 py-2 font-bold text-brand-charcoal/60">
                      {i < 3 ? (
                        <Medal
                          className={`h-4 w-4 ${
                            i === 0
                              ? "text-amber-500"
                              : i === 1
                                ? "text-slate-400"
                                : "text-amber-700"
                          }`}
                        />
                      ) : (
                        i + 1
                      )}
                    </td>
                    <td className="px-4 py-2">{r.name}</td>
                    <td className="px-4 py-2 text-right font-display font-bold text-brand-blue">
                      {r.rating}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
