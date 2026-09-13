import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { MilestoneBadges } from "@/components/milestone-badges";
import { OwlVisual } from "@/components/owl-visual";
import { ProgressBar } from "@/components/progress-bar";
import { challengeProgress } from "@/lib/challenge";
import { getPublicParticipant } from "@/lib/challenge-service";
import { CREATOR_LEVELS, creatorLevelIndex, hasCompletionBadge, milestoneProgress } from "@/lib/growth";
import { getAppContext } from "@/lib/page-context";

export default async function CommunityProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { profile, isAdmin } = await getAppContext();
  const { userId } = await params;
  const participant = await getPublicParticipant(userId);
  if (!participant) notFound();

  const { profile: target, challenge, badges } = participant;
  const progress = challengeProgress(challenge);
  const levelIndex = creatorLevelIndex(badges, progress.day);
  const level = CREATOR_LEVELS[levelIndex];
  const goal = milestoneProgress(progress.day, badges);
  const completed = hasCompletionBadge(badges, progress.day);

  return (
    <AppShell displayName={profile.display_name} isAdmin={isAdmin}>
      <div className="mx-auto max-w-4xl">
        <Link href="/community" className="text-sm font-bold text-[var(--muted)]">← 전체 현황</Link>
        <div className="mt-6 grid gap-7 md:grid-cols-[1fr_.9fr]">
          <OwlVisual stage={levelIndex} />
          <section className="flex flex-col justify-center">
            <p className="eyebrow">Creator profile</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-.05em]">{target.display_name}</h1>
            <p className="mt-2 text-lg font-black text-[var(--accent)]">Lv.{level.level} · {level.label}</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{level.subtitle}</p>
            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="card rounded-2xl p-4"><p className="display-number text-3xl">{progress.day}</p><p className="mt-1 text-xs font-bold text-[var(--muted)]">경과일</p></div>
              <div className="card rounded-2xl p-4"><p className="display-number text-3xl">{challenge.streak}</p><p className="mt-1 text-xs font-bold text-[var(--muted)]">현재 스트릭</p></div>
              <div className="card rounded-2xl p-4"><p className="display-number text-3xl">{challenge.longest_streak}</p><p className="mt-1 text-xs font-bold text-[var(--muted)]">최장 스트릭</p></div>
            </div>
            <div className="mt-7"><ProgressBar value={goal.percent} label={goal.target ? `현재 목표 · ${progress.day} / ${goal.target}일` : "OWL1000 완주"} /></div>
            <div className="mt-5"><MilestoneBadges badges={badges} currentDay={progress.day} /></div>
            {completed && <Link href={`/complete/${userId}`} className="primary-button mt-7">완주 아카이브 보기</Link>}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
