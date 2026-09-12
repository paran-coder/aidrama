"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function authError(message: string) {
  return `/signup?error=${encodeURIComponent(message)}`;
}

export async function signupAction(formData: FormData) {
  const inviteCode = text(formData, "inviteCode").toUpperCase();
  const displayName = text(formData, "displayName");
  const email = text(formData, "email").toLowerCase();
  const password = text(formData, "password");

  if (!inviteCode || !displayName || !email || password.length < 8) {
    redirect(authError("초대 코드, 이름, 이메일과 8자 이상의 비밀번호를 확인해 주세요."));
  }

  const admin = createAdminClient();
  const { data: invite } = await admin
    .from("invite_codes")
    .select("code, used_by, used_at, expires_at")
    .eq("code", inviteCode)
    .maybeSingle();

  if (!invite) redirect(authError("존재하지 않는 초대 코드입니다."));
  if (invite.used_at) redirect(authError("이미 사용된 초대 코드입니다."));
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) redirect(authError("만료된 초대 코드입니다."));

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });

  if (createError || !created.user) {
    const message = createError?.message?.toLowerCase().includes("already")
      ? "이미 가입된 이메일입니다. 로그인해 주세요."
      : "계정을 만들 수 없습니다. 입력 정보를 확인해 주세요.";
    redirect(authError(message));
  }

  const { error: claimError } = await admin.rpc("claim_invite_code", {
    p_code: inviteCode,
    p_user_id: created.user.id,
    p_display_name: displayName,
  });

  if (claimError) {
    await admin.auth.admin.deleteUser(created.user.id);
    const raw = claimError.message ?? "";
    const message = raw.includes("ALREADY_USED") ? "방금 다른 사용자가 사용한 초대 코드입니다." : "초대 코드를 사용할 수 없습니다.";
    redirect(authError(message));
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) redirect(`/login?message=${encodeURIComponent("가입이 완료되었습니다. 로그인해 주세요.")}`);
  redirect("/onboarding");
}

export async function loginAction(formData: FormData) {
  const email = text(formData, "email").toLowerCase();
  const password = text(formData, "password");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent("이메일 또는 비밀번호가 올바르지 않습니다.")}`);
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function forgotPasswordAction(formData: FormData) {
  const email = text(formData, "email").toLowerCase();
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });
  redirect(`/forgot-password?sent=1`);
}

export async function resetPasswordAction(formData: FormData) {
  const password = text(formData, "password");
  if (password.length < 8) redirect(`/reset-password?error=${encodeURIComponent("비밀번호는 8자 이상이어야 합니다.")}`);
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(`/reset-password?error=${encodeURIComponent("비밀번호를 변경하지 못했습니다.")}`);
  redirect(`/dashboard?message=${encodeURIComponent("비밀번호가 변경되었습니다.")}`);
}
