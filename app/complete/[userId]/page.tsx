import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { OwlVisual } from "@/components/owl-visual";
import { challengeProgress } from "@/lib/challenge";
import { getPublicParticipant } from "@/lib/challenge-service";
import { getAppContext } from "@/lib/page-context";

export default async function CompletePage({ params }: { params: Promise<{ userId: string }> }) {
  const { profile, isAdmin } = await getAppContext();
  const { userId } = await params;
  const participant = await getPublicParticipant(userId);
  if (!participant || !challengeProgress(participant.challenge).completed) notFound();

  const { profile: target, challenge } = participant;
  return (
    <AppShell displayName={profile.display_name} isAdmin={isAdmin}>
      <div className="mx-auto max-w-4xl text-center">
        <p className="eyebrow">1000 days complete</p>
        <h1 className="mt-4 text-5xl font-black tracking-[-.06em] sm:text-6xl">{target.display_name}님의<br />1000일이 완성되었습니다.</h1>
        <p className="mx-auto mt-5 max-w-xl leading-8 text-[var(--muted)]">완벽해서가 아니라, 실패한 주까지 기록하면서 다시 돌아왔기 때문에 완주한 1000일입니다.</p>
        <div className="soft-shadow mx-auto mt-9 max-w-xl rounded-[2.6rem] p-3"><OwlVisual stage={7} /></div>
        <div className="mx-auto mt-7 grid max-w-xl grid-cols-3 gap-3">
          <div className="card rounded-2xl p-4"><p className="display-number text-3xl">{challenge.longest_streak}</p><p className="mt-1 text-xs font-bold text-[var(--muted)]">최장 스트릭</p></div>
          <div className="card rounded-2xl p-4"><p className="display-number text-3xl">{challenge.reset_count}</p><p className="mt-1 text-xs font-bold text-[var(--muted)]">총 리셋</p></div>
          <div className="card rounded-2xl p-4"><p className="display-number text-3xl">1000</p><p className="mt-1 text-xs font-bold text-[var(--muted)]">경과일</p></div>
        </div>
        <Link href="/community" className="secondary-button mt-8">커뮤니티로 돌아가기</Link>
      </div>
    </AppShell>
  );
}
