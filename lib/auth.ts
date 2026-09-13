import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types";

export type AuthContext = {
  user: User;
  profile: Profile;
  isAdmin: boolean;
};

const PROFILE_SELECT = "id,display_name,role,status,suspended_at,suspended_by,suspension_reason,created_at";

function authErrorText(error: unknown) {
  if (!error || typeof error !== "object") return String(error ?? "");
  const value = error as { message?: unknown; code?: unknown; name?: unknown };
  return [value.name, value.code, value.message].filter(Boolean).join(" ").toLowerCase();
}

export function isSignedOutAuthError(error: unknown) {
  const text = authErrorText(error);
  return [
    "user from sub claim in jwt does not exist",
    "user_not_found",
    "user not found",
    "session_not_found",
    "session not found",
    "refresh_token_not_found",
    "refresh token not found",
    "invalid refresh token",
    "jwt expired",
  ].some((signal) => text.includes(signal));
}

export async function getUser() {
  const supabase = await createClient();
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!error) return user;
    if (isSignedOutAuthError(error)) return null;
    lastError = error;
    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 120));
  }

  throw lastError instanceof Error ? lastError : new Error("AUTH_SESSION_LOOKUP_FAILED");
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const user = await getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;

  const envAdmin = Boolean(
    user.email && process.env.ADMIN_EMAIL && user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase(),
  );
  const isAdmin = envAdmin || profile?.role === "admin";

  const resolvedProfile: Profile = profile
    ? (profile as Profile)
    : {
        id: user.id,
        display_name: user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? "참여자",
        role: isAdmin ? "admin" : "user",
        status: isAdmin ? "active" : "suspended",
        suspended_at: isAdmin ? null : user.created_at,
        suspended_by: null,
        suspension_reason: isAdmin ? null : "서비스 참여 프로필이 등록되지 않은 계정입니다.",
        created_at: user.created_at,
      };

  return { user, profile: resolvedProfile, isAdmin };
}

export async function requireAppContext(): Promise<AuthContext> {
  const context = await getAuthContext();
  if (!context) redirect("/login");
  const resolved = context as AuthContext;
  if (resolved.profile.status === "suspended" && !resolved.isAdmin) redirect("/account-suspended");
  return resolved;
}

export async function requireUser() {
  return (await requireAppContext()).user;
}

export async function isAdminUser(userId: string, email?: string | null) {
  if (email && process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()) return true;
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("role").eq("id", userId).maybeSingle();
  return data?.role === "admin";
}

export async function requireAdmin() {
  const context = await requireAppContext();
  if (!context.isAdmin) redirect("/dashboard");
  return context;
}
