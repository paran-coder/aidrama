import { processMissedWeeks } from "@/lib/challenge-service";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AuditLog, Challenge, Profile, Submission, WeeklyResult } from "@/lib/types";

export type InviteCodeRow = {
  code: string;
  created_at: string;
  expires_at: string | null;
  used_by: string | null;
  used_at: string | null;
};

export type AdminParticipantRow = {
  profile: Pick<Profile, "id" | "display_name" | "role" | "created_at">;
  challenge: Challenge | null;
};

export type AdminParticipantDetail = {
  profile: Pick<Profile, "id" | "display_name" | "role" | "created_at">;
  challenge: Challenge | null;
  results: WeeklyResult[];
  submissions: Submission[];
  auditLogs: AuditLog[];
};

export async function getAdminOverview() {
  const admin = createAdminClient();
  const [{ data: codes, error: codesError }, { data: profiles, error: profilesError }] = await Promise.all([
    admin.from("invite_codes").select("code,created_at,expires_at,used_by,used_at").order("created_at", { ascending: false }),
    admin.from("profiles").select("id,display_name,role,created_at").order("created_at", { ascending: true }),
  ]);
  if (codesError) throw codesError;
  if (profilesError) throw profilesError;

  const typedProfiles = (profiles ?? []) as Pick<Profile, "id" | "display_name" | "role" | "created_at">[];
  const participants: AdminParticipantRow[] = await Promise.all(
    typedProfiles.map(async (profile) => ({ profile, challenge: await processMissedWeeks(profile.id) })),
  );

  return { codes: (codes ?? []) as InviteCodeRow[], participants };
}

export async function getAdminParticipant(userId: string): Promise<AdminParticipantDetail | null> {
  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id,display_name,role,created_at")
    .eq("id", userId)
    .maybeSingle();
  if (profileError) throw profileError;
  if (!profile) return null;

  const challenge = await processMissedWeeks(userId);
  if (!challenge) {
    return {
      profile: profile as Pick<Profile, "id" | "display_name" | "role" | "created_at">,
      challenge: null,
      results: [] as WeeklyResult[],
      submissions: [] as Submission[],
      auditLogs: [] as AuditLog[],
    };
  }

  const [resultsResponse, submissionsResponse, auditsResponse] = await Promise.all([
    admin
      .from("weekly_results")
      .select("id,challenge_id,user_id,week_start,status,final_submission_id,source,effect,streak_after,consecutive_failures_after,stage_override_after,reset_count_after,processed_at,updated_at")
      .eq("challenge_id", challenge.id)
      .order("week_start", { ascending: false }),
    admin
      .from("submissions")
      .select("id,challenge_id,user_id,week_start,url,platform_host,verification_status,submitted_at,created_at")
      .eq("challenge_id", challenge.id)
      .order("submitted_at", { ascending: false }),
    admin
      .from("audit_logs")
      .select("id,actor_user_id,target_user_id,challenge_id,week_start,action,reason,before_data,after_data,created_at")
      .eq("challenge_id", challenge.id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (resultsResponse.error) throw resultsResponse.error;
  if (submissionsResponse.error) throw submissionsResponse.error;
  if (auditsResponse.error) throw auditsResponse.error;

  return {
    profile: profile as Pick<Profile, "id" | "display_name" | "role" | "created_at">,
    challenge,
    results: (resultsResponse.data ?? []) as WeeklyResult[],
    submissions: (submissionsResponse.data ?? []) as Submission[],
    auditLogs: (auditsResponse.data ?? []) as AuditLog[],
  };
}
