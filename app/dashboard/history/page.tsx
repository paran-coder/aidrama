import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { getChallengeHistory, processMissedWeeks } from "@/lib/challenge-service";
import { formatProofPeriod } from "@/lib/challenge";
import { getAppContext } from "@/lib/page-context";
import type { WeeklyEffect } from "@/lib/types";

const effectLabels: Record<Exclude<WeeklyEffect, "none">, string> = {
  stage_drop: "이전 버전 성장 페널티",
  warning: "2회 연속 실패 경고",
  reset: "3회 연속 실패 · 다시 시작",
  recovery: "이전 버전 성장 회복",
};

export default async function HistoryPage() {
  const { user, profile, isAdmin } = await getAppContext();
  if (isAdmin) redirect("/admin");
  const challenge = await processMissedWeeks(user.id);
  if (!challenge) redirect("/onboarding");
  const { results, submissions } = await getChallengeHistory(challenge.id);

  return (
    <AppShell displayName={profile.display_name} isAdmin={isAdmin}>
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end justify-between gap-4"><div><p className="eyebrow">History</p><h1 className="mt-3 text-4xl font-black tracking-[-.05em]">꾸준함은 흔적이 남습니다.</h1><p className="mt-2 text-sm font-bold text-[var(--muted)]">실패가 있어도 획득한 레벨과 배지는 내려가지 않습니다.</p></div><Link href="/dashboard" className="hidden text-sm font-bold text-[var(--muted)] sm:block">← 대시보드</Link></div>
        {results.length === 0 ? (
          <div className="card mt-8 rounded-[2rem] p-8 text-center"><p className="text-lg font-black">아직 판정 이력이 없습니다.</p><p className="mt-2 text-sm text-[var(--muted)]">첫 7일 인증 기간이 끝나면 이곳에 기록이 쌓입니다.</p></div>
        ) : (
          <ol className="mt-8 space-y-3">
            {results.map((row) => {
              const submission = row.final_submission_id ? submissions.get(row.final_submission_id) : undefined;
              return (
                <li key={row.id} className="card rounded-[1.5rem] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-extrabold text-[var(--muted)]">{formatProofPeriod(row.week_start)}</p><p className="mt-1 text-lg font-black">{row.status === "success" ? "업로드 성공" : "업로드 없음"}</p></div><div className="flex gap-2"><StatusBadge status={row.status} />{submission && <StatusBadge status={submission.verification_status} />}</div></div>
                  {submission?.url && <a href={submission.url} target="_blank" rel="noreferrer" className="mt-3 block truncate text-sm font-bold text-[var(--accent)] underline underline-offset-4">{submission.url}</a>}
                  {row.effect !== "none" && <div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs font-bold text-[var(--muted)]">{effectLabels[row.effect]}</span></div>}
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </AppShell>
  );
}
