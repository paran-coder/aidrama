import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { CopyButton } from "@/components/copy-button";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { createInviteCodeAction, revokeInviteCodeAction, syncParticipantStatesAction } from "@/lib/actions/admin";
import { getAdminOverview, type InviteCodeRow } from "@/lib/admin-service";
import { requireAdmin } from "@/lib/auth";
import { challengeProgress } from "@/lib/challenge";
import { CREATOR_LEVELS, creatorLevelIndex } from "@/lib/growth";

function inviteState(code: InviteCodeRow) {
  if (code.used_at) return { label: "사용 완료", className: "ui-neutral border" };
  if (code.revoked_at) return { label: "발급 취소", className: "ui-danger border" };
  if (code.expires_at && new Date(code.expires_at) < new Date()) return { label: "만료", className: "ui-warning border" };
  return { label: "사용 가능", className: "ui-success border" };
}

function kstDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" });
}

function kstDateTime(value: string) {
  return new Date(value).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { profile } = await requireAdmin();
  const q = await searchParams;
  const created = typeof q.created === "string" ? q.created : "";
  const revoked = typeof q.revoked === "string" ? q.revoked : "";
  const error = typeof q.error === "string" ? q.error : "";
  const synced = q.synced === "1";
  const { codes, participants, warnings, health } = await getAdminOverview();
  const currentCodes = codes.filter((code) => !code.revoked_at);
  const revokedCodes = codes.filter((code) => Boolean(code.revoked_at));

  return (
    <AppShell displayName={profile.display_name} isAdmin>
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-.05em]">운영 관리</h1>
            <p className="copy-pretty mt-3 max-w-2xl text-sm font-bold leading-6 text-[var(--muted)]">초대 코드와 참여자 접근 상태, 진행 현황을 한곳에서 관리합니다. 코드 발급과 사용자 접근 권한은 서로 독립적으로 관리됩니다.</p>
          </div>
          <form action={createInviteCodeAction}>
            <PendingSubmitButton pendingLabel="코드 발급 중...">새 코드 발급</PendingSubmitButton>
          </form>
        </div>

        {created && (
          <div role="status" className="ui-success mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 font-bold">
            <span>새 초대 코드: <strong className="tracking-wider">{created}</strong></span><CopyButton value={created} />
          </div>
        )}
        {warnings.length > 0 && (
          <div role="status" className="ui-warning copy-pretty mt-6 rounded-2xl border p-4 text-sm font-bold leading-6">
            <p className="font-black">일부 운영 정보를 호환 모드로 불러왔습니다.</p>
            <ul className="mt-2 space-y-1">{warnings.map((warning) => <li key={warning}>· {warning}</li>)}</ul>
          </div>
        )}
        {revoked && <div role="status" className="ui-warning copy-pretty mt-6 rounded-2xl border p-4 font-bold">{revoked} 코드의 발급을 취소했습니다. 기존 가입 사용자에게는 영향이 없습니다.</div>}
        {error && <div role="alert" className="ui-danger mt-6 rounded-2xl border p-4 font-bold">{error}</div>}
        {synced && <div role="status" className="ui-success mt-6 rounded-2xl border p-4 font-bold">모든 참여자의 마감 주차 상태를 한 번 동기화했습니다.</div>}

        <section className="mt-9">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="eyebrow">Participants</p><h2 className="mt-2 text-2xl font-black">참여자 현황</h2></div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-bold text-[var(--muted)]">{participants.length}명</p>
              <form action={syncParticipantStatesAction}><PendingSubmitButton className="secondary-button min-h-0 px-4 py-2 text-xs" pendingLabel="동기화 중...">진행상태 동기화</PendingSubmitButton></form>
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="bg-[var(--surface-2)] text-xs uppercase tracking-wider text-[var(--muted)]">
                  <tr><th className="px-5 py-4">참여자</th><th className="px-5 py-4">계정 상태</th><th className="px-5 py-4">레벨</th><th className="px-5 py-4">경과일</th><th className="px-5 py-4">현재/최장 인증(주)</th><th className="px-5 py-4">성공/실패</th><th className="px-5 py-4"></th></tr>
                </thead>
                <tbody>
                  {participants.map(({ profile: participant, email, challenge, badges }) => {
                    const progress = challenge ? challengeProgress(challenge) : null;
                    const level = CREATOR_LEVELS[creatorLevelIndex(badges, progress?.day ?? 0)];
                    return (
                      <tr key={participant.id} className="border-t border-[var(--line)]">
                        <td className="px-5 py-4"><p className="font-black">{participant.display_name}</p><p className="mt-1 text-xs text-[var(--muted)]">{email ?? "이메일 없음"} · {participant.role === "admin" ? "관리자" : "참여자"}</p></td>
                        <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${participant.status === "active" ? "ui-success border" : "ui-danger border"}`}>{participant.status === "active" ? "활성" : "정지"}</span></td>
                        <td className="px-5 py-4 font-bold">{challenge ? `Lv.${level.level} ${level.label}` : "—"}</td>
                        <td className="px-5 py-4 font-bold">{progress ? `${progress.day}일` : "시작 전"}</td>
                        <td className="px-5 py-4 font-bold">{challenge ? `${challenge.streak} / ${challenge.longest_streak}` : "—"}</td>
                        <td className="px-5 py-4 font-bold">{challenge ? `${challenge.success_count} / ${challenge.failure_count}` : "—"}</td>
                        <td className="px-5 py-4"><Link className="secondary-button min-h-0 px-4 py-2 text-xs" href={`/admin/participants/${participant.id}#access`}>접근 관리</Link></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {participants.length === 0 && <p className="p-8 text-center font-bold text-[var(--muted)]">{health.profiles ? "가입한 참여자가 없습니다." : "참여자 정보를 불러오지 못했습니다. 잠시 후 진행상태 동기화를 다시 시도해 주세요."}</p>}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4"><div><p className="eyebrow">Invitations</p><h2 className="mt-2 text-2xl font-black">초대 코드</h2></div><p className="text-sm font-bold text-[var(--muted)]">{codes.length}개 발급</p></div>
          <p className="copy-pretty mt-2 text-sm font-bold leading-6 text-[var(--muted)]">발급 취소는 <strong>아직 사용하지 않은 코드</strong>만 막습니다. 이미 가입한 사용자의 접근을 중지하려면 위 참여자 목록의 <strong>접근 관리</strong>에서 계정을 정지하세요.</p>
          <div className="mt-4 overflow-hidden rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead className="bg-[var(--surface-2)] text-xs uppercase tracking-wider text-[var(--muted)]"><tr><th className="px-5 py-4">코드</th><th className="px-5 py-4">상태</th><th className="px-5 py-4">사용자</th><th className="px-5 py-4">발급일</th><th className="px-5 py-4">사용/취소일</th><th className="px-5 py-4">관리</th></tr></thead>
                <tbody>
                  {currentCodes.map((code) => {
                    const state = inviteState(code);
                    return (
                      <tr key={code.code} className="border-t border-[var(--line)] align-top">
                        <td className="px-5 py-4"><p className="font-black tracking-wider">{code.code}</p><div className="mt-2"><CopyButton value={code.code} /></div></td>
                        <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${state.className}`}>{state.label}</span>{code.revoke_reason && <p className="mt-2 max-w-48 text-xs leading-5 text-[var(--muted)]">{code.revoke_reason}</p>}</td>
                        <td className="px-5 py-4 font-bold">{code.used_at ? (code.used_account_deleted_at || !code.used_by) ? <><p>탈퇴한 사용자</p><p className="mt-1 text-xs font-normal text-[var(--muted)]">개인 정보 삭제됨</p></> : <><p>{code.used_display_name ?? "가입 사용자"}</p><p className="mt-1 text-xs font-normal text-[var(--muted)]">{code.used_email ?? "이메일 확인 불가"}</p></> : "—"}</td>
                        <td className="px-5 py-4 text-[var(--muted)]">{kstDate(code.created_at)}</td>
                        <td className="px-5 py-4 text-[var(--muted)]">{code.used_at ? kstDateTime(code.used_at) : code.revoked_at ? kstDateTime(code.revoked_at) : "—"}</td>
                        <td className="px-5 py-4">
                          {!code.used_at && !code.revoked_at && (!code.expires_at || new Date(code.expires_at) >= new Date()) ? (
                            <form action={revokeInviteCodeAction}>
                              <input type="hidden" name="code" value={code.code} />
                              <input type="hidden" name="reason" value="관리자 발급 취소" />
                              <PendingSubmitButton className="secondary-button min-h-0 px-4 py-2 text-xs" pendingLabel="취소 중...">발급 취소</PendingSubmitButton>
                            </form>
                          ) : <span className="text-xs font-bold text-[var(--muted)]">이력 보존</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {currentCodes.length === 0 && <p className="p-8 text-center font-bold text-[var(--muted)]">{health.codes ? "현재 사용 가능하거나 사용 완료된 코드가 없습니다." : "초대 코드 정보를 불러오지 못했습니다. 다른 관리자 기능은 계속 사용할 수 있습니다."}</p>}
          </div>
          {revokedCodes.length > 0 && (
            <details className="mt-4 rounded-[1.5rem] border border-[var(--line)] bg-white/45 p-4">
              <summary className="cursor-pointer text-sm font-black">취소된 코드 이력 {revokedCodes.length}개 보기</summary>
              <div className="mt-4 space-y-2">
                {revokedCodes.map((code) => (
                  <div key={code.code} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-xs">
                    <div><p className="font-black tracking-wider">{code.code}</p><p className="mt-1 text-[var(--muted)]">{code.revoke_reason ?? "관리자 발급 취소"}</p></div>
                    <p className="font-bold text-[var(--muted)]">{code.revoked_at ? kstDateTime(code.revoked_at) : "—"}</p>
                  </div>
                ))}
              </div>
            </details>
          )}
        </section>
      </div>
    </AppShell>
  );
}
