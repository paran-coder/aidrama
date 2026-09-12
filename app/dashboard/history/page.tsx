import Link from "next/link";
import { redirect } from "next/navigation";
import { AnalyticsEvent } from "@/components/analytics-event";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { processMissedWeeks } from "@/lib/challenge-service";
import { getAppContext } from "@/lib/page-context";
import { createAdminClient } from "@/lib/supabase/admin";

type HistorySubmission = {
  id: string;
  url: string;
  verification_status: "verified" | "unverified";
  submitted_at: string;
};

type HistoryRow = {
  id: string;
  week_start: string;
  status: "success" | "failure";
  processed_at: string;
  submission_id: string | null;
};

type HistoryEvent = {
  week_start: string | null;
  event_type: "warning" | "reset" | "stage_drop" | "recovery";
  created_at: string;
};

export default async function HistoryPage() {
  const { user, profile, isAdmin } = await getAppContext();
  const challenge = await processMissedWeeks(user.id);
  if (!challenge) redirect("/onboarding");

  const admin = createAdminClient();
  const [{ data: results, error: resultsError }, { data: events, error: eventsError }] = await Promise.all([
    admin
      .from("weekly_results")
      .select("id, week_start, status, processed_at, submission_id")
      .eq("challenge_id", challenge.id)
      .order("week_start", { ascending: false }),
    admin
      .from("challenge_events")
      .select("week_start,event_type,created_at")
      .eq("challenge_id", challenge.id)
      .in("event_type", ["warning", "reset", "stage_drop", "recovery"])
      .order("created_at", { ascending: false }),
  ]);

  if (resultsError) throw resultsError;
  if (eventsError) throw eventsError;

  const typedResults = (results ?? []) as HistoryRow[];
  const typedEvents = (events ?? []) as HistoryEvent[];
  const submissionIds = typedResults.flatMap((row) => (row.submission_id ? [row.submission_id] : []));

  let submissionMap = new Map<string, HistorySubmission>();
  if (submissionIds.length > 0) {
    const { data: submissions, error: submissionsError } = await admin
      .from("submissions")
      .select("id, url, verification_status, submitted_at")
      .in("id", submissionIds);

    if (submissionsError) throw submissionsError;
    submissionMap = new Map(
      ((submissions ?? []) as HistorySubmission[]).map((submission) => [submission.id, submission]),
    );
  }

  const eventMap = new Map<string, HistoryEvent["event_type"][]>();
  typedEvents.forEach((event) => {
    if (!event.week_start) return;
    const list = eventMap.get(event.week_start) ?? [];
    list.push(event.event_type);
    eventMap.set(event.week_start, list);
  });

  return (
    <AppShell displayName={profile.display_name} isAdmin={isAdmin}>
      <AnalyticsEvent name="history_view" />
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">History</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-.05em]">꾸준함은 흔적이 남습니다.</h1>
          </div>
          <Link href="/dashboard" className="hidden text-sm font-bold text-[var(--muted)] sm:block">
            ← 대시보드
          </Link>
        </div>

        {typedResults.length === 0 ? (
          <div className="card mt-8 rounded-[2rem] p-8 text-center">
            <p className="text-lg font-black">아직 판정 이력이 없습니다.</p>
            <p className="mt-2 text-sm text-[var(--muted)]">첫 주간 챌린지가 끝나면 이곳에 기록이 쌓입니다.</p>
          </div>
        ) : (
          <ol className="mt-8 space-y-3">
            {typedResults.map((row) => {
              const submission = row.submission_id ? submissionMap.get(row.submission_id) : undefined;
              const rowEvents = eventMap.get(row.week_start) ?? [];

              return (
                <li key={row.id} className="card rounded-[1.5rem] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-extrabold text-[var(--muted)]">{row.week_start} 시작 주</p>
                      <p className="mt-1 text-lg font-black">
                        {row.status === "success" ? "업로드 성공" : "업로드 없음"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <StatusBadge status={row.status} />
                      {submission && <StatusBadge status={submission.verification_status} />}
                    </div>
                  </div>

                  {submission?.url && (
                    <a
                      href={submission.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 block truncate text-sm font-bold text-[var(--accent)] underline underline-offset-4"
                    >
                      {submission.url}
                    </a>
                  )}

                  {rowEvents.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {rowEvents.map((event, index) => {
                        const labels: Record<HistoryEvent["event_type"], string> = {
                          stage_drop: "성장 1단계 하락",
                          warning: "2회 연속 실패 경고",
                          reset: "알로 리셋",
                          recovery: "성장 단계 회복",
                        };
                        return (
                          <span
                            key={`${event}-${index}`}
                            className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs font-bold text-[var(--muted)]"
                          >
                            {labels[event]}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </AppShell>
  );
}
