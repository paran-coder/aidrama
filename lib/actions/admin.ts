"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { currentWeekStartKey } from "@/lib/challenge";
import { syncAllMissedWeeks } from "@/lib/challenge-service";
import { createAdminClient } from "@/lib/supabase/admin";
import { inspectSubmissionUrl } from "@/lib/urls";
import type { AccountStatus, WeeklyStatus } from "@/lib/types";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeCode() {
  const bytes = randomBytes(10);
  let body = "";
  for (let i = 0; i < 10; i += 1) body += ALPHABET[bytes[i] % ALPHABET.length];
  return `OWL-${body.slice(0, 5)}-${body.slice(5)}`;
}

export async function syncParticipantStatesAction() {
  await requireAdmin();
  try {
    await syncAllMissedWeeks();
  } catch {
    redirect(`/admin?error=${encodeURIComponent("진행상태 동기화 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.")}`);
  }
  revalidatePath("/admin");
  revalidatePath("/community");
  redirect("/admin?synced=1");
}

export async function createInviteCodeAction() {
  const { user } = await requireAdmin();
  const admin = createAdminClient();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = makeCode();
    const { error } = await admin.from("invite_codes").insert({ code, created_by: user.id });
    if (!error) {
      revalidatePath("/admin");
      redirect(`/admin?created=${encodeURIComponent(code)}`);
    }
  }
  redirect(`/admin?error=${encodeURIComponent("초대 코드를 발급하지 못했습니다.")}`);
}

export async function revokeInviteCodeAction(formData: FormData) {
  const { user } = await requireAdmin();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const reason = String(formData.get("reason") ?? "관리자 발급 취소").trim();
  if (!code) redirect(`/admin?error=${encodeURIComponent("취소할 초대 코드를 확인해 주세요.")}`);

  const admin = createAdminClient();
  const { error } = await admin.rpc("admin_revoke_invite_code", {
    p_actor_user_id: user.id,
    p_code: code,
    p_reason: reason || "관리자 발급 취소",
  });
  if (error) {
    const message = error.message.includes("INVITE_ALREADY_USED")
      ? "이미 사용된 초대 코드는 취소할 수 없습니다. 사용 이력으로 보존됩니다."
      : "초대 코드 발급을 취소하지 못했습니다.";
    redirect(`/admin?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin");
  redirect(`/admin?revoked=${encodeURIComponent(code)}`);
}

export async function setParticipantStatusAction(formData: FormData) {
  const { user } = await requireAdmin();
  const targetUserId = String(formData.get("targetUserId") ?? "").trim();
  const status = String(formData.get("status") ?? "") as AccountStatus;
  const reason = String(formData.get("reason") ?? "").trim();
  const back = `/admin/participants/${targetUserId}`;

  if (!targetUserId || (status !== "active" && status !== "suspended")) {
    redirect(`${back}?error=${encodeURIComponent("사용자 상태 변경 정보를 확인해 주세요.")}`);
  }
  if (reason.length < 3) redirect(`${back}?error=${encodeURIComponent("상태 변경 사유를 3자 이상 입력해 주세요.")}`);

  const admin = createAdminClient();
  const { error } = await admin.rpc("admin_set_user_status", {
    p_actor_user_id: user.id,
    p_target_user_id: targetUserId,
    p_status: status,
    p_reason: reason,
  });

  if (error) {
    const message = error.message.includes("ADMIN_ACCOUNT_PROTECTED") || error.message.includes("SELF_STATUS_CHANGE_NOT_ALLOWED")
      ? "관리자 계정은 이 화면에서 정지할 수 없습니다."
      : "사용자 상태를 변경하지 못했습니다.";
    redirect(`${back}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin");
  revalidatePath(back);
  revalidatePath("/community");
  redirect(`${back}?statusChanged=${encodeURIComponent(status)}`);
}

export async function correctWeeklyResultAction(formData: FormData) {
  const { user: actor } = await requireAdmin();
  const admin = createAdminClient();
  const targetUserId = String(formData.get("targetUserId") ?? "").trim();
  const challengeId = String(formData.get("challengeId") ?? "").trim();
  const weekStart = String(formData.get("weekStart") ?? "").trim();
  const status = String(formData.get("status") ?? "") as WeeklyStatus;
  const url = String(formData.get("url") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const back = `/admin/participants/${targetUserId}`;

  if (!targetUserId || !challengeId || !/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
    redirect(`${back}?error=${encodeURIComponent("정정할 사용자와 주차를 확인해 주세요.")}`);
  }
  if (status !== "success" && status !== "failure") {
    redirect(`${back}?error=${encodeURIComponent("정정 상태를 선택해 주세요.")}`);
  }
  if (reason.length < 3) {
    redirect(`${back}?error=${encodeURIComponent("정정 사유를 3자 이상 입력해 주세요.")}`);
  }
  const currentWeek = currentWeekStartKey();
  if (weekStart > currentWeek) {
    redirect(`${back}?error=${encodeURIComponent("아직 시작하지 않은 미래 주차는 정정할 수 없습니다.")}`);
  }
  if (status === "failure" && weekStart >= currentWeek) {
    redirect(`${back}?error=${encodeURIComponent("진행 중인 이번 주는 마감 전 실패로 확정할 수 없습니다.")}`);
  }

  let platformHost: string | null = null;
  let verification: "verified" | "unverified" = "unverified";
  if (url) {
    const inspected = inspectSubmissionUrl(url);
    if (!inspected.valid) {
      redirect(`${back}?error=${encodeURIComponent("정정용 링크는 올바른 http/https URL이어야 합니다.")}`);
    }
    platformHost = inspected.host || null;
    verification = inspected.verified ? "verified" : "unverified";
  }

  const { error } = await admin.rpc("admin_correct_week_result", {
    p_actor_user_id: actor.id,
    p_challenge_id: challengeId,
    p_week_start: weekStart,
    p_status: status,
    p_submission_url: url || null,
    p_platform_host: platformHost,
    p_verification: verification,
    p_reason: reason,
  });

  if (error) {
    const message = error.message.includes("SUCCESS_SUBMISSION_REQUIRED")
      ? "실패 기록을 성공으로 바꾸려면 인정할 업로드 링크를 입력해 주세요."
      : error.message.includes("WEEK_NOT_STARTED")
        ? "챌린지 판정 시작 전 주차는 정정할 수 없습니다."
        : "주간 결과를 정정하지 못했습니다.";
    redirect(`${back}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin");
  revalidatePath(back);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/history");
  revalidatePath("/community");
  revalidatePath(`/community/${targetUserId}`);
  redirect(`${back}?corrected=1`);
}
