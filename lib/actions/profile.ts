"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!displayName || displayName.length > 40) redirect(`/mypage?error=${encodeURIComponent("톡방 닉네임은 1~40자로 입력해 주세요.")}`);
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("id", user.id);
  if (error) redirect(`/mypage?error=${encodeURIComponent("프로필을 저장하지 못했습니다.")}`);
  revalidatePath("/mypage");
  redirect(`/mypage?saved=1`);
}

export async function updatePasswordAction(formData: FormData) {
  await requireUser();
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) redirect(`/mypage?error=${encodeURIComponent("새 비밀번호는 8자 이상이어야 합니다.")}`);
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(`/mypage?error=${encodeURIComponent("비밀번호를 변경하지 못했습니다.")}`);
  redirect(`/mypage?password=1`);
}
