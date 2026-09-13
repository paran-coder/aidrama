import { createAdminClient } from "@/lib/supabase/admin";
import type { AuditLog, Challenge, ChallengeBadge, Profile, Submission, WeeklyResult } from "@/lib/types";

export type AdminParticipantRow = {
  profile: Pick<Profile, "id" | "display_name" | "email" | "role" | "status" | "suspended_at" | "suspension_reason" | "created_at">;
  email: string | null;
  challenge: Challenge | null;
  badges: ChallengeBadge[];
};

export type AdminParticipantDetail = {
  profile: Pick<Profile, "id" | "display_name" | "email" | "role" | "status" | "suspended_at" | "suspension_reason" | "created_at">;
  email: string | null;
  challenge: Challenge | null;
  results: WeeklyResult[];
  submissions: Submission[];
  auditLogs: AuditLog[];
  badges: ChallengeBadge[];
};

const PROFILE_FIELDS = "id,display_name,email,role,status,suspended_at,suspension_reason,created_at";
const PROFILE_FIELDS_LEGACY = "id,display_name,role,status,suspended_at,suspension_reason,created_at";

type OverviewHealth = {
  profiles: boolean;
  challenges: boolean;
  badges: boolean;
  emailCompatibilityMode: boolean;
};

function describeReadFailure(label: string) {
  return `${label} 조회에 실패해 해당 영역만 비워 두었습니다. 새로고침 없이도 다른 관리자 기능은 사용할 수 있습니다.`;
}

function isMissingEmailColumn(error: { code?: string; message?: string } | null | undefined) {
  if (!error) return false;
  const message = error.message ?? "";
  return error.code === "42703" || error.code === "PGRST204" || /column[^\n]*email|email[^\n]*does not exist/i.test(message);
}

async function readProfiles(admin: ReturnType<typeof createAdminClient>) {
  const warnings: string[] = [];
  try {
    const preferred = await admin.from("profiles").select(PROFILE_FIELDS).eq("role", "user").order("created_at", { ascending: true });
    if (!preferred.error) {
      return {
        profiles: (preferred.data ?? []) as AdminParticipantRow["profile"][],
        ok: true,
        emailCompatibilityMode: false,
        warnings,
      };
    }

    if (!isMissingEmailColumn(preferred.error)) {
      warnings.push(describeReadFailure("참여자"));
      return { profiles: [] as AdminParticipantRow["profile"][], ok: false, emailCompatibilityMode: false, warnings };
    }

    const legacy = await admin.from("profiles").select(PROFILE_FIELDS_LEGACY).eq("role", "user").order("created_at", { ascending: true });
    if (legacy.error) {
      warnings.push(describeReadFailure("참여자"));
      return { profiles: [] as AdminParticipantRow["profile"][], ok: false, emailCompatibilityMode: true, warnings };
    }

    const baseProfiles = (legacy.data ?? []) as Array<Omit<AdminParticipantRow["profile"], "email">>;
    const emailById = new Map<string, string>();
    try {
      const authUsers = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (!authUsers.error) {
        for (const user of authUsers.data.users) {
          if (user.email) emailById.set(user.id, user.email.toLowerCase());
        }
      }
    } catch {
      // Email is supplementary. Keep the admin page usable even if Auth Admin lookup is temporarily unavailable.
    }

    warnings.push("프로필 이메일 캐시 필드를 확인하지 못해 호환 모드로 표시하고 있습니다. 계정 관리 기능은 계속 사용할 수 있습니다.");
    return {
      profiles: baseProfiles.map((profile) => ({ ...profile, email: emailById.get(profile.id) ?? null })) as AdminParticipantRow["profile"][],
      ok: true,
      emailCompatibilityMode: true,
      warnings,
    };
  } catch {
    warnings.push(describeReadFailure("참여자"));
    return { profiles: [] as AdminParticipantRow["profile"][], ok: false, emailCompatibilityMode: false, warnings };
  }
}

