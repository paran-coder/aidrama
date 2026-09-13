import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { MilestoneBadges } from "@/components/milestone-badges";
import { OwlVisual } from "@/components/owl-visual";
import { getPublicParticipant } from "@/lib/challenge-service";
import { hasCompletionBadge } from "@/lib/growth";
import { getAppContext } from "@/lib/page-context";

export default async function CompletePage({ params }: { params: Promise<{ userId: string }> }) {
  const { profile, isAdmin } = await getAppContext();
  const { userId } = await params;
  const participant = await getPublicParticipant(userId);
  if (!participant || !hasCompletionBadge(participant.badges)) notFound();

  const { profile: target, challenge, badges } = participant;
  return (
    <AppShell displayName={profile.display_name} isAdmin={isAdmin}>
      <div className="mx-auto max-w-4xl text-center">
        <p className="eyebrow">OWL1000 complete</p>
        <h1 className="mt-4 text-5xl font-black tracking-[-.06em] sm:text-6xl">{target.display_name}님의<br />1000일이 완성되었습니다.</h1>
        <p className="mx-auto mt-5 max-w-xl leading-8 text-[var(--muted)]">처음부터 창작자였고, 이제 1000일의 기록으로 그것을 증명했습니다. 실패한 주도, 다시 시작한 주도 모두 이 여정의 일부입니다.</p>
        <div className="soft-shadow mx-auto mt-9 max-w-xl rounded-[2.6rem] p-3"><OwlVisual stage={4} hero /></div>
        <div className="mx-auto mt-7 grid max-w-xl grid-cols-3 gap-3">
          <div className="card rounded-2xl p-4"><p className="display-number text-3xl">{challenge.longest_streak}</p><p className="mt-1 text-xs font-bold text-[var(--muted)]">최장 스트릭</p></div>
          <div className="card rounded-2xl p-4"><p className="display-number text-3xl">{challenge.success_count}</p><p className="mt-1 text-xs font-bold text-[var(--muted)]">성공 주차</p></div>
          <div className="card rounded-2xl p-4"><p className="display-number text-3xl">1000</p><p className="mt-1 text-xs font-bold text-[var(--muted)]">완주일</p></div>
        </div>
        <div className="mx-auto mt-6 max-w-2xl"><MilestoneBadges badges={badges} /></div>
        <Link href="/community" className="secondary-button mt-8">커뮤니티로 돌아가기</Link>
      </div>
    </AppShell>
  );
}
