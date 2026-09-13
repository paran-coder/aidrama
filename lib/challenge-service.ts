import { createAdminClient } from "@/lib/supabase/admin";
import {
  formatDateKey,
  rollingWeekStartKey,
} from "@/lib/challenge";
import type { Challenge, ChallengeBadge, Profile, Submission, WeeklyResult } from "@/lib/types";

export type ChallengeHistory = {
  results: WeeklyResult[];
  submissions: Map<string, Submission>;
};

export type CommunityRow = {
  challenge: Challenge;
  profile: Pick<Profile, "id" | "display_name">;
  badges: ChallengeBadge[];
};

export async function processMissedWeeks(userId: string, now = new Date()): Promise<Challenge | null> {
  const admin = createAdminClient();
  const { data: challenge, error } = await admin
    .from("challenges")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!challenge) return null;

  const typed = challenge as Challenge;
  const { error: processingError } = await admin.rpc("process_missed_weeks", {
    p_user_id: userId,
    // The database derives the participant-specific last closed 7-day window
    // from the challenge anchor and caps this requested date accordingly.
    p_last_closed_week: formatDateKey(now),
  });
  if (processingError) throw processingError;

  const { data: refreshed, error: refreshedError } = await admin
    .from("challenges")
    .select("*")
    .eq("id", typed.id)
    .single();
  if (refreshedError) throw refreshedError;
  return refreshed as Challenge;
}

export async function syncAllMissedWeeks(now = new Date()) {
  const admin = createAdminClient();
  const { error } = await admin.rpc("process_all_missed_weeks", {
    p_last_closed_week: formatDateKey(now),
  });
  if (error) throw error;
}

export async function getChallenge(userId: string, process = true): Promise<Challenge | null> {
  if (process) return processMissedWeeks(userId);
  const admin = createAdminClient();
  const { data, error } = await admin.from("challenges").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data as Challenge | null;
}

export function currentChallengeWeek(challenge: Challenge, now = new Date()) {
  return rollingWeekStartKey(challenge.first_judgement_week_start, now);
}

export async function getWeeklyResult(challengeId: string, weekStart: string): Promise<WeeklyResult | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("weekly_results")
    .select("id,challenge_id,user_id,week_start,status,final_submission_id,source,effect,streak_after,consecutive_failures_after,stage_override_after,reset_count_after,processed_at,updated_at")
    .eq("challenge_id", challengeId)
    .eq("week_start", weekStart)
    .maybeSingle();
  if (error) throw error;
  return data as WeeklyResult | null;
}

export async function getSubmission(submissionId: string | null): Promise<Submission | null> {
  if (!submissionId) return null;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("submissions")
    .select("id,challenge_id,user_id,week_start,url,platform_host,verification_status,submitted_at,created_at")
    .eq("id", submissionId)
    .maybeSingle();
  if (error) throw error;
  return data as Submission | null;
}

export async function getWeeklyResultWithSubmission(challengeId: string, weekStart: string): Promise<{ result: WeeklyResult | null; submission: Submission | null }> {
  const result = await getWeeklyResult(challengeId, weekStart);
  const submission = result ? await getSubmission(result.final_submission_id) : null;
  return { result, submission };
}

export async function getChallengeHistory(challengeId: string): Promise<ChallengeHistory> {
  const admin = createAdminClient();
  const { data: results, error } = await admin
    .from("weekly_results")
    .select("id,challenge_id,user_id,week_start,status,final_submission_id,source,effect,streak_after,consecutive_failures_after,stage_override_after,reset_count_after,processed_at,updated_at")
    .eq("challenge_id", challengeId)
    .order("week_start", { ascending: false });
  if (error) throw error;

  const typedResults = (results ?? []) as WeeklyResult[];
  const submissionIds = typedResults.flatMap((row) => (row.final_submission_id ? [row.final_submission_id] : []));
  if (submissionIds.length === 0) return { results: typedResults, submissions: new Map() };

  const { data: submissions, error: submissionsError } = await admin
    .from("submissions")
    .select("id,challenge_id,user_id,week_start,url,platform_host,verification_status,submitted_at,created_at")
    .in("id", submissionIds);
  if (submissionsError) throw submissionsError;

  return {
    results: typedResults,
    submissions: new Map(((submissions ?? []) as Submission[]).map((row) => [row.id, row])),
  };
}

export async function getChallengeBadges(challengeId: string): Promise<ChallengeBadge[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("challenge_badges")
    .select("id,challenge_id,user_id,milestone_days,awarded_at,trigger_weekly_result_id,trigger_submission_id,created_at")
    .eq("challenge_id", challengeId)
    .order("milestone_days", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ChallengeBadge[];
}

export async function getCommunityRows(): Promise<CommunityRow[]> {
  const admin = createAdminClient();
  const [
    { data: profiles, error: profilesError },
    { data: challenges, error: challengesError },
    { data: badges, error: badgesError },
  ] = await Promise.all([
    admin.from("profiles").select("id,display_name").eq("status", "active").eq("role", "user"),
    admin.from("challenges").select("*"),
    admin.from("challenge_badges").select("id,challenge_id,user_id,milestone_days,awarded_at,trigger_weekly_result_id,trigger_submission_id,created_at"),
  ]);
  if (profilesError) throw profilesError;
  if (challengesError) throw challengesError;
  if (badgesError) throw badgesError;

  const typedProfiles = (profiles ?? []) as Pick<Profile, "id" | "display_name">[];
  const typedChallenges = (challenges ?? []) as Challenge[];
  const typedBadges = (badges ?? []) as ChallengeBadge[];
  const profileMap = new Map(typedProfiles.map((profile) => [profile.id, profile]));
  const badgeMap = new Map<string, ChallengeBadge[]>();
  for (const badge of typedBadges) {
    const list = badgeMap.get(badge.challenge_id) ?? [];
    list.push(badge);
    badgeMap.set(badge.challenge_id, list);
  }

  return typedChallenges
    .flatMap((challenge) => {
      const profile = profileMap.get(challenge.user_id);
      return profile ? [{ challenge, profile, badges: badgeMap.get(challenge.id) ?? [] }] : [];
    })
    .sort((a, b) => b.challenge.longest_streak - a.challenge.longest_streak || b.challenge.streak - a.challenge.streak);
}

export async function getPublicParticipant(userId: string): Promise<{ profile: Pick<Profile, "id" | "display_name">; challenge: Challenge; badges: ChallengeBadge[] } | null> {
  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("id,display_name")
    .eq("id", userId)
    .eq("status", "active")
    .eq("role", "user")
    .maybeSingle();
  if (error) throw error;
  if (!profile) return null;
  const challenge = await processMissedWeeks(userId);
  if (!challenge) return null;
  const badges = await getChallengeBadges(challenge.id);
  return { profile: profile as Pick<Profile, "id" | "display_name">, challenge, badges };
}
