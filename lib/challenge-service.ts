import { createAdminClient } from "@/lib/supabase/admin";
import {
  currentWeekStartKey,
  previousWeekStartKey,
} from "@/lib/challenge";
import type { Challenge, Profile, Submission, WeeklyResult } from "@/lib/types";

export type ChallengeHistory = {
  results: WeeklyResult[];
  submissions: Map<string, Submission>;
};

export type CommunityRow = {
  challenge: Challenge;
  profile: Pick<Profile, "id" | "display_name">;
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
  const lastClosed = previousWeekStartKey(now);
  if (lastClosed >= typed.first_judgement_week_start) {
    const { error: processingError } = await admin.rpc("process_missed_weeks", {
      p_user_id: userId,
      p_last_closed_week: lastClosed,
    });
    if (processingError) throw processingError;
  }

  const { data: refreshed, error: refreshedError } = await admin
    .from("challenges")
    .select("*")
    .eq("id", typed.id)
    .single();
  if (refreshedError) throw refreshedError;
  return refreshed as Challenge;
}

export async function getChallenge(userId: string, process = true): Promise<Challenge | null> {
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

export async function getCommunityRows(): Promise<CommunityRow[]> {
  const admin = createAdminClient();
  const [{ data: profiles, error: profilesError }, { data: challenges, error: challengesError }] = await Promise.all([
    admin.from("profiles").select("id,display_name"),
    admin.from("challenges").select("*"),
  ]);
  if (profilesError) throw profilesError;
  if (challengesError) throw challengesError;

  const typedProfiles = (profiles ?? []) as Pick<Profile, "id" | "display_name">[];
  const typedChallenges = (challenges ?? []) as Challenge[];
  const refreshed = (await Promise.all(typedChallenges.map((challenge) => processMissedWeeks(challenge.user_id))))
    .filter((challenge): challenge is Challenge => Boolean(challenge));
  const profileMap = new Map(typedProfiles.map((profile) => [profile.id, profile]));

  return refreshed
    .flatMap((challenge) => {
      const profile = profileMap.get(challenge.user_id);
      return profile ? [{ challenge, profile }] : [];
    })
    .sort((a, b) => b.challenge.longest_streak - a.challenge.longest_streak || b.challenge.streak - a.challenge.streak);
}

export async function getPublicParticipant(userId: string): Promise<{ profile: Pick<Profile, "id" | "display_name">; challenge: Challenge } | null> {
  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("id,display_name")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!profile) return null;
  const challenge = await processMissedWeeks(userId);
  if (!challenge) return null;
  return { profile: profile as Pick<Profile, "id" | "display_name">, challenge };
}
