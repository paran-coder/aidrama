import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { MilestoneBadges } from "@/components/milestone-badges";
import { MilestoneCelebration } from "@/components/milestone-celebration";
import { OwlVisual } from "@/components/owl-visual";
import { ProgressBar } from "@/components/progress-bar";
import { StatusBadge } from "@/components/status-badge";
import { WarningDialog } from "@/components/warning-dialog";
import { challengeProgress, formatKoreanDateKey } from "@/lib/challenge";
import { currentChallengeWeek, getChallengeBadges, getWeeklyResult, processMissedWeeks } from "@/lib/challenge-service";
import { CREATOR_LEVELS, MILESTONES, creatorLevelIndex, hasCompletionBadge, milestoneProgress, type Milestone } from "@/lib/growth";
import { getAppContext } from "@/lib/page-context";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user, profile, isAdmin } = await getAppContext();
  if (isAdmin) redirect("/admin");
  const challenge = await processMissedWeeks(user.id);
  if (!challenge) redirect("/onboarding");

  const weekStart = currentChallengeWeek(challenge);
  const [badges, weeklyResultCandidate] = await Promise.all([
    getChallengeBadges(challenge.id),
    weekStart ? getWeeklyResult(challenge.id, weekStart) : Promise.resolve(null),
  ]);
  const progress = challengeProgress(challenge);
  const completed = hasCompletionBadge(badges, progress.day);
  const weeklyResult = completed ? null : weeklyResultCandidate;
  const levelIndex = creatorLevelIndex(badges, progress.day);
  const level = CREATOR_LEVELS[levelIndex];
  const goal = milestoneProgress(progress.day, badges);
  const q = await searchParams;
  const submitted = typeof q.submitted === "string" ? q.submitted : "";
  const milestoneParam = typeof q.milestone === "string" ? Number(q.milestone) : NaN;
  const celebratedMilestone = MILESTONES.includes(milestoneParam as Milestone) ? milestoneParam as Milestone : null;

  return (
    <AppShell displayName={profile.display_name} isAdmin={isAdmin}>
      {!completed && challenge.consecutive_failures >= 2 && <WarningDialog failures={challenge.consecutive_failures} />}
      {celebratedMilestone && <MilestoneCelebration milestone={celebratedMilestone} userId={user.id} />}

      <div className="grid gap-7 lg:grid-cols-[1.05fr_.95fr] lg:items-stretch">
        <section className="soft-shadow rounded-[2.6rem] p-3">
          <OwlVisual stage={levelIndex} />
        </section>

        <section className="flex flex-col justify-center rounded-[2.4rem] border border-[var(--line)] bg-[rgba(255,253,248,.72)] p-6 sm:p-8">
          <p className="eyebrow">Your next milestone</p>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black text-[var(--muted)]">현재 목표</p>
              <p className="display-number mt-1 text-6xl">{goal.target ?? 1000}<span className="ml-1 font-sans text-lg font-black tracking-normal">일</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-[var(--muted)]">Lv.{level.level}</p>
              <p className="mt-1 font-black text-[var(--accent)]">{level.label}</p>
            </div>
          </div>

          <div className="mt-7">
            <ProgressBar value={goal.percent} label={goal.label} />
            {goal.target && progress.day >= goal.target && (
              <p className="mt-2 text-xs font-bold leading-5 text-[var(--accent)]">목표 날짜에 도달했습니다. 다음 정상 인증으로 {goal.target}일 배지를 확정하세요.</p>
            )}
          </div>

          <div className="mt-7 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-[var(--surface-2)] p-4">
              <p className="display-number text-4xl">{challenge.streak}</p>
              <p className="mt-1 text-xs font-black text-[var(--muted)]">현재 주간 스트릭</p>
            </div>
            <div className="rounded-2xl bg-[var(--surface-2)] p-4">
              <p className="display-number text-4xl">{progress.day}</p>
              <p className="mt-1 text-xs font-black text-[var(--muted)]">전체 1000일 중 경과일</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[var(--line)] bg-white/55 p-4">
            <div className="flex items-center justify-between gap-3 text-xs font-black text-[var(--muted)]"><span>전체 OWL1000 여정</span><span>{progress.percent.toFixed(1)}%</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface-2)]"><div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${progress.percent}%` }} /></div>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{level.subtitle}</p>
          </div>

          {submitted && (
            <div role="status" className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-[var(--success)]">
              이번 주 제출이 기록되었습니다. <StatusBadge status={submitted === "verified" ? "verified" : "unverified"} />
            </div>
          )}

          {completed ? (
            <Link className="primary-button mt-6" href={`/complete/${user.id}`}>OWL1000 완주 기록 보기</Link>
          ) : weekStart ? (
            weeklyResult ? (
              <div className="mt-6 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-4 text-center font-extrabold text-[var(--success)]">✓ 이번 주 제출 완료</div>
            ) : (
              <Link className="primary-button mt-6" href="/dashboard/submit">이번 주 업로드 제출하기</Link>
            )
          ) : (
            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-[var(--line)] bg-white/60 p-4 text-sm font-bold leading-6 text-[var(--muted)]">
                <p>첫 제출은 <strong className="text-[var(--ink)]">{formatKoreanDateKey(challenge.first_judgement_week_start)} 월요일 00:00 KST</strong>부터 가능합니다. 이번 주는 준비 기간입니다.</p>
                <p className="mt-2 text-xs leading-5">제출 가능 시간 · 매주 월요일 00:00 ~ 일요일 23:59 KST</p>
              </div>
              <button type="button" className="primary-button w-full" disabled aria-disabled="true">
                {formatKoreanDateKey(challenge.first_judgement_week_start)}부터 업로드 제출 가능
              </button>
              <p className="text-center text-xs font-bold text-[var(--muted)]">상단의 ‘이번 주 제출’ 메뉴에서도 제출 일정과 입력 화면을 언제든 확인할 수 있습니다.</p>
            </div>
          )}
        </section>
      </div>

      <section className="card mt-6 rounded-[2rem] p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="eyebrow">Milestones</p><h2 className="mt-2 text-xl font-black">쌓인 시간은 사라지지 않습니다.</h2></div>
          <p className="text-xs font-bold text-[var(--muted)]">100 · 300 · 600 · 900 · 1000</p>
        </div>
        <div className="mt-5"><MilestoneBadges badges={badges} currentDay={progress.day} /></div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard/history" className="card rounded-[1.6rem] p-5 font-extrabold transition hover:-translate-y-0.5">업로드·실패 이력 보기 <span aria-hidden="true">→</span></Link>
        <Link href="/community" className="card rounded-[1.6rem] p-5 font-extrabold transition hover:-translate-y-0.5">전체 참여자 현황 보기 <span aria-hidden="true">→</span></Link>
      </div>
    </AppShell>
  );
}
