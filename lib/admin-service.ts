import { processMissedWeeks, syncAllMissedWeeks } from "@/lib/challenge-service";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AuditLog, Challenge, ChallengeBadge, Profile, Submission, WeeklyResult } from "@/lib/types";

type RawInviteCode = {
  code: string;
  created_at: string;
  expires_at: string | null;
  used_by: string | null;
  used_at: string | null;
  revoked_at: string | null;
  revoked_by: string | null;
  revoke_reason: string | null;
};

type AuthUserSummary = { id: string; email?: string | null };

export type InviteCodeRow = {
  code: string;
  created_at: string;
  expires_at: string | null;
  used_by: string | null;
  used_at: string | null;
  revoked_at: string | null;
  revoked_by: string | null;
  revoke_reason: string | null;
  used_display_name: string | null;
  used_email: string | null;
};

export type AdminParticipantRow = {
  profile: Pick<Profile, "id" | "display_name" | "role" | "status" | "suspended_at" | "suspension_reason" | "created_at">;
  email: string | null;
  challenge: Challenge | null;
  badges: ChallengeBadge[];
};

export type AdminParticipantDetail = {
  profile: Pick<Profile, "id" | "display_name" | "role" | "status" | "suspended_at" | "suspension_reason" | "created_at">;
  email: string | null;
  challenge: Challenge | null;
  results: WeeklyResult[];
  submissions: Submission[];
  auditLogs: AuditLog[];
  badges: ChallengeBadge[];
};

const PROFILE_FIELDS = "id,display_name,role,status,suspended_at,suspension_reason,created_at";

export async function getAdminOverview() {
  const admin = createAdminClient();
  await syncAllMissedWeeks();

  const [codesResponse, profilesResponse, challengesResponse, badgesResponse, authUsersResponse] = await Promise.all([
    admin.from("invite_codes").select("code,created_at,expires_at,used_by,used_at,revoked_at,revoked_by,revoke_reason").order("created_at", { ascending: false }),
    admin.from("profiles").select(PROFILE_FIELDS).order("created_at", { ascending: true }),
    admin.from("challenges").select("*"),
    admin.from("challenge_badges").select("id,challenge_id,user_id,milestone_days,awarded_at,trigger_weekly_result_id,trigger_submission_id,created_at"),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  if (codesResponse.error) throw codesResponse.error;
  if (profilesResponse.error) throw profilesResponse.error;
  if (challengesResponse.error) throw challengesResponse.error;
  if (badgesResponse.error) throw badgesResponse.error;
  if (authUsersResponse.error) throw authUsersResponse.error;

  const typedProfiles = (profilesResponse.data ?? []) as AdminParticipantRow["profile"][];
  const typedChallenges = (challengesResponse.data ?? []) as Challenge[];
  const challengeMap = new Map(typedChallenges.map((challenge) => [challenge.user_id, challenge]));
  const profileMap = new Map(typedProfiles.map((profile) => [profile.id, profile]));
  const typedBadges = (badgesResponse.data ?? []) as ChallengeBadge[];
  const badgesByUser = new Map<string, ChallengeBadge[]>();
  for (const badge of typedBadges) {
    const list = badgesByUser.get(badge.user_id) ?? [];
    list.push(badge);
    badgesByUser.set(badge.user_id, list);
  }
  const authUsers = authUsersResponse.data.users as AuthUserSummary[];
  const emailMap = new Map<string, string | null>(authUsers.map((user) => [user.id, user.email ?? null]));

  const participants: AdminParticipantRow[] = typedProfiles.map((profile) => ({
    profile,
    email: emailMap.get(profile.id) ?? null,
    challenge: challengeMap.get(profile.id) ?? null,
    badges: badgesByUser.get(profile.id) ?? [],
  }));

  const rawCodes = (codesResponse.data ?? []) as RawInviteCode[];
  const codes: InviteCodeRow[] = rawCodes.map((row) => {
    const profile = row.used_by ? profileMap.get(row.used_by) : null;
    return {
      ...row,
      used_display_name: profile?.display_name ?? null,
      used_email: row.used_by ? emailMap.get(row.used_by) ?? null : null,
    } as InviteCodeRow;
  });

  return { codes, participants };
}

export async function getAdminParticipant(userId: string): Promise<AdminParticipantDetail | null> {
  const admin = createAdminClient();
  const [profileResponse, authUserResponse] = await Promise.all([
    admin.from("profiles").select(PROFILE_FIELDS).eq("id", userId).maybeSingle(),
    admin.auth.admin.getUserById(userId),
  ]);
  if (profileResponse.error) throw profileResponse.error;
  if (!profileResponse.data) return null;
  if (authUserResponse.error) throw authUserResponse.error;

  const profile = profileResponse.data as AdminParticipantDetail["profile"];
  const challenge = await processMissedWeeks(userId);
  if (!challenge) {
    return {
      profile,
      email: authUserResponse.data.user?.email ?? null,
      challenge: null,
      results: [],
      submissions: [],
      auditLogs: [],
      badges: [],
    };
  }

  const [resultsResponse, submissionsResponse, auditsResponse, badgesResponse] = await Promise.all([
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
      .eq("target_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100),
    admin
      .from("challenge_badges")
      .select("id,challenge_id,user_id,milestone_days,awarded_at,trigger_weekly_result_id,trigger_submission_id,created_at")
      .eq("challenge_id", challenge.id)
      .order("milestone_days", { ascending: true }),
  ]);

  if (resultsResponse.error) throw resultsResponse.error;
  if (submissionsResponse.error) throw submissionsResponse.error;
  if (auditsResponse.error) throw auditsResponse.error;
  if (badgesResponse.error) throw badgesResponse.error;

  return {
    profile,
    email: authUserResponse.data.user?.email ?? null,
    challenge,
    results: (resultsResponse.data ?? []) as WeeklyResult[],
    submissions: (submissionsResponse.data ?? []) as Submission[],
    auditLogs: (auditsResponse.data ?? []) as AuditLog[],
    badges: (badgesResponse.data ?? []) as ChallengeBadge[],
  };
}
