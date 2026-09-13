import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { AdminDeleteAccountPanel } from "@/components/admin-delete-account-panel";
import { MilestoneBadges } from "@/components/milestone-badges";
import { StatusBadge } from "@/components/status-badge";
import { correctWeeklyResultAction, setParticipantStatusAction } from "@/lib/actions/admin";
import { getAdminParticipant } from "@/lib/admin-service";
import { requireAdmin } from "@/lib/auth";
import { challengeProgress } from "@/lib/challenge";
import type { AuditAction, WeeklyEffect } from "@/lib/types";
import { CREATOR_LEVELS, creatorLevelIndex } from "@/lib/growth";

const effectLabels: Record<Exclude<WeeklyEffect, "none">, string> = {
  stage_drop: "이전 버전 성장 페널티",
  warning: "2회 연속 실패 경고",
  reset: "3회 연속 실패 · 다시 시작",
  recovery: "이전 버전 성장 회복",
};

const auditLabels: Record<AuditAction, string> = {
  weekly_result_corrected: "주간 결과 정정",
  invite_code_revoked: "초대 코드 발급 취소",
  user_suspended: "사용자 이용 정지",
  user_reactivated: "사용자 재활성화",
};

export default async function AdminParticipantPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { profile: adminProfile } = await requireAdmin();
  const { userId } = await params;
  const q = await searchParams;
  const error = typeof q.error === "string" ? q.error : "";
  const corrected = q.corrected === "1";
  const statusChanged = typeof q.statusChanged === "string" ? q.statusChanged : "";
  const data = await getAdminParticipant(userId);
  if (!data) notFound();

  const { profile, email, challenge, results, submissions, auditLogs, badges } = data;
  const progress = challenge ? challengeProgress(challenge) : null;
  const level = CREATOR_LEVELS[creatorLevelIndex(badges, progress?.day ?? 0)];
  const attemptsByWeek = new Map<string, typeof submissions>();
  submissions.forEach((submission) => {
    const list = attemptsByWeek.get(submission.week_start) ?? [];
    list.push(submission);
    attemptsByWeek.set(submission.week_start, list);
  });
  const officialSubmissionIds = new Set(results.flatMap((result) => result.final_submission_id ? [result.final_submission_id] : []));

  return (
    <AppShell displayName={adminProfile.display_name} isAdmin>
      <div className="mx-auto max-w-5xl">
        <Link href="/admin" className="text-sm font-bold text-[var(--muted)]">← 운영 관리</Link>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Participant operations</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-.05em]">{profile.display_name}</h1>
            <p className="mt-2 text-sm font-bold text-[var(--muted)]">{email ?? "이메일 확인 불가"}</p>
          </div>
          <div className="text-right">
            <span className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${profile.status === "active" ? "ui-success border" : "ui-danger border"}`}>{profile.status === "active" ? "활성 계정" : "이용 정지"}</span>
            {challenge && progress && <p className="mt-3 text-sm font-bold text-[var(--muted)]">{progress.day}일째 · 시작 {new Date(challenge.started_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}</p>}
          </div>
        </div>

        {corrected && <div role="status" className="ui-success mt-6 rounded-2xl border p-4 text-sm font-bold">주간 결과를 정정하고 현재 챌린지 상태를 다시 계산했습니다.</div>}
        {statusChanged && <div role="status" className="ui-success mt-6 rounded-2xl border p-4 text-sm font-bold">계정을 {statusChanged === "active" ? "다시 활성화" : "이용 정지"}했습니다. 기존 기록은 그대로 보존됩니다.</div>}
        {error && <div role="alert" className="ui-danger mt-6 rounded-2xl border p-4 text-sm font-bold">{error}</div>}

        {profile.role !== "admin" && (
          <section id="access" className="card mt-8 scroll-mt-24 rounded-[2rem] p-5 sm:p-7">
            <p className="eyebrow">Account access</p>
            <h2 className="mt-2 text-xl font-black">사용자 접근 관리</h2>
            <p className="copy-pretty mt-2 text-sm leading-6 text-[var(--muted)]">계정 이용 상태와 기록 삭제는 별개입니다. 이용 정지해도 가입 정보, 챌린지, 제출 이력은 삭제되지 않으며 다시 활성화하면 기존 기록에서 이어집니다.</p>
            {profile.status === "suspended" && profile.suspension_reason && <div className="ui-danger copy-pretty mt-4 rounded-2xl border p-4 text-sm font-bold">현재 정지 사유: {profile.suspension_reason}</div>}
            <form action={setParticipantStatusAction} className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <input type="hidden" name="targetUserId" value={userId} />
              <input type="hidden" name="status" value={profile.status === "active" ? "suspended" : "active"} />
              <label className="block text-sm font-bold">{profile.status === "active" ? "이용 정지 사유" : "재활성화 사유"}<input className="input-field mt-2" name="reason" minLength={3} maxLength={500} placeholder={profile.status === "active" ? "예: 운영 정책 위반 또는 일시 이용 중지 요청" : "예: 운영 확인 후 이용 재개"} required /></label>
              <PendingSubmitButton className={profile.status === "active" ? "danger-button" : "primary-button"} pendingLabel="변경 중...">{profile.status === "active" ? "사용자 이용 정지" : "사용자 다시 활성화"}</PendingSubmitButton>
            </form>
            <AdminDeleteAccountPanel userId={userId} displayName={profile.display_name} />
          </section>
        )}

        {!challenge ? (
          <div className="card mt-8 rounded-[2rem] p-8"><p className="font-black">아직 챌린지를 시작하지 않은 사용자입니다.</p></div>
        ) : (
          <>
            <section className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                ["현재 스트릭", challenge.streak],
                ["최장 스트릭", challenge.longest_streak],
                ["연속 실패", challenge.consecutive_failures],
                ["성공", challenge.success_count],
                ["실패", challenge.failure_count],
                ["레벨", `Lv.${level.level}`],
              ].map(([label, value]) => <div key={String(label)} className="card rounded-2xl p-4"><p className="display-number text-3xl">{value}</p><p className="mt-1 text-xs font-bold text-[var(--muted)]">{label}</p></div>)}
            </section>

            <section className="card mt-6 rounded-[2rem] p-5 sm:p-7">
              <p className="eyebrow">Creator growth</p>
              <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="mt-2 text-xl font-black">Lv.{level.level} · {level.label}</h2><p className="mt-1 text-sm text-[var(--muted)]">{level.subtitle}</p></div></div>
              <div className="mt-5"><MilestoneBadges badges={badges} currentDay={progress?.day ?? 0} /></div>
            </section>

            <section id="submissions" className="card mt-6 scroll-mt-24 rounded-[2rem] p-5 sm:p-7">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div><p className="eyebrow">Submission links</p><h2 className="mt-2 text-xl font-black">참여자 제출 링크</h2></div>
                <p className="text-sm font-bold text-[var(--muted)]">총 {submissions.length}건</p>
              </div>
              <p className="copy-pretty mt-2 text-sm leading-6 text-[var(--muted)]">참여자가 제출한 원본 URL을 확인할 수 있습니다. 공식 주간 결과에 채택된 링크는 ‘공식 인정’으로 표시됩니다.</p>
              {submissions.length === 0 ? (
                <div className="mt-5 rounded-2xl bg-[var(--surface-2)] p-5 text-sm font-bold text-[var(--muted)]">아직 제출된 링크가 없습니다.</div>
              ) : (
                <div className="mt-5 space-y-3">
                  {submissions.map((submission) => (
                    <article key={submission.id} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div><p className="text-xs font-black text-[var(--muted)]">{submission.week_start} 주차</p><p className="mt-1 text-xs font-bold text-[var(--muted)]">{new Date(submission.submitted_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</p></div>
                        <div className="flex items-center gap-2"><StatusBadge status={submission.verification_status} />{officialSubmissionIds.has(submission.id) && <span className="ui-success rounded-full border px-2.5 py-1 text-xs font-extrabold">공식 인정</span>}</div>
                      </div>
                      <a className="copy-pretty mt-3 block break-all font-bold text-[var(--accent)] underline underline-offset-4" href={submission.url} target="_blank" rel="noreferrer">{submission.url}</a>
                      {submission.platform_host && <p className="mt-2 text-xs font-bold text-[var(--muted)]">{submission.platform_host}</p>}
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="card mt-6 rounded-[2rem] p-5 sm:p-7">
              <p className="eyebrow">Correction</p>
              <h2 className="mt-2 text-xl font-black">주간 결과 정정</h2>
              <p className="copy-pretty mt-2 text-sm leading-6 text-[var(--muted)]">운영상 명백한 판정 오류만 수정하십시오. 모든 정정은 사유와 함께 감사 로그에 남고, 전체 스트릭·연속 실패 상태가 공식 주간 이력에서 다시 계산됩니다. 이미 획득한 레벨과 배지는 회수되지 않습니다.</p>
              <form action={correctWeeklyResultAction} className="mt-5 grid gap-4 md:grid-cols-2">
                <input type="hidden" name="targetUserId" value={userId} />
                <input type="hidden" name="challengeId" value={challenge.id} />
                <label className="block text-sm font-bold">주차 시작일 (월요일)<input className="input-field mt-2" type="date" name="weekStart" min={challenge.first_judgement_week_start} required /></label>
                <label className="block text-sm font-bold">공식 결과<select className="input-field mt-2" name="status" defaultValue="success" required><option value="success">성공</option><option value="failure">실패</option></select></label>
                <label className="block text-sm font-bold md:col-span-2">인정할 업로드 링크 (성공 정정 시 필요할 수 있음)<input className="input-field mt-2" name="url" type="url" inputMode="url" placeholder="https://..." /></label>
                <label className="block text-sm font-bold md:col-span-2">정정 사유<textarea className="input-field mt-2 min-h-24 resize-y" name="reason" minLength={3} maxLength={500} placeholder="예: 마감 전 제출 확인 후 수동 성공 정정" required /></label>
                <div className="md:col-span-2"><PendingSubmitButton pendingLabel="정정 및 재계산 중...">결과 정정 및 전체 상태 재계산</PendingSubmitButton></div>
              </form>
            </section>

            <section className="mt-9">
              <div><p className="eyebrow">Official history</p><h2 className="mt-2 text-2xl font-black">공식 주간 결과</h2></div>
              {results.length === 0 ? <div className="card mt-4 rounded-[1.8rem] p-7 font-bold text-[var(--muted)]">아직 공식 주간 결과가 없습니다.</div> : (
                <div className="mt-4 space-y-3">
                  {results.map((result) => {
                    const attempts = attemptsByWeek.get(result.week_start) ?? [];
                    return <div key={result.id} className="card rounded-[1.6rem] p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold text-[var(--muted)]">{result.week_start} · {result.source}</p><p className="mt-1 font-black">공식 결과: {result.status === "success" ? "성공" : "실패"}</p></div><StatusBadge status={result.status} /></div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-[var(--muted)]"><span>스트릭 {result.streak_after}</span><span>·</span><span>연속실패 {result.consecutive_failures_after}</span>{result.effect !== "none" && <><span>·</span><span>{effectLabels[result.effect]}</span></>}</div>
                      {attempts.length > 0 && <div className="mt-4 border-t border-[var(--line)] pt-4"><p className="text-xs font-black text-[var(--muted)]">제출 이력 {attempts.length}건</p><div className="mt-2 space-y-2">{attempts.map((attempt) => <div key={attempt.id} className="rounded-xl bg-[var(--surface-2)] p-3 text-xs"><div className="flex flex-wrap items-center justify-between gap-2"><a className="max-w-[80%] truncate font-bold text-[var(--accent)] underline underline-offset-4" href={attempt.url} target="_blank" rel="noreferrer">{attempt.url}</a><StatusBadge status={attempt.verification_status} /></div><p className="mt-1 text-[var(--muted)]">{new Date(attempt.submitted_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}{result.final_submission_id === attempt.id ? " · 공식 인정 링크" : ""}</p></div>)}</div></div>}
                    </div>;
                  })}
                </div>
              )}
            </section>
          </>
        )}

        <section className="mt-9">
          <div><p className="eyebrow">Audit</p><h2 className="mt-2 text-2xl font-black">운영 감사 로그</h2></div>
          {auditLogs.length === 0 ? <div className="card mt-4 rounded-[1.8rem] p-7 font-bold text-[var(--muted)]">관리자 운영 이력이 없습니다.</div> : <ol className="mt-4 space-y-3">{auditLogs.map((log) => <li key={log.id} className="card rounded-[1.5rem] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><p className="font-black">{auditLabels[log.action] ?? log.action}{log.week_start ? ` · ${log.week_start}` : ""}</p><p className="text-xs font-bold text-[var(--muted)]">{new Date(log.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</p></div><p className="copy-pretty mt-2 text-sm leading-6">{log.reason}</p></li>)}</ol>}
        </section>
      </div>
    </AppShell>
  );
}
