import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { MilestoneBadges } from "@/components/milestone-badges";
import { OwlVisual } from "@/components/owl-visual";
import { challengeProgress } from "@/lib/challenge";
import { getCommunityRows } from "@/lib/challenge-service";
import { CREATOR_LEVELS, creatorLevelIndex } from "@/lib/growth";
import { getAppContext } from "@/lib/page-context";

export default async function CommunityPage() {
  const { user, profile, isAdmin } = await getAppContext();
  const rows = await getCommunityRows();

  return (
    <AppShell displayName={profile.display_name} isAdmin={isAdmin}>
      <div>
        <p className="eyebrow">Community</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="text-4xl font-black tracking-[-.05em]">함께 가는 크리에이터.</h1><p className="copy-pretty mt-2 text-sm font-bold text-[var(--muted)]">각자의 속도로, 같은 방향으로.</p></div>
          <p className="text-sm font-bold text-[var(--muted)]">최장 스트릭 순 · {rows.length}명</p>
        </div>
        {rows.length === 0 ? (
          <div className="card mt-8 rounded-[2rem] p-8 text-center font-bold">아직 챌린지를 시작한 참여자가 없습니다.</div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map(({ challenge, profile: participant, badges }, index) => {
              const progress = challengeProgress(challenge);
              const levelIndex = creatorLevelIndex(badges, progress.day);
              const level = CREATOR_LEVELS[levelIndex];
              const me = challenge.user_id === user.id;
              return (
                <Link href={`/community/${challenge.user_id}`} key={challenge.id} className={`card group rounded-[2rem] p-5 transition hover:-translate-y-1 ${me ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg)]" : ""}`}>
                  <div className="flex items-center gap-4">
                    <OwlVisual stage={levelIndex} compact />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2"><p className="truncate font-black">{participant.display_name}</p>{me && <span className="rounded-full bg-[var(--accent)] px-2 py-1 text-[10px] font-black text-white">나</span>}</div>
                      <p className="mt-1 text-xs font-bold text-[var(--accent)]">Lv.{level.level} · {level.label}</p>
                      <p className="mt-1 text-xs font-bold text-[var(--muted)]">#{index + 1} · Day {progress.day}</p>
                      <p className="mt-3 text-xs font-extrabold text-[var(--muted)]">연속 인증 <span className="display-number ml-1 text-2xl text-[var(--ink)]">{challenge.streak}</span><span className="ml-1 text-[var(--ink)]">주</span></p>
                    </div>
                  </div>
                  <div className="mt-4"><MilestoneBadges badges={badges} currentDay={progress.day} compact /></div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
