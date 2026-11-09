"use client";

import { useState } from "react";
import { Check, RotateCcw, Trophy, X } from "lucide-react";
import { useApp } from "@/components/shared/Providers";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useSyncedState } from "@/hooks/useSyncedState";
import { cn } from "@/lib/cn";
import { format, formatNumber } from "@/lib/format";

export function QuizView() {
  const { locale, dict } = useApp();
  const q = dict.quizzes;
  const questions = q.questions;
  const total = questions.length;

  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(total).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [best, setBest] = useSyncedState<number | null>("studymate-quiz-best", null);

  const answeredAll = answers.every((a) => a !== null);
  const score = answers.reduce<number>((sum, a, i) => (a === questions[i].answer ? sum + 1 : sum), 0);

  const select = (qi: number, oi: number) => {
    if (submitted) return;
    setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)));
  };

  const submit = () => {
    if (!answeredAll) return;
    setSubmitted(true);
    if (best === null || score > best) setBest(score);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => {
    setAnswers(Array(total).fill(null));
    setSubmitted(false);
  };

  const verdict = score === total ? q.excellent : score >= total / 2 ? q.good : q.keepGoing;

  return (
    <>
      <PageHeader title={q.title} subtitle={q.subtitle} />

      <div className="mx-auto max-w-2xl space-y-5">
        {submitted && (
          <Card className="flex flex-col items-center gap-2 p-6 text-center" role="status">
            <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-2 text-white">
              <Trophy className="size-7" aria-hidden />
            </span>
            <p className="text-sm text-muted">{q.yourScore}</p>
            <p className="text-3xl font-bold">
              {format(q.scoreOf, {
                score: formatNumber(score, locale),
                total: formatNumber(total, locale),
              })}
            </p>
            <p className="font-medium">{verdict}</p>
            {best !== null && (
              <p className="text-xs text-muted">
                {format(q.best, {
                  score: formatNumber(best, locale),
                  total: formatNumber(total, locale),
                })}
              </p>
            )}
            <Button variant="secondary" onClick={reset} className="mt-2">
              <RotateCcw className="size-4" aria-hidden />
              {q.retry}
            </Button>
          </Card>
        )}

        {questions.map((question, qi) => {
          const chosen = answers[qi];
          const isCorrect = chosen === question.answer;
          return (
            <Card key={qi} className="p-5">
              <p className="text-xs font-semibold text-brand">
                {format(q.questionNumber, { n: formatNumber(qi + 1, locale) })}
              </p>
              <h2 dir="auto" className="mt-1 font-semibold">
                {question.question}
              </h2>

              <div role="radiogroup" aria-label={question.question} className="mt-4 space-y-2">
                {question.options.map((option, oi) => {
                  const selected = chosen === oi;
                  const showCorrect = submitted && oi === question.answer;
                  const showWrong = submitted && selected && !isCorrect;
                  return (
                    <button
                      key={oi}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={submitted}
                      onClick={() => select(qi, oi)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-start text-sm transition",
                        showCorrect
                          ? "border-success bg-success/10"
                          : showWrong
                            ? "border-danger bg-danger/10"
                            : selected
                              ? "border-brand bg-brand/10"
                              : "border-border hover:bg-surface-2"
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-lg text-xs font-semibold",
                          selected || showCorrect ? "bg-brand text-white" : "bg-surface-2 text-muted"
                        )}
                      >
                        {q.optionLetters[oi]}
                      </span>
                      <span dir="auto" className="flex-1">
                        {option}
                      </span>
                      {showCorrect && <Check className="size-5 text-success" aria-hidden />}
                      {showWrong && <X className="size-5 text-danger" aria-hidden />}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div className="mt-4 rounded-xl bg-surface-2 p-3 text-sm">
                  <p className={cn("font-semibold", isCorrect ? "text-success" : "text-danger")}>
                    {isCorrect ? q.correct : q.incorrect}
                  </p>
                  {!isCorrect && (
                    <p className="mt-0.5">
                      {format(q.correctAnswer, { answer: question.options[question.answer] })}
                    </p>
                  )}
                  <p className="mt-1 text-muted">{question.explanation}</p>
                </div>
              )}
            </Card>
          );
        })}

        {!submitted && (
          <div className="flex flex-col items-center gap-2">
            <Button size="lg" onClick={submit} disabled={!answeredAll}>
              {q.submit}
            </Button>
            {!answeredAll && <p className="text-xs text-muted">{q.answerAll}</p>}
          </div>
        )}
      </div>
    </>
  );
}
