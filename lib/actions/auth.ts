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
  const displayName = text(formData, "displayName");
  const email = text(formData, "email").toLowerCase();
  const password = text(formData, "password");

  if (!displayName || !email || password.length < 8) {
    redirect(authError("톡방 닉네임, 이메일과 8자 이상의 비밀번호를 확인해 주세요."));
  }
  if (displayName.length > 40) {
    redirect(authError("톡방 닉네임은 1~40자로 입력해 주세요."));
  }

  const admin = createAdminClient();
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

  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    display_name: displayName,
    email,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    redirect(authError("참여자 프로필을 만들 수 없습니다. 잠시 후 다시 시도해 주세요."));
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
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) redirect(`/login?error=${encodeURIComponent("이메일 또는 비밀번호가 올바르지 않습니다.")}`);

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role,status")
    .eq("id", data.user.id)
    .maybeSingle();
  const envAdmin = Boolean(process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL.toLowerCase());
  const isAdmin = envAdmin || profile?.role === "admin";

  if (!profile && !isAdmin) {
    await supabase.auth.signOut();
    redirect(`/login?error=${encodeURIComponent("서비스에 등록되지 않은 계정입니다. 회원가입 후 다시 시도해 주세요.")}`);
  }

  if (profile?.status === "suspended" && !isAdmin) {
    await supabase.auth.signOut();
    redirect(`/login?error=${encodeURIComponent("이용이 일시 중지된 계정입니다. 운영자에게 문의해 주세요.")}`);
  }

  redirect(isAdmin ? "/admin" : "/dashboard");
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
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) redirect(`/reset-password?error=${encodeURIComponent("비밀번호를 변경하지 못했습니다.")}`);

  if (!data.user) redirect(`/login?message=${encodeURIComponent("비밀번호가 변경되었습니다. 다시 로그인해 주세요.")}`);
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role,status").eq("id", data.user.id).maybeSingle();
  const envAdmin = Boolean(data.user.email && process.env.ADMIN_EMAIL && data.user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase());
  if (profile?.status === "suspended" && !envAdmin && profile?.role !== "admin") redirect("/account-suspended");
  redirect(envAdmin || profile?.role === "admin" ? "/admin" : `/dashboard?message=${encodeURIComponent("비밀번호가 변경되었습니다.")}`);
}
