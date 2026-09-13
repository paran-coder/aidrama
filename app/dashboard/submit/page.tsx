import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { challengeProgress, deadlineParts, formatKoreanDateKey, weekDeadlineFromKey } from "@/lib/challenge";
import { submitLinkAction } from "@/lib/actions/challenge";
import { currentChallengeWeek, getChallengeBadges, getWeeklyResultWithSubmission, processMissedWeeks } from "@/lib/challenge-service";
import { hasCompletionBadge } from "@/lib/growth";
import { getAppContext } from "@/lib/page-context";

export default async function SubmitPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { user, profile, isAdmin } = await getAppContext();
  if (isAdmin) redirect("/admin");
  const challenge = await processMissedWeeks(user.id);
  if (!challenge) redirect("/onboarding");
  const badges = await getChallengeBadges(challenge.id);
  if (hasCompletionBadge(badges, challengeProgress(challenge).day)) redirect(`/complete/${user.id}`);

  const weekStart = currentChallengeWeek(challenge);
  const q = await searchParams;
  const error = typeof q.error === "string" ? q.error : "";
  const { result, submission } = weekStart ? await getWeeklyResultWithSubmission(challenge.id, weekStart) : { result: null, submission: null };
  const remaining = weekStart ? deadlineParts(weekDeadlineFromKey(weekStart)) : null;

  return (
    <AppShell displayName={profile.display_name} isAdmin={isAdmin}>
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow">Weekly proof</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-.05em]">{weekStart ? "이번 주 작업을 기록하세요." : "제출 일정을 확인하세요."}</h1>
        {weekStart && remaining ? (
          <div className="mt-3">
            <p className="text-lg font-bold text-[var(--warning)]">마감까지 {remaining.days}일 {remaining.hours}시간 {remaining.minutes}분 · 일요일 23:59 KST</p>
            <p className="mt-2 text-sm font-bold text-[var(--muted)]">제출 가능 시간 · 매주 월요일 00:00 ~ 일요일 23:59 KST</p>
          </div>
        ) : (
          <div className="mt-3 rounded-2xl border border-[var(--line)] bg-white/55 p-4 leading-7 text-[var(--muted)]">
            <p>첫 제출은 <strong className="text-[var(--ink)]">{formatKoreanDateKey(challenge.first_judgement_week_start)} 월요일 00:00 KST</strong>부터 가능합니다.</p>
            <p className="mt-1 text-sm font-bold">제출 가능 시간 · 매주 월요일 00:00 ~ 일요일 23:59 KST</p>
          </div>
        )}
        {error && <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-[var(--danger)]">{error}</div>}
        {result ? (
          <div className="card mt-8 rounded-[2rem] p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-black">이미 제출했습니다.</h2>{submission && <StatusBadge status={submission.verification_status} />}</div>{submission?.url && <p className="mt-3 break-all text-sm leading-6 text-[var(--muted)]">{submission.url}</p>}<Link href="/dashboard" className="secondary-button mt-6 w-full">대시보드로 돌아가기</Link></div>
        ) : weekStart ? (
          <form action={submitLinkAction} className="card mt-8 rounded-[2rem] p-5 sm:p-7"><input type="hidden" name="weekStart" value={weekStart} /><label className="block text-sm font-extrabold">SNS 업로드 링크<input className="input-field mt-2" name="url" type="url" inputMode="url" placeholder="https://youtube.com/..." aria-describedby="link-help" required /></label><p id="link-help" className="mt-2 text-xs leading-5 text-[var(--muted)]">YouTube, Instagram, TikTok 등 알려진 플랫폼은 형식 검증됩니다. 그 외 정상 URL도 제출은 인정되며 ‘미검증’으로 표시됩니다.</p><p className="mt-3 text-xs font-bold leading-5 text-[var(--accent)]">마일스톤 날짜를 지난 뒤 정상 인증에 성공하면 해당 배지가 영구적으로 기록됩니다.</p><PendingSubmitButton className="primary-button mt-6 w-full" pendingLabel="제출 중...">링크 제출하기</PendingSubmitButton></form>
        ) : (
          <div className="card mt-8 rounded-[2rem] p-6">
            <p className="text-lg font-black">이번 주는 준비 기간입니다.</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">제출 입력란은 첫 제출 가능 시점부터 자동으로 열립니다. 그 전에는 링크를 저장하거나 미리 제출할 수 없습니다.</p>
            <button type="button" className="primary-button mt-6 w-full" disabled aria-disabled="true">
              {formatKoreanDateKey(challenge.first_judgement_week_start)}부터 링크 입력 가능
            </button>
            <Link href="/dashboard" className="secondary-button mt-3 w-full">대시보드로 돌아가기</Link>
          </div>
        )}
        <Link href="/dashboard" className="mt-6 inline-block text-sm font-bold text-[var(--muted)]">← 내 챌린지로 돌아가기</Link>
      </div>
    </AppShell>
  );
}
