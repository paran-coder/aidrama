"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAppContext } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { challengeProgress, formatDateKey, weekDeadlineFromKey } from "@/lib/challenge";
import { currentChallengeWeek, getChallenge, getChallengeBadges, processMissedWeeks } from "@/lib/challenge-service";
import { inspectSubmissionUrl } from "@/lib/urls";
import { hasCompletionBadge, MILESTONES, type Milestone } from "@/lib/growth";

export async function startChallengeAction() {
  const { user, isAdmin } = await requireAppContext();
  if (isAdmin) redirect("/admin");
  const existing = await getChallenge(user.id, false);
  if (existing) redirect("/dashboard");

  const now = new Date();
  const admin = createAdminClient();
  const { error } = await admin.from("challenges").insert({
    user_id: user.id,
    started_at: now.toISOString(),
    first_judgement_week_start: formatDateKey(now),
  });
  if (error) redirect(`/onboarding?error=${encodeURIComponent("챌린지를 시작하지 못했습니다.")}`);
  redirect("/dashboard");
}

export async function submitLinkAction(formData: FormData) {
  const { user, isAdmin } = await requireAppContext();
  if (isAdmin) redirect("/admin");
  const url = String(formData.get("url") ?? "").trim();
  const requestedWeekStart = String(formData.get("weekStart") ?? "").trim();
  const inspected = inspectSubmissionUrl(url);
  if (!inspected.valid) redirect(`/dashboard/submit?error=${encodeURIComponent("올바른 http/https 링크를 입력해 주세요.")}`);

  const challenge = await processMissedWeeks(user.id);
  if (!challenge) {
    redirect("/onboarding");
    throw new Error("UNREACHABLE_AFTER_REDIRECT");
  }
  const badgesBefore = await getChallengeBadges(challenge.id);
  if (hasCompletionBadge(badgesBefore, challengeProgress(challenge).day)) redirect(`/complete/${user.id}`);
  const weekStart = currentChallengeWeek(challenge);
  if (!weekStart) redirect(`/dashboard/submit?error=${encodeURIComponent("현재 인증 기간을 계산하지 못했습니다. 잠시 후 다시 시도해 주세요.")}`);
  if (!requestedWeekStart || requestedWeekStart !== weekStart) {
    if (requestedWeekStart && new Date() > weekDeadlineFromKey(requestedWeekStart)) {
      redirect(`/dashboard/submit?error=${encodeURIComponent("열어둔 인증 기간의 마감 시간이 지났습니다. 해당 기간은 실패로 기록되며, 새 인증 기간은 새 화면에서 제출해 주세요.")}`);
    }
    redirect(`/dashboard/submit?error=${encodeURIComponent("인증 기간이 변경되었습니다. 새로 열린 화면에서 다시 제출해 주세요.")}`);
  }
  if (new Date() > weekDeadlineFromKey(requestedWeekStart)) redirect(`/dashboard/submit?error=${encodeURIComponent("현재 인증 기간의 제출 마감 시간이 지났습니다.")}`);

  const admin = createAdminClient();
  const verification = inspected.verified ? "verified" : "unverified";
  const { error } = await admin.rpc("record_submission_success", {
    p_user_id: user.id,
    p_week_start: requestedWeekStart,
    p_url: url,
    p_platform_host: inspected.host || null,
    p_verification: verification,
  });

  if (error) {
    const duplicate = error.message.includes("WEEK_ALREADY_PROCESSED") || error.message.toLowerCase().includes("duplicate");
    redirect(`/dashboard/submit?error=${encodeURIComponent(duplicate ? "현재 인증 기간의 제출은 이미 완료되었습니다." : "제출을 저장하지 못했습니다.")}`);
  }

  const badgesAfter = await getChallengeBadges(challenge.id);
  const beforeMilestones = new Set(badgesBefore.map((badge) => badge.milestone_days));
  const awarded = badgesAfter
    .map((badge) => badge.milestone_days)
    .find((milestone): milestone is Milestone => MILESTONES.includes(milestone as Milestone) && !beforeMilestones.has(milestone));

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/history");
  revalidatePath("/community");
  const milestoneQuery = awarded ? `&milestone=${awarded}` : "";
  redirect(`/dashboard?submitted=${verification}${milestoneQuery}`);
}
