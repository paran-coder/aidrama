import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { challengeProgress, deadlineParts, formatProofPeriod, formatShortKoreanDateKey, proofPeriodForAnchor, weekDeadlineFromKey } from "@/lib/challenge";
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
  const proofPeriod = proofPeriodForAnchor(challenge.first_judgement_week_start);
  const q = await searchParams;
  const error = typeof q.error === "string" ? q.error : "";
  const added = typeof q.added === "string" ? q.added : "";
  const { result, submission } = weekStart ? await getWeeklyResultWithSubmission(challenge.id, weekStart) : { result: null, submission: null };
  const remaining = weekStart ? deadlineParts(weekDeadlineFromKey(weekStart)) : null;

  return (
    <AppShell displayName={profile.display_name} isAdmin={isAdmin}>
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow">Weekly proof</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-.05em]">{weekStart ? "현재 인증 기간의 작업을 기록하세요." : "제출 일정을 확인하세요."}</h1>
        {weekStart && remaining && proofPeriod ? (
          <div className="mt-3 rounded-2xl border border-[var(--line)] bg-white/55 p-4">
            <p className="text-sm font-black text-[var(--muted)]">이번 인증 기간 · {proofPeriod.index}주차</p>
            <p className="mt-1 text-lg font-black text-[var(--ink)]">{formatProofPeriod(proofPeriod.startKey)}</p>
            <p className="mt-2 text-lg font-bold text-[var(--warning)]">마감까지 {remaining.days}일 {remaining.hours}시간 {remaining.minutes}분</p>
            <p className="mt-1 text-sm font-bold text-[var(--muted)]">다음 마감 · {formatShortKoreanDateKey(proofPeriod.endKey)} 23:59 KST · 시작일 기준 7일</p>
          </div>
        ) : (
          <div className="ui-warning copy-pretty mt-3 rounded-2xl border p-4 leading-7">현재 인증 기간을 계산하고 있습니다. 잠시 후 새로고침해 주세요.</div>
        )}
        {error && <div role="alert" className="ui-danger mt-6 rounded-2xl border p-4 text-sm font-bold">{error}</div>}
        {added && (
          <div role="status" className="ui-success copy-pretty mt-6 rounded-2xl border p-4 text-sm font-bold leading-6">
            추가 URL이 기록되었습니다. 이번 인증 기간의 공식 인정 링크와 스트릭은 처음 제출한 URL 기준으로 그대로 유지됩니다.
          </div>
        )}

        {result?.status === "success" && (
          <div className="card mt-8 rounded-[2rem] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Official submission</p>
                <h2 className="mt-2 text-xl font-black">이번 인증 기간은 이미 인증되었습니다.</h2>
              </div>
              {submission && <StatusBadge status={submission.verification_status} />}
            </div>
            <p className="copy-pretty mt-3 text-sm font-bold leading-6 text-[var(--muted)]">첫 정상 제출 URL이 공식 인정 링크로 고정됩니다. 같은 인증 기간 안에서는 작업 URL을 추가로 기록할 수 있지만 스트릭과 성공 횟수는 더 올라가지 않습니다.</p>
            {submission?.url && <a href={submission.url} target="_blank" rel="noreferrer" className="mt-3 block break-all text-sm font-bold text-[var(--accent)] underline underline-offset-4">{submission.url}</a>}
          </div>
        )}

        {result?.status === "failure" ? (
          <div className="ui-danger mt-8 rounded-[2rem] border p-6">
            <p className="text-lg font-black">현재 인증 기간은 실패로 확정되었습니다.</p>
            <p className="copy-pretty mt-2 text-sm font-bold leading-6">일반 제출로 결과를 되돌릴 수 없습니다. 판정에 문제가 있다면 운영자에게 문의해 주세요.</p>
          </div>
        ) : weekStart ? (
          <form action={submitLinkAction} className="card mt-6 rounded-[2rem] p-5 sm:p-7">
            <input type="hidden" name="weekStart" value={weekStart} />
            <label className="block text-sm font-extrabold">{result?.status === "success" ? "추가 작업 URL" : "SNS 업로드 링크"}
              <input className="input-field mt-2" name="url" type="url" inputMode="url" placeholder="https://youtube.com/..." aria-describedby="link-help" required />
            </label>
            <p id="link-help" className="mt-2 text-xs leading-5 text-[var(--muted)]">YouTube, Instagram, TikTok 등 알려진 플랫폼은 형식 검증됩니다. 그 외 정상 URL도 제출은 인정되며 ‘미검증’으로 표시됩니다.</p>
            {result?.status === "success" ? (
              <p className="copy-pretty mt-3 text-xs font-bold leading-5 text-[var(--accent)]">추가 URL은 제출 이력에만 저장됩니다. 공식 인정 링크, 스트릭, 성공 횟수, 배지는 처음 제출한 URL 기준으로 유지됩니다.</p>
            ) : (
              <p className="mt-3 text-xs font-bold leading-5 text-[var(--accent)]">이 인증 기간의 첫 정상 제출이 공식 인정 링크가 됩니다. 마일스톤 날짜를 지난 뒤 정상 인증에 성공하면 해당 배지가 영구적으로 기록됩니다.</p>
            )}
            <PendingSubmitButton className="primary-button mt-6 w-full" pendingLabel="제출 중...">{result?.status === "success" ? "추가 URL 기록하기" : "링크 제출하기"}</PendingSubmitButton>
          </form>
        ) : (
          <div className="card mt-8 rounded-[2rem] p-6">
            <p className="text-lg font-black">인증 기간 정보를 불러오지 못했습니다.</p>
            <p className="copy-pretty mt-2 text-sm leading-6 text-[var(--muted)]">잠시 후 다시 열어 주세요. 이미 저장된 챌린지 기록에는 영향이 없습니다.</p>
            <Link href="/dashboard" className="secondary-button mt-6 w-full">대시보드로 돌아가기</Link>
          </div>
        )}
        <Link href="/dashboard" className="mt-6 inline-block text-sm font-bold text-[var(--muted)]">← 내 챌린지로 돌아가기</Link>
      </div>
    </AppShell>
  );
}
