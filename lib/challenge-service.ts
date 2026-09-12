import { createAdminClient } from "@/lib/supabase/admin";
import {
  DAY_MS,
  baseStageForDay,
  currentWeekStartKey,
  dateKeyToKstStart,
  elapsedDays,
  formatDateKey,
  previousWeekStartKey,
  weekDeadlineFromKey,
} from "@/lib/challenge";
import type { Challenge } from "@/lib/types";

export async function processMissedWeeks(userId: string, now = new Date()) {
  const admin = createAdminClient();
  const { data: challenge, error } = await admin
    .from("challenges")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!challenge) return null;

  const typed = challenge as Challenge;
  const first = typed.first_judgement_week_start;
  const lastClosed = previousWeekStartKey(now);
  const completionAt = new Date(new Date(typed.started_at).getTime() + 1000 * DAY_MS);

  if (lastClosed < first) return typed;

  let cursor = typed.last_processed_week_start
    ? new Date(dateKeyToKstStart(typed.last_processed_week_start).getTime() + DAY_MS * 7)
    : dateKeyToKstStart(first);
  const end = dateKeyToKstStart(lastClosed);
  let lastVisited = typed.last_processed_week_start;

  while (cursor <= end) {
    const weekStart = formatDateKey(cursor);
    const deadline = weekDeadlineFromKey(weekStart);

    // The challenge ends at the 1000-day mark. A week whose deadline falls
    // after completion is never judged as a failure.
    if (deadline.getTime() > completionAt.getTime()) break;

    const { data: existing } = await admin
      .from("weekly_results")
      .select("id")
      .eq("challenge_id", typed.id)
      .eq("week_start", weekStart)
      .maybeSingle();

    if (!existing) {
      const baseStage = baseStageForDay(elapsedDays(typed.started_at, deadline));
      const { error: failureError } = await admin.rpc("record_week_failure", {
        p_user_id: userId,
        p_week_start: weekStart,
        p_base_stage: baseStage,
      });
      if (failureError) throw failureError;
    }

    lastVisited = weekStart;
    cursor = new Date(cursor.getTime() + DAY_MS * 7);
  }

  if (lastVisited && lastVisited !== typed.last_processed_week_start) {
    const { error: updateError } = await admin
      .from("challenges")
      .update({ last_processed_week_start: lastVisited })
      .eq("id", typed.id);
    if (updateError) throw updateError;
  }

  const { data: refreshed, error: refreshedError } = await admin
    .from("challenges")
    .select("*")
    .eq("id", typed.id)
    .single();
  if (refreshedError) throw refreshedError;
  return refreshed as Challenge;
}

export async function getChallenge(userId: string, process = true) {
  if (process) return processMissedWeeks(userId);
  const admin = createAdminClient();
  const { data, error } = await admin.from("challenges").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data as Challenge | null;
}

export function currentChallengeWeek(challenge: Challenge, now = new Date()) {
  const current = currentWeekStartKey(now);
  if (current < challenge.first_judgement_week_start) return null;
  return current;
}
