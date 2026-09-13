export type VerificationStatus = "verified" | "unverified";
export type WeeklyStatus = "success" | "failure";
export type WeeklyEffect = "none" | "stage_drop" | "warning" | "reset" | "recovery";
export type WeeklyResultSource = "user_submission" | "system_missed" | "admin_correction";
export type UserRole = "user" | "admin";
export type AccountStatus = "active" | "suspended";
export type AuditAction = "weekly_result_corrected" | "invite_code_revoked" | "user_suspended" | "user_reactivated";

export type Profile = {
  id: string;
  display_name: string;
  role: UserRole;
  status: AccountStatus;
  suspended_at: string | null;
  suspended_by: string | null;
  suspension_reason: string | null;
  created_at: string;
};

export type Challenge = {
  id: string;
  user_id: string;
  started_at: string;
  first_judgement_week_start: string;
  streak: number;
  longest_streak: number;
  consecutive_failures: number;
  stage_override: number | null;
  reset_count: number;
  success_count: number;
  failure_count: number;
  last_processed_week_start: string | null;
  created_at: string;
};

export type Submission = {
  id: string;
  challenge_id: string;
  user_id: string;
  week_start: string;
  url: string;
  platform_host: string | null;
  verification_status: VerificationStatus;
  submitted_at: string;
  created_at?: string;
};

export type WeeklyResult = {
  id: string;
  challenge_id: string;
  user_id: string;
  week_start: string;
  status: WeeklyStatus;
  final_submission_id: string | null;
  source: WeeklyResultSource;
  effect: WeeklyEffect;
  streak_after: number;
  consecutive_failures_after: number;
  stage_override_after: number | null;
  reset_count_after: number;
  processed_at: string;
  updated_at?: string;
};

export type ChallengeBadge = {
  id: string;
  challenge_id: string;
  user_id: string;
  milestone_days: 100 | 300 | 600 | 900 | 1000;
  awarded_at: string;
  trigger_weekly_result_id: string | null;
  trigger_submission_id: string | null;
  created_at: string;
};

export type AuditLog = {
  id: number;
  actor_user_id: string | null;
  target_user_id: string | null;
  challenge_id: string | null;
  week_start: string | null;
  action: AuditAction;
  reason: string;
  before_data: Record<string, unknown>;
  after_data: Record<string, unknown>;
  created_at: string;
};
