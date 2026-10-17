"use client";

import Link from "next/link";
import { CheckCircle2, Clock, Lightbulb, MessageSquare, TriangleAlert } from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { MathContent } from "@/components/MathContent";
import { NumericAnswerForm } from "@/components/NumericAnswerForm";
import { ProofSubmitForm } from "@/components/ProofSubmitForm";
import { difficultyLabel, levelLabel, topicMeta } from "@/lib/arena";
import type { ProblemKind, ProblemLevel, ProblemTopic, SubmissionVerdict } from "@/lib/types";

export interface ProblemDetailProps {
  problem: {
    id: string;
    slug: string;
    titleBn: string;
    titleEn: string;
    statementBn: string;
    statementEn: string;
    topic: ProblemTopic;
    levels: ProblemLevel[];
    difficulty: number;
    source: string;
    kind: ProblemKind;
    basePoints: number;
    solutionBn?: string;
    solutionEn?: string;
  };
  loggedIn: boolean;
  submission: {
    verdict: SubmissionVerdict;
    content: string;
    feedback?: string;
    createdAt: string;
  } | null;
  showSolution: boolean;
}

const VERDICT_STYLES: Record<SubmissionVerdict, string> = {
  PENDING: "bg-brand-blue/10 text-brand-blue",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  PARTIAL: "bg-amber-100 text-amber-700",
  WRONG: "bg-brand-red/10 text-brand-red",
};

export function ProblemDetail({ problem, loggedIn, submission, showSolution }: ProblemDetailProps) {
  const { lang, t } = useLang();
  const tm = topicMeta(problem.topic);
  const accepted = submission?.verdict === "ACCEPTED";

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-14">
      <Link href="/problems" className="text-sm font-bold text-brand-purple hover:text-brand-orange">
        ← {t("arena.archiveTitle")}
      </Link>

      <div className="card space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge text-white" style={{ backgroundColor: tm.tint }}>
            {lang === "bn" ? tm.bn : tm.en}
          </span>
          <span className="badge bg-brand-lavender/15 text-brand-charcoal/70">
            {lang === "bn" ? levelLabel(problem.levels[0]).bn : levelLabel(problem.levels[0]).en}
          </span>
          <span className="badge bg-brand-lavender/15 text-brand-charcoal/70">
            {difficultyLabel(problem.difficulty, lang)}
          </span>
          <span className="badge bg-brand-orange/10 text-brand-orange">
            +{problem.basePoints} {t("arena.points")}
          </span>
          {accepted && (
            <span className="badge bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t("arena.solved")}
            </span>
          )}
          <span className="ml-auto text-xs text-brand-charcoal/50">{problem.source}</span>
        </div>

        <h1 className="font-display text-2xl font-extrabold text-brand-blue">
          {lang === "bn" ? problem.titleBn : problem.titleEn}
        </h1>

        <div className="rounded-2xl bg-brand-purple/5 px-5 py-4 leading-relaxed">
          <MathContent text={lang === "bn" ? problem.statementBn : problem.statementEn} />
        </div>
      </div>

      {loggedIn ? (
        problem.kind === "NUMERIC" ? (
          <NumericAnswerForm problemId={problem.id} slug={problem.slug} />
        ) : (
          <ProofSubmitForm problemId={problem.id} slug={problem.slug} />
        )
      ) : (
        <div className="card flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 font-semibold text-brand-charcoal/70">
            <TriangleAlert className="h-4 w-4 text-brand-orange" />
            {t("arena.signInToSubmit")}
          </span>
          <Link href={`/auth/signin?callbackUrl=/problems/${problem.slug}`} className="btn-primary">
            {t("arena.submitAnswer")}
          </Link>
        </div>
      )}

      {submission && (
        <div className="card space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="field-label !mb-0">{t("arena.yourSubmission")}</span>
            <span className={`badge ${VERDICT_STYLES[submission.verdict]}`}>
              {t(`arena.verdict.${submission.verdict}`)}
            </span>
            <span className="ml-auto inline-flex items-center gap-1 text-xs text-brand-charcoal/50">
              <Clock className="h-3.5 w-3.5" />
              {new Date(submission.createdAt).toLocaleString(lang === "bn" ? "bn-BD" : "en-US")}
            </span>
          </div>
          <div className="rounded-2xl bg-brand-purple/5 px-4 py-3 text-sm">
            <MathContent text={submission.content} />
          </div>
          {submission.feedback && (
            <p className="inline-flex items-start gap-2 rounded-2xl bg-brand-blue/5 px-4 py-2 text-sm text-brand-charcoal/75">
              <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
              {submission.feedback}
            </p>
          )}
        </div>
      )}

      {showSolution && (problem.solutionBn || problem.solutionEn) && (
        <div className="card space-y-3 border-2 border-emerald-200">
          <h2 className="inline-flex items-center gap-2 font-display text-lg font-bold text-emerald-800">
            <Lightbulb className="h-5 w-5" />
            {t("arena.solution")}
          </h2>
          <div className="text-sm leading-relaxed text-brand-charcoal/80">
            <MathContent text={lang === "bn" ? problem.solutionBn ?? "" : problem.solutionEn ?? ""} />
          </div>
        </div>
      )}
    </div>
  );
}
