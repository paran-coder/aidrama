"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function deleteParticipantAccountAction(formData: FormData) {
  const { user: actor } = await requireAdmin();
  const targetUserId = String(formData.get("targetUserId") ?? "").trim();
  const confirmDisplayName = String(formData.get("confirmDisplayName") ?? "").trim();
  const back = `/admin/participants/${targetUserId}`;

  if (!targetUserId) {
    redirect(`/admin?error=${encodeURIComponent("삭제할 사용자 정보를 확인해 주세요.")}`);
  }
  if (targetUserId === actor.id) {
    redirect(`${back}?error=${encodeURIComponent("현재 로그인한 관리자 계정은 삭제할 수 없습니다.")}`);
  }

  const admin = createAdminClient();
  const { data: targetProfile, error: profileError } = await admin
    .from("profiles")
    .select("id,display_name,role")
    .eq("id", targetUserId)
    .maybeSingle();

  if (profileError || !targetProfile) {
    redirect(`/admin?error=${encodeURIComponent("삭제할 사용자 계정을 찾지 못했습니다.")}`);
  }
  if (targetProfile.role === "admin") {
    redirect(`${back}?error=${encodeURIComponent("관리자 계정은 참여자 접근 관리에서 삭제할 수 없습니다.")}`);
  }
  if (confirmDisplayName !== targetProfile.display_name) {
    redirect(`${back}?error=${encodeURIComponent("표시 이름이 일치하지 않아 계정을 삭제하지 않았습니다.")}`);
  }

  const { data: usedCodes } = await admin
    .from("invite_codes")
    .select("code")
    .eq("used_by", targetUserId);

  const { error: deleteError } = await admin.auth.admin.deleteUser(targetUserId, false);
  if (deleteError) {
    redirect(`${back}?error=${encodeURIComponent("계정을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.")}`);
  }

  const deletedAt = new Date().toISOString();
  const codes = (usedCodes ?? []).map((row: { code: string }) => row.code).filter(Boolean);
  if (codes.length > 0) {
    await admin
      .from("invite_codes")
      .update({ used_account_deleted_at: deletedAt })
      .in("code", codes);
  }

  revalidatePath("/admin");
  revalidatePath("/community");
  redirect(`/admin?deleted=${encodeURIComponent(targetProfile.display_name)}`);
}
