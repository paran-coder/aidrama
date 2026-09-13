import { BADGE_ASSETS } from "@/lib/owl-assets";
import { MILESTONES, milestoneSet, type Milestone } from "@/lib/growth";
import type { ChallengeBadge } from "@/lib/types";

export function MilestoneBadges({
  badges,
  compact = false,
  showLocked = true,
  currentDay = Number.POSITIVE_INFINITY,
}: {
  badges: Pick<ChallengeBadge, "milestone_days" | "awarded_at">[];
  compact?: boolean;
  showLocked?: boolean;
  currentDay?: number;
}) {
  const earned = milestoneSet(badges, currentDay);
  const earnedRows = new Map(
    badges
      .filter((badge) => badge.milestone_days <= currentDay)
      .map((badge) => [badge.milestone_days, badge]),
  );
  const milestones = showLocked ? MILESTONES : MILESTONES.filter((m) => earned.has(m));

  if (!showLocked && milestones.length === 0) {
    return <p className="text-sm font-bold text-[var(--muted)]">아직 획득한 마일스톤 배지가 없습니다.</p>;
  }

  return (
    <div className={`grid ${compact ? "grid-cols-5 gap-1.5" : "grid-cols-2 gap-3 sm:grid-cols-5"}`}>
      {milestones.map((milestone) => {
        const isEarned = earned.has(milestone);
        const row = earnedRows.get(milestone);
        return (
          <div
            key={milestone}
            className={`rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-center ${compact ? "p-1.5" : "p-3"} ${isEarned ? "" : "opacity-35 grayscale"}`}
            title={isEarned && row ? `${milestone}일 배지 · ${new Date(row.awarded_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}` : `${milestone}일 배지 미획득`}
          >
            <img
              src={BADGE_ASSETS[milestone as Milestone]}
              alt={`${milestone}일 ${isEarned ? "획득" : "미획득"} 배지`}
              className={`mx-auto object-contain ${compact ? "size-9" : "size-16"}`}
              loading="lazy"
            />
            {!compact && <p className="mt-1 text-xs font-black">{milestone} DAYS</p>}
          </div>
        );
      })}
    </div>
  );
}
