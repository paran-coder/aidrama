import { redirect } from "next/navigation";
import { OwlVisual } from "@/components/owl-visual";
import { startChallengeAction } from "@/lib/actions/challenge";
import { getAppContext } from "@/lib/page-context";
import { getChallenge } from "@/lib/challenge-service";
import { PendingSubmitButton } from "@/components/pending-submit-button";

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) {
  const { user, isAdmin } = await getAppContext();
  if (isAdmin) redirect("/admin");
  if (await getChallenge(user.id, false)) redirect("/dashboard");
  const q = await searchParams;
  const error = typeof q.error === "string" ? q.error : "";

  return (
    <main className="mx-auto grid min-h-screen max-w-5xl items-center gap-10 px-5 py-10 lg:grid-cols-2">
      <div>
        <p className="eyebrow">Day zero · Lv.1 Creator</p>
        <h1 className="mt-4 text-5xl font-black tracking-[-.06em]">오늘부터<br/>크리에이터입니다.</h1>
        <div className="copy-pretty mt-5 max-w-lg leading-8 text-[var(--muted)]"><p>첫 목표는 100일입니다.</p><p>챌린지를 시작한 오늘부터 7일이 첫 인증 기간입니다. 이후에도 시작일을 기준으로 7일마다 새 인증 기간이 열립니다.</p></div>
        {error && <div role="alert" className="ui-danger mt-5 rounded-2xl border p-4 text-sm font-bold">{error}</div>}
        <div className="mt-8 space-y-3">
          {[
            "100 → 300 → 600 → 900 → 1000일 순서로 가까운 목표를 하나씩 달성합니다.",
            "각 인증 기간의 마지막 날 23:59 KST까지 업로드 링크를 제출합니다.",
            "실패하면 현재 스트릭은 끊기지만 크리에이터 레벨과 획득한 배지는 내려가지 않습니다.",
            "마일스톤 날짜를 지난 뒤 정상 인증에 성공하면 해당 배지가 영구 기록됩니다.",
          ].map((rule,i) => <div key={rule} className="flex gap-3 rounded-2xl border border-[var(--line)] bg-white/55 p-4"><span className="display-number text-lg text-[var(--accent)]">0{i+1}</span><p className="copy-pretty text-sm font-bold leading-6">{rule}</p></div>)}
        </div>
        <form action={startChallengeAction} className="mt-7"><PendingSubmitButton className="primary-button w-full sm:w-auto" pendingLabel="시작하는 중...">첫 100일 시작하기</PendingSubmitButton></form>
      </div>
      <div className="soft-shadow overflow-hidden rounded-[2.6rem]"><OwlVisual stage={0}/></div>
    </main>
  );
}
