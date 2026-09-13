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
          <p className="copy-pretty mt-3 max-w-2xl text-sm font-bold leading-6 text-[var(--muted)]">참여자의 톡방 닉네임, 계정 상태, 진행 현황과 제출 링크를 한곳에서 관리합니다. 가입은 참여자에게 공유한 사이트 주소에서 바로 진행됩니다.</p>
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

        <section className="mt-9">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Participants</p>
              <h2 className="mt-2 text-2xl font-black">참여자 현황</h2>
              <p className="copy-pretty mt-2 text-sm font-bold leading-6 text-[var(--muted)]">톡방 닉네임과 이메일로 참여자를 확인하고, 제출 내역에서 실제 제출 URL을 열어보거나 접근 관리에서 계정을 정지·재활성화·삭제할 수 있습니다.</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-bold text-[var(--muted)]">{participants.length}명</p>
              <form action={syncParticipantStatesAction}><PendingSubmitButton className="secondary-button min-h-0 px-4 py-2 text-xs" pendingLabel="동기화 중...">진행상태 동기화</PendingSubmitButton></form>
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1220px] text-left text-sm">
                <thead className="bg-[var(--surface-2)] text-xs uppercase tracking-wider text-[var(--muted)]">
                  <tr><th className="px-5 py-4">톡방 닉네임 / 이메일</th><th className="px-5 py-4">계정 상태</th><th className="px-5 py-4">레벨</th><th className="px-5 py-4">경과일</th><th className="px-5 py-4">현재/최장 인증(주)</th><th className="px-5 py-4">이번 인증 기간</th><th className="px-5 py-4">다음 마감</th><th className="px-5 py-4">성공/실패</th><th className="px-5 py-4"></th></tr>
                </thead>
                <tbody>
                  {participants.map(({ profile: participant, email, challenge, badges }) => {
                    const progress = challenge ? challengeProgress(challenge) : null;
                    const level = CREATOR_LEVELS[creatorLevelIndex(badges, progress?.day ?? 0)];
                    const proofPeriod = challenge ? proofPeriodForAnchor(challenge.first_judgement_week_start) : null;
                    return (
                      <tr key={participant.id} className="border-t border-[var(--line)]">
                        <td className="px-5 py-4"><p className="font-black">{participant.display_name}</p><p className="mt-1 text-xs text-[var(--muted)]">{email ?? "이메일 없음"}</p></td>
                        <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${participant.status === "active" ? "ui-success border" : "ui-danger border"}`}>{participant.status === "active" ? "활성" : "정지"}</span></td>
                        <td className="px-5 py-4 font-bold">{challenge ? `Lv.${level.level} ${level.label}` : "—"}</td>
                        <td className="px-5 py-4 font-bold">{progress ? `${progress.day}일` : "시작 전"}</td>
                        <td className="px-5 py-4 font-bold">{challenge ? `${challenge.streak} / ${challenge.longest_streak}` : "—"}</td>
                        <td className="px-5 py-4 font-bold">{proofPeriod ? formatProofPeriod(proofPeriod.startKey) : "—"}</td>
                        <td className="px-5 py-4 font-bold">{proofPeriod ? `${formatShortKoreanDateKey(proofPeriod.endKey)} 23:59` : "—"}</td>
                        <td className="px-5 py-4 font-bold">{challenge ? `${challenge.success_count} / ${challenge.failure_count}` : "—"}</td>
                        <td className="px-5 py-4"><div className="flex flex-wrap gap-2">{challenge && <Link className="secondary-button min-h-0 px-4 py-2 text-xs" href={`/admin/participants/${participant.id}#submissions`}>제출 내역</Link>}<Link className="secondary-button min-h-0 px-4 py-2 text-xs" href={`/admin/participants/${participant.id}#access`}>접근 관리</Link></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {participants.length === 0 && <p className="p-8 text-center font-bold text-[var(--muted)]">{health.profiles ? "가입한 참여자가 없습니다." : "참여자 정보를 불러오지 못했습니다. 잠시 후 진행상태 동기화를 다시 시도해 주세요."}</p>}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
