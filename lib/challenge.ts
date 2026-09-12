import type { Challenge } from "@/lib/types";

export const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
export const DAY_MS = 24 * 60 * 60 * 1000;

export const OWL_STAGES = [
  { minDay: 0, label: "알", subtitle: "가능성을 품은 시작" },
  { minDay: 30, label: "새끼 부엉이", subtitle: "꾸준함이 형태를 갖추는 중" },
  { minDay: 100, label: "어린 부엉이", subtitle: "리듬을 익힌 창작자" },
  { minDay: 200, label: "탐험가", subtitle: "자신만의 문법을 찾는 중" },
  { minDay: 365, label: "창작자", subtitle: "1년의 루틴을 만든 단계" },
  { minDay: 550, label: "수호자", subtitle: "꾸준함이 실력이 된 단계" },
  { minDay: 730, label: "현자", subtitle: "두 해를 넘어선 창작자" },
  { minDay: 900, label: "마스터", subtitle: "1000일 완주를 눈앞에 둔 단계" },
] as const;

function kstDateParts(date: Date) {
  const shifted = new Date(date.getTime() + KST_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    date: shifted.getUTCDate(),
    day: shifted.getUTCDay(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    second: shifted.getUTCSeconds(),
  };
}

function utcFromKstParts(year: number, month: number, date: number, hour = 0, minute = 0, second = 0) {
  return new Date(Date.UTC(year, month, date, hour, minute, second) - KST_OFFSET_MS);
}

export function formatDateKey(date: Date): string {
  const p = kstDateParts(date);
  return `${p.year}-${String(p.month + 1).padStart(2, "0")}-${String(p.date).padStart(2, "0")}`;
}

export function dateKeyToKstStart(key: string): Date {
  const [year, month, date] = key.split("-").map(Number);
  return utcFromKstParts(year, month - 1, date);
}

export function mondayOfKstWeek(date: Date): Date {
  const p = kstDateParts(date);
  const isoDay = p.day === 0 ? 7 : p.day;
  return utcFromKstParts(p.year, p.month, p.date - (isoDay - 1));
}

export function nextMondayAfterStart(date: Date): Date {
  return new Date(mondayOfKstWeek(date).getTime() + 7 * DAY_MS);
}

export function currentWeekStartKey(date = new Date()): string {
  return formatDateKey(mondayOfKstWeek(date));
}

export function previousWeekStartKey(date = new Date()): string {
  return formatDateKey(new Date(mondayOfKstWeek(date).getTime() - 7 * DAY_MS));
}

export function weekDeadlineFromKey(weekStart: string): Date {
  const monday = dateKeyToKstStart(weekStart);
  return new Date(monday.getTime() + 7 * DAY_MS - 1000);
}

export function isWeekOpen(weekStart: string, now = new Date()) {
  const start = dateKeyToKstStart(weekStart);
  return now >= start && now <= weekDeadlineFromKey(weekStart);
}

export function elapsedDays(startedAt: string | Date, now = new Date()): number {
  const start = typeof startedAt === "string" ? new Date(startedAt) : startedAt;
  return Math.min(1000, Math.max(0, Math.floor((now.getTime() - start.getTime()) / DAY_MS)));
}

export function baseStageForDay(day: number): number {
  let index = 0;
  OWL_STAGES.forEach((stage, i) => {
    if (day >= stage.minDay) index = i;
  });
  return index;
}

export function effectiveStage(challenge: Pick<Challenge, "started_at" | "stage_override">, now = new Date()): number {
  const base = baseStageForDay(elapsedDays(challenge.started_at, now));
  if (challenge.stage_override === null) return base;
  return Math.min(base, Math.max(0, challenge.stage_override));
}

export function challengeProgress(challenge: Pick<Challenge, "started_at">, now = new Date()) {
  const day = elapsedDays(challenge.started_at, now);
  return { day, percent: Math.min(100, (day / 1000) * 100), completed: day >= 1000 };
}

export function daysUntilNextMonday(now = new Date()) {
  const next = new Date(mondayOfKstWeek(now).getTime() + 7 * DAY_MS);
  return Math.max(0, Math.ceil((next.getTime() - now.getTime()) / DAY_MS));
}

export function deadlineParts(deadline: Date, now = new Date()) {
  const diff = Math.max(0, deadline.getTime() - now.getTime());
  const days = Math.floor(diff / DAY_MS);
  const hours = Math.floor((diff % DAY_MS) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  return { days, hours, minutes };
}