async function readChallenges(admin: ReturnType<typeof createAdminClient>) {
  try {
    const response = await admin.from("challenges").select("*");
    if (response.error) return { rows: [] as Challenge[], ok: false };
    return { rows: (response.data ?? []) as Challenge[], ok: true };
  } catch {
    return { rows: [] as Challenge[], ok: false };
  }
}

async function readBadges(admin: ReturnType<typeof createAdminClient>) {
  try {
    const response = await admin
      .from("challenge_badges")
      .select("id,challenge_id,user_id,milestone_days,awarded_at,trigger_weekly_result_id,trigger_submission_id,created_at");
    if (response.error) return { rows: [] as ChallengeBadge[], ok: false };
    return { rows: (response.data ?? []) as ChallengeBadge[], ok: true };
  } catch {
    return { rows: [] as ChallengeBadge[], ok: false };
  }
}

export async function getAdminOverview() {
  const admin = createAdminClient();
  const [profileResult, challengeResult, badgeResult] = await Promise.all([
    readProfiles(admin),
    readChallenges(admin),
    readBadges(admin),
  ]);

  const warnings = [...profileResult.warnings];
  if (!challengeResult.ok) warnings.push(describeReadFailure("챌린지 진행 상태"));
  if (!badgeResult.ok) warnings.push(describeReadFailure("마일스톤 배지"));

  const typedProfiles = profileResult.profiles;
  const typedChallenges = challengeResult.rows;
  const challengeMap = new Map(typedChallenges.map((challenge) => [challenge.user_id, challenge]));
  const typedBadges = badgeResult.rows;
  const badgesByUser = new Map<string, ChallengeBadge[]>();
  for (const badge of typedBadges) {
    const list = badgesByUser.get(badge.user_id) ?? [];
    list.push(badge);
    badgesByUser.set(badge.user_id, list);
  }

  const participants: AdminParticipantRow[] = typedProfiles.map((profile) => ({
    profile,
    email: profile.email ?? null,
    challenge: challengeMap.get(profile.id) ?? null,
    badges: badgesByUser.get(profile.id) ?? [],
  }));

  const health: OverviewHealth = {
    profiles: profileResult.ok,
    challenges: challengeResult.ok,
    badges: badgeResult.ok,
    emailCompatibilityMode: profileResult.emailCompatibilityMode,
  };

  return { participants, warnings: Array.from(new Set(warnings)), health };
}

export async function getAdminParticipant(userId: string): Promise<AdminParticipantDetail | null> {
  const admin = createAdminClient();

  let profile: AdminParticipantDetail["profile"] | null = null;
  const preferred = await admin.from("profiles").select(PROFILE_FIELDS).eq("id", userId).maybeSingle();
  if (!preferred.error && preferred.data) {
    profile = preferred.data as AdminParticipantDetail["profile"];
  } else if (isMissingEmailColumn(preferred.error)) {
    const legacy = await admin.from("profiles").select(PROFILE_FIELDS_LEGACY).eq("id", userId).maybeSingle();
    if (legacy.error) throw legacy.error;
    if (!legacy.data) return null;
    let email: string | null = null;
    try {
      const authUser = await admin.auth.admin.getUserById(userId);
      email = authUser.data.user?.email?.toLowerCase() ?? null;
    } catch {
      email = null;
    }
    profile = { ...(legacy.data as Omit<AdminParticipantDetail["profile"], "email">), email };
  } else if (preferred.error) {
    throw preferred.error;
  }

  if (!profile) return null;

  const challengeResponse = await admin.from("challenges").select("*").eq("user_id", userId).maybeSingle();
  if (challengeResponse.error) throw challengeResponse.error;
  const challenge = (challengeResponse.data ?? null) as Challenge | null;

  if (!challenge) {
    return {
      profile,
      email: profile.email ?? null,
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
    email: profile.email ?? null,
    challenge,
    results: (resultsResponse.data ?? []) as WeeklyResult[],
    submissions: (submissionsResponse.data ?? []) as Submission[],
    auditLogs: (auditsResponse.data ?? []) as AuditLog[],
    badges: (badgesResponse.data ?? []) as ChallengeBadge[],
  };
}
