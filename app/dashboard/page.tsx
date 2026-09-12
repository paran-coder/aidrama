import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { OwlVisual } from "@/components/owl-visual";
import { ProgressBar } from "@/components/progress-bar";
import { StatusBadge } from "@/components/status-badge";
import { WarningDialog } from "@/components/warning-dialog";
import { challengeProgress, effectiveStage, OWL_STAGES } from "@/lib/challenge";
import { currentChallengeWeek, getWeeklyResult, processMissedWeeks } from "@/lib/challenge-service";
import { getAppContext } from "@/lib/page-context";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user, profile, isAdmin } = await getAppContext();
  const challenge = await processMissedWeeks(user.id);
  if (!challenge) redirect("/onboarding");

  const weekStart = currentChallengeWeek(challenge);
  const weeklyResult = weekStart ? await getWeeklyResult(challenge.id, weekStart) : null;
  const progress = challengeProgress(challenge);
  const stage = effectiveStage(challenge);
  const q = await searchParams;
  const submitted = typeof q.submitted === "string" ? q.submitted : "";

  return (
    <AppShell displayName={profile.display_name} isAdmin={isAdmin}>
      {!progress.completed && challenge.consecutive_failures >= 2 && (
        <WarningDialog failures={challenge.consecutive_failures} />
      )}
      <div className="grid gap-7 lg:grid-cols-[1.08fr_.92fr] lg:items-stretch">
        <section className="soft-shadow rounded-[2.6rem] p-3">
          <OwlVisual stage={stage} />
        </section>
        <section className="flex flex-col justify-center rounded-[2.4rem] border border-[var(--line)] bg-[rgba(255,253,248,.68)] p-6 sm:p-8">
          <p className="eyebrow">Your challenge</p>
          <div className="mt-6 grid grid-cols-2 gap-5">
            <div>
              <p className="display-number text-5xl sm:text-6xl">{challenge.streak}</p>
              <p className="mt-1 text-sm font-extrabold text-[var(--muted)]">주 연속 성공</p>
            </div>
            <div>
              <p className="display-number text-5xl sm:text-6xl">{progress.day}</p>
              <p className="mt-1 text-sm font-extrabold text-[var(--muted)]">1000일 중 경과일</p>
            </div>
          </div>
          <div className="mt-8">
            <ProgressBar value={progress.percent} label={`${progress.day} / 1000일`} />
          </div>
          <div className="mt-7 rounded-2xl bg-[var(--surface-2)] p-4">
            <p className="text-xs font-extrabold text-[var(--muted)]">현재 성장 단계</p>
            <p className="mt-1 text-lg font-black">{OWL_STAGES[stage].label}</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{OWL_STAGES[stage].subtitle}</p>
          </div>
          {submitted && (
            <div role="status" className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-[var(--success)]">
              이번 주 제출이 기록되었습니다. <StatusBadge status={submitted === "verified" ? "verified" : "unverified"} />
            </div>
          )}
          {progress.completed ? (
            <Link className="primary-button mt-6" href={`/complete/${user.id}`}>
              1000일 완주 기록 보기
            </Link>
          ) : weekStart ? (
            weeklyResult ? (
              <div className="mt-6 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-4 text-center font-extrabold text-[var(--success)]">
                ✓ 이번 주 제출 완료
              </div>
            ) : (
              <Link className="primary-button mt-6" href="/dashboard/submit">
                이번 주 업로드 제출하기
              </Link>
            )
          ) : (
            <div className="mt-6 rounded-2xl border border-[var(--line)] bg-white/60 p-4 text-sm font-bold leading-6 text-[var(--muted)]">
              첫 판정은 {challenge.first_judgement_week_start} 월요일부터 시작됩니다. 이번 주는 준비 기간입니다.
            </div>
          )}
        </section>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard/history" className="card rounded-[1.6rem] p-5 font-extrabold transition hover:-translate-y-0.5">
          업로드·실패 이력 보기 <span aria-hidden="true">→</span>
        </Link>
        <Link href="/community" className="card rounded-[1.6rem] p-5 font-extrabold transition hover:-translate-y-0.5">
          전체 참여자 현황 보기 <span aria-hidden="true">→</span>
        </Link>
      </div>
    </AppShell>
  );
}
