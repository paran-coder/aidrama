import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { CopyButton } from "@/components/copy-button";
import { createInviteCodeAction } from "@/lib/actions/admin";
import { getAdminOverview } from "@/lib/admin-service";
import { requireAdmin } from "@/lib/auth";
import { challengeProgress } from "@/lib/challenge";
import { getAppContext } from "@/lib/page-context";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const { profile } = await getAppContext();
  const q = await searchParams;
  const created = typeof q.created === "string" ? q.created : "";
  const error = typeof q.error === "string" ? q.error : "";
  const { codes, participants } = await getAdminOverview();
  const names = new Map(participants.map(({ profile: participant }) => [participant.id, participant.display_name]));

  return (
    <AppShell displayName={profile.display_name} isAdmin>
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-.05em]">운영 관리</h1>
            <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-[var(--muted)]">초대 코드와 참여자 진행 상태를 한곳에서 확인합니다. 사용자 화면과 챌린지 규칙은 그대로 유지됩니다.</p>
          </div>
          <form action={createInviteCodeAction}><button className="primary-button">새 코드 발급</button></form>
        </div>

        {created && (
          <div role="status" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-bold text-[var(--success)]">
            <span>새 초대 코드: <strong className="tracking-wider">{created}</strong></span><CopyButton value={created} />
          </div>
        )}
        {error && <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-[var(--danger)]">{error}</div>}

        <section className="mt-9">
          <div className="flex items-end justify-between gap-4">
            <div><p className="eyebrow">Participants</p><h2 className="mt-2 text-2xl font-black">참여자 현황</h2></div>
            <p className="text-sm font-bold text-[var(--muted)]">{participants.length}명</p>
          </div>
          <div className="mt-4 overflow-hidden rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-[var(--surface-2)] text-xs uppercase tracking-wider text-[var(--muted)]">
                  <tr><th className="px-5 py-4">참여자</th><th className="px-5 py-4">경과일</th><th className="px-5 py-4">현재/최장 스트릭</th><th className="px-5 py-4">성공/실패</th><th className="px-5 py-4">연속 실패</th><th className="px-5 py-4"></th></tr>
                </thead>
                <tbody>
                  {participants.map(({ profile: participant, challenge }) => {
                    const progress = challenge ? challengeProgress(challenge) : null;
                    return (
                      <tr key={participant.id} className="border-t border-[var(--line)]">
                        <td className="px-5 py-4"><p className="font-black">{participant.display_name}</p><p className="mt-1 text-xs text-[var(--muted)]">{participant.role === "admin" ? "관리자" : "참여자"}</p></td>
                        <td className="px-5 py-4 font-bold">{progress ? `${progress.day}일` : "시작 전"}</td>
                        <td className="px-5 py-4 font-bold">{challenge ? `${challenge.streak} / ${challenge.longest_streak}` : "—"}</td>
                        <td className="px-5 py-4 font-bold">{challenge ? `${challenge.success_count} / ${challenge.failure_count}` : "—"}</td>
                        <td className="px-5 py-4 font-bold">{challenge ? challenge.consecutive_failures : "—"}</td>
                        <td className="px-5 py-4"><Link className="secondary-button min-h-0 px-4 py-2 text-xs" href={`/admin/participants/${participant.id}`}>운영 상세</Link></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {participants.length === 0 && <p className="p-8 text-center font-bold text-[var(--muted)]">가입한 참여자가 없습니다.</p>}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4"><div><p className="eyebrow">Invitations</p><h2 className="mt-2 text-2xl font-black">초대 코드</h2></div><p className="text-sm font-bold text-[var(--muted)]">{codes.length}개 발급</p></div>
          <div className="mt-4 overflow-hidden rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-[var(--surface-2)] text-xs uppercase tracking-wider text-[var(--muted)]"><tr><th className="px-5 py-4">코드</th><th className="px-5 py-4">상태</th><th className="px-5 py-4">사용자</th><th className="px-5 py-4">발급일</th><th className="px-5 py-4"></th></tr></thead>
                <tbody>
                  {codes.map((code) => (
                    <tr key={code.code} className="border-t border-[var(--line)]">
                      <td className="px-5 py-4 font-black tracking-wider">{code.code}</td>
                      <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${code.used_at ? "bg-zinc-100 text-zinc-500" : "bg-emerald-50 text-[var(--success)]"}`}>{code.used_at ? "사용 완료" : "사용 가능"}</span></td>
                      <td className="px-5 py-4 font-bold">{code.used_at ? (code.used_by ? names.get(code.used_by) ?? "가입 사용자" : "삭제된 사용자") : "—"}</td>
                      <td className="px-5 py-4 text-[var(--muted)]">{new Date(code.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}</td>
                      <td className="px-5 py-4"><CopyButton value={code.code} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {codes.length === 0 && <p className="p-8 text-center font-bold text-[var(--muted)]">발급된 코드가 없습니다.</p>}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
