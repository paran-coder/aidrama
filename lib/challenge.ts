export const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
export const DAY_MS = 24 * 60 * 60 * 1000;

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


export function formatKoreanDateKey(key: string): string {
  const [year, month, date] = key.split("-").map(Number);
  if (!year || !month || !date) return key;
  return `${year}년 ${month}월 ${date}일`;
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

export function challengeProgress(challenge: { started_at: string }, now = new Date()) {
  const day = elapsedDays(challenge.started_at, now);
  return {
    day,
    percent: Math.min(100, (day / 1000) * 100),
    calendarReached1000: day >= 1000,
  };
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
