import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { syncParticipantStatesAction } from "@/lib/actions/admin";
import { getAdminOverview } from "@/lib/admin-service";
import { requireAdmin } from "@/lib/auth";
import { challengeProgress, formatProofPeriod, formatShortKoreanDateKey, proofPeriodForAnchor } from "@/lib/challenge";
import { CREATOR_LEVELS, creatorLevelIndex } from "@/lib/growth";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { profile } = await requireAdmin();
  const q = await searchParams;
  const error = typeof q.error === "string" ? q.error : "";
  const synced = q.synced === "1";
  const deleted = typeof q.deleted === "string" ? q.deleted : "";
  const { participants, warnings, health } = await getAdminOverview();

  return (
    <AppShell displayName={profile.display_name} isAdmin>
      <div>
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-.05em]">운영 관리</h1>
          <p className="copy-pretty mt-3 max-w-5xl text-[15px] font-bold leading-7 text-[var(--muted)] sm:text-base">
            <span>참여자의 톡방 닉네임, 계정 상태, 진행 현황과 제출 링크를 한곳에서 관리합니다.</span>
            <span className="block xl:inline xl:before:content-[' ']">가입은 참여자에게 공유한 사이트 주소에서 바로 진행됩니다.</span>
          </p>
        </div>

        {warnings.length > 0 && (
          <div role="status" className="ui-warning copy-pretty mt-6 rounded-2xl border p-4 text-sm font-bold leading-6">
            <p className="font-black">일부 운영 정보를 호환 모드로 불러왔습니다.</p>
            <ul className="mt-2 space-y-1">{warnings.map((warning) => <li key={warning}>· {warning}</li>)}</ul>
          </div>
        )}
        {error && <div role="alert" className="ui-danger mt-6 rounded-2xl border p-4 font-bold">{error}</div>}
        {synced && <div role="status" className="ui-success mt-6 rounded-2xl border p-4 font-bold">모든 참여자의 마감된 인증 기간 상태를 한 번 동기화했습니다.</div>}
        {deleted && <div role="status" className="ui-success mt-6 rounded-2xl border p-4 font-bold">{deleted} 계정을 영구 삭제했습니다.</div>}

        <section className="mx-auto mt-9 w-full max-w-[1320px]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Participants</p>
              <h2 className="mt-2 text-2xl font-black">참여자 현황</h2>
              <p className="copy-pretty mt-2 text-[15px] font-bold leading-7 text-[var(--muted)]">톡방 닉네임과 이메일로 참여자를 확인하고, 제출 내역에서 실제 제출 URL을 열어보거나 접근 관리에서 계정을 정지·재활성화·삭제할 수 있습니다.</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-[15px] font-bold text-[var(--muted)]">{participants.length}명</p>
              <form action={syncParticipantStatesAction}><PendingSubmitButton className="secondary-button min-h-0 px-4 py-2 text-sm" pendingLabel="동기화 중...">진행상태 동기화</PendingSubmitButton></form>
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface)]">
            <div className="overflow-x-auto pb-1">
              <div role="table" aria-label="참여자 현황" className="min-w-[1160px] text-left text-[15px]">
                <div
                  role="row"
                  className="grid grid-cols-[minmax(190px,1.3fr)_96px_112px_76px_minmax(170px,1fr)_minmax(190px,1.1fr)_190px] items-center gap-x-6 bg-[var(--surface-2)] px-5 py-3.5 text-[13px] uppercase tracking-[.04em] text-[var(--muted)]"
                >
                  <div role="columnheader">톡방 닉네임 / 이메일</div>
                  <div role="columnheader" className="whitespace-nowrap">계정 상태</div>
                  <div role="columnheader">레벨</div>
                  <div role="columnheader" className="whitespace-nowrap">경과일</div>
                  <div role="columnheader">인증 현황</div>
                  <div role="columnheader">인증 기간</div>
                  <div role="columnheader" className="text-center">관리</div>
                </div>
                {participants.map(({ profile: participant, email, challenge, badges }) => {
                  const progress = challenge ? challengeProgress(challenge) : null;
                  const level = CREATOR_LEVELS[creatorLevelIndex(badges, progress?.day ?? 0)];
                  const proofPeriod = challenge ? proofPeriodForAnchor(challenge.first_judgement_week_start) : null;
                  return (
                    <div
                      role="row"
                      key={participant.id}
                      className="grid grid-cols-[minmax(190px,1.3fr)_96px_112px_76px_minmax(170px,1fr)_minmax(190px,1.1fr)_190px] items-center gap-x-6 border-t border-[var(--line)] px-5 py-3.5"
                    >
                      <div role="cell" className="min-w-0">
                        <p className="truncate font-black" title={participant.display_name}>{participant.display_name}</p>
                        <p className="mt-1 truncate text-sm leading-5 text-[var(--muted)]" title={email ?? "이메일 없음"}>{email ?? "이메일 없음"}</p>
                      </div>
                      <div role="cell" className="whitespace-nowrap"><span className={`rounded-full px-2.5 py-1 text-[13px] font-extrabold ${participant.status === "active" ? "ui-success border" : "ui-danger border"}`}>{participant.status === "active" ? "활성" : "정지"}</span></div>
                      <div role="cell" className="font-bold leading-5">{challenge ? <><span className="whitespace-nowrap">Lv.{level.level}</span><span className="block text-sm leading-5 text-[var(--muted)]">{level.label}</span></> : "—"}</div>
                      <div role="cell" className="whitespace-nowrap font-bold">{progress ? `${progress.day}일` : "시작 전"}</div>
                      <div role="cell" className="font-bold leading-5">
                        {challenge ? <><p><span className="text-[var(--muted)]">현재/최장</span> {challenge.streak} / {challenge.longest_streak}주</p><p className="mt-1 text-sm leading-5 text-[var(--muted)]">성공/실패 {challenge.success_count} / {challenge.failure_count}</p></> : "—"}
                      </div>
                      <div role="cell" className="font-bold leading-5">
                        {proofPeriod ? <><p className="whitespace-nowrap">{formatProofPeriod(proofPeriod.startKey)}</p><p className="mt-1 whitespace-nowrap text-sm leading-5 text-[var(--muted)]">마감 {formatShortKoreanDateKey(proofPeriod.endKey)} 23:59</p></> : "—"}
                      </div>
                      <div role="cell">
                        <div className="flex items-center justify-center gap-3 whitespace-nowrap">
                          {challenge && <Link className="admin-table-action" href={`/admin/participants/${participant.id}#submissions`}>제출 내역</Link>}
                          <Link className="admin-table-action" href={`/admin/participants/${participant.id}#access`}>접근 관리</Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {participants.length === 0 && <p className="p-8 text-center font-bold text-[var(--muted)]">{health.profiles ? "가입한 참여자가 없습니다." : "참여자 정보를 불러오지 못했습니다. 잠시 후 진행상태 동기화를 다시 시도해 주세요."}</p>}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
