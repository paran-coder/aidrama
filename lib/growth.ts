import type { ChallengeBadge } from "@/lib/types";

export const MILESTONES = [100, 300, 600, 900, 1000] as const;
export type Milestone = (typeof MILESTONES)[number];

export const CREATOR_LEVELS = [
  { level: 1, requiredMilestone: null, label: "크리에이터", english: "Creator", subtitle: "시작하는 순간 이미 창작자" },
  { level: 2, requiredMilestone: 100, label: "루틴 크리에이터", english: "Routine Creator", subtitle: "꾸준함을 창작 습관으로 만든 단계" },
  { level: 3, requiredMilestone: 300, label: "스토리 크리에이터", english: "Story Creator", subtitle: "일상을 자기 이야기로 바꾸는 단계" },
  { level: 4, requiredMilestone: 600, label: "시그니처 크리에이터", english: "Signature Creator", subtitle: "나만의 색과 문법이 선명해진 단계" },
  { level: 5, requiredMilestone: 900, label: "마스터 크리에이터", english: "Master Creator", subtitle: "지속과 자기 스타일을 모두 가진 단계" },
] as const;

export function milestoneSet(badges: Pick<ChallengeBadge, "milestone_days">[] | number[]) {
  return new Set<number>(badges.map((badge) => typeof badge === "number" ? badge : badge.milestone_days));
}

export function creatorLevelIndex(badges: Pick<ChallengeBadge, "milestone_days">[] | number[]) {
  const earned = milestoneSet(badges);
  if (earned.has(900)) return 4;
  if (earned.has(600)) return 3;
  if (earned.has(300)) return 2;
  if (earned.has(100)) return 1;
  return 0;
}

export function currentMilestone(badges: Pick<ChallengeBadge, "milestone_days">[] | number[]): Milestone | null {
  const earned = milestoneSet(badges);
  return MILESTONES.find((milestone) => !earned.has(milestone)) ?? null;
}

export function milestoneProgress(day: number, badges: Pick<ChallengeBadge, "milestone_days">[] | number[]) {
  const target = currentMilestone(badges);
  if (!target) return { target: null, percent: 100, label: "OWL1000 완주" } as const;
  return {
    target,
    percent: Math.min(100, Math.max(0, (day / target) * 100)),
    label: `${Math.min(day, target)} / ${target}일`,
  } as const;
}

export function hasCompletionBadge(badges: Pick<ChallengeBadge, "milestone_days">[] | number[]) {
  return milestoneSet(badges).has(1000);
}
