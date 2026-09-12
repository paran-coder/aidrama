export type VerificationStatus = "verified" | "unverified";
export type WeeklyStatus = "success" | "failure";
export type UserRole = "user" | "admin";

export type Profile = {
  id: string;
  display_name: string;
  role: UserRole;
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
  last_processed_week_start: string | null;
  created_at: string;
};
