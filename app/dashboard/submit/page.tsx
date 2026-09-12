import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { challengeProgress, deadlineParts, weekDeadlineFromKey } from "@/lib/challenge";
import { submitLinkAction } from "@/lib/actions/challenge";
import { currentChallengeWeek, getWeeklyResultWithSubmission, processMissedWeeks } from "@/lib/challenge-service";
import { getAppContext } from "@/lib/page-context";

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user, profile, isAdmin } = await getAppContext();
  const challenge = await processMissedWeeks(user.id);
  if (!challenge) redirect("/onboarding");
  if (challengeProgress(challenge).completed) redirect(`/complete/${user.id}`);

  const weekStart = currentChallengeWeek(challenge);
  const q = await searchParams;
  const error = typeof q.error === "string" ? q.error : "";
  const { result, submission } = weekStart
    ? await getWeeklyResultWithSubmission(challenge.id, weekStart)
    : { result: null, submission: null };
  const remaining = weekStart ? deadlineParts(weekDeadlineFromKey(weekStart)) : null;

  return (
    <AppShell displayName={profile.display_name} isAdmin={isAdmin}>
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow">Weekly proof</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-.05em]">이번 주 작업을 기록하세요.</h1>

        {weekStart && remaining ? (
          <p className="mt-3 text-lg font-bold text-[var(--warning)]">
            마감까지 {remaining.days}일 {remaining.hours}시간 {remaining.minutes}분 · 일요일 23:59 KST
          </p>
        ) : (
          <p className="mt-3 leading-7 text-[var(--muted)]">
            첫 주간 판정은 {challenge.first_judgement_week_start}부터 시작됩니다.
          </p>
        )}

        {error && (
          <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-[var(--danger)]">
            {error}
          </div>
        )}

        {result ? (
          <div className="card mt-8 rounded-[2rem] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">이미 제출했습니다.</h2>
              {submission && <StatusBadge status={submission.verification_status} />}
            </div>
            {submission?.url && <p className="mt-3 break-all text-sm leading-6 text-[var(--muted)]">{submission.url}</p>}
            <Link href="/dashboard" className="secondary-button mt-6 w-full">
              대시보드로 돌아가기
            </Link>
          </div>
        ) : weekStart ? (
          <form action={submitLinkAction} className="card mt-8 rounded-[2rem] p-5 sm:p-7">
            <input type="hidden" name="weekStart" value={weekStart} />
            <label className="block text-sm font-extrabold">
              SNS 업로드 링크
              <input className="input-field mt-2" name="url" type="url" inputMode="url" placeholder="https://youtube.com/..." aria-describedby="link-help" required />
            </label>
            <p id="link-help" className="mt-2 text-xs leading-5 text-[var(--muted)]">
              YouTube, Instagram, TikTok 등 알려진 플랫폼은 형식 검증됩니다. 그 외 정상 URL도 제출은 인정되며 ‘미검증’으로 표시됩니다.
            </p>
            <button className="primary-button mt-6 w-full" type="submit">
              링크 제출하기
            </button>
          </form>
        ) : (
          <div className="card mt-8 rounded-[2rem] p-6">
            <p className="font-bold">아직 제출 기간이 아닙니다.</p>
            <Link href="/dashboard" className="secondary-button mt-5 w-full">
              대시보드로 돌아가기
            </Link>
          </div>
        )}

        <Link href="/dashboard" className="mt-6 inline-block text-sm font-bold text-[var(--muted)]">
          ← 내 챌린지로 돌아가기
        </Link>
      </div>
    </AppShell>
  );
}
