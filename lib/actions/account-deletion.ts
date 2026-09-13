"use server";

import { redirect } from "next/navigation";
import { requireAppContext } from "@/lib/auth";
import { clearSupabaseAuthCookies, createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function deleteMyAccountAction(formData: FormData) {
  const context = await requireAppContext();

  if (context.isAdmin || context.profile.role === "admin") {
    redirect(`/mypage?error=${encodeURIComponent("관리자 계정은 마이페이지에서 탈퇴할 수 없습니다.")}`);
  }

  const confirmText = String(formData.get("confirmText") ?? "").trim();
  if (confirmText !== "탈퇴") {
    redirect(`/mypage?error=${encodeURIComponent("회원 탈퇴를 진행하려면 확인란에 ‘탈퇴’라고 정확히 입력해 주세요.")}`);
  }

  const admin = createAdminClient();
  const { data: invite, error: inviteLookupError } = await admin
    .from("invite_codes")
    .select("code")
    .eq("used_by", context.user.id)
    .maybeSingle();

  if (inviteLookupError) {
    redirect(`/mypage?error=${encodeURIComponent("탈퇴 정보를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.")}`);
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(context.user.id, false);
  if (deleteError) {
    redirect(`/mypage?error=${encodeURIComponent("계정을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.")}`);
  }

  if (invite?.code) {
    const { error: inviteHistoryError } = await admin
      .from("invite_codes")
      .update({ used_account_deleted_at: new Date().toISOString() })
      .eq("code", invite.code);

    if (inviteHistoryError) {
      console.error("ACCOUNT_DELETE_INVITE_HISTORY_UPDATE_FAILED", { code: invite.code, message: inviteHistoryError.message });
    }
  }

  const supabase = await createClient();
  await supabase.auth.signOut().catch(() => undefined);
  await clearSupabaseAuthCookies();
  redirect("/?accountDeleted=1");
}
