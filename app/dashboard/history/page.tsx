import Link from "next/link";
import { redirect } from "next/navigation";
import { AnalyticsEvent } from "@/components/analytics-event";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { processMissedWeeks } from "@/lib/challenge-service";
import { getAppContext } from "@/lib/page-context";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function HistoryPage() {
  const { user, profile, isAdmin }=await getAppContext(); const challenge=await processMissedWeeks(user.id); if(!challenge) redirect("/onboarding");
  const admin=createAdminClient(); const [{data:results},{data:events}]=await Promise.all([admin.from("weekly_results").select("id, week_start, status, processed_at, submissions(url, verification_status, submitted_at)").eq("challenge_id",challenge.id).order("week_start",{ascending:false}),admin.from("challenge_events").select("week_start,event_type,created_at").eq("challenge_id",challenge.id).in("event_type",["warning","reset","stage_drop","recovery"]).order("created_at",{ascending:false})]);
  type HistorySubmission = { url:string; verification_status:"verified"|"unverified"; submitted_at:string };
  type HistoryRow = { id:string; week_start:string; status:"success"|"failure"; processed_at:string; submissions:HistorySubmission|HistorySubmission[]|null };
  type HistoryEvent = { week_start:string|null; event_type:"warning"|"reset"|"stage_drop"|"recovery"; created_at:string };
  const typedResults=(results??[]) as HistoryRow[]; const typedEvents=(events??[]) as HistoryEvent[];
  const eventMap=new Map<string,HistoryEvent["event_type"][]>(); typedEvents.forEach((e:HistoryEvent)=>{if(!e.week_start)return; const list=eventMap.get(e.week_start)??[]; list.push(e.event_type); eventMap.set(e.week_start,list);});
  return <AppShell displayName={profile.display_name} isAdmin={isAdmin}><AnalyticsEvent name="history_view"/><div className="mx-auto max-w-3xl"><div className="flex items-end justify-between gap-4"><div><p className="eyebrow">History</p><h1 className="mt-3 text-4xl font-black tracking-[-.05em]">꾸준함은 흔적이 남습니다.</h1></div><Link href="/dashboard" className="hidden text-sm font-bold text-[var(--muted)] sm:block">← 대시보드</Link></div>{typedResults.length===0?<div className="card mt-8 rounded-[2rem] p-8 text-center"><p className="text-lg font-black">아직 판정 이력이 없습니다.</p><p className="mt-2 text-sm text-[var(--muted)]">첫 주간 챌린지가 끝나면 이곳에 기록이 쌓입니다.</p></div>:<ol className="mt-8 space-y-3">{typedResults.map((r:HistoryRow)=>{const sub=Array.isArray(r.submissions)?r.submissions[0]:r.submissions; const ev=eventMap.get(r.week_start)??[]; return <li key={r.id} className="card rounded-[1.5rem] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-extrabold text-[var(--muted)]">{r.week_start} 시작 주</p><p className="mt-1 text-lg font-black">{r.status==="success"?"업로드 성공":"업로드 없음"}</p></div><div className="flex gap-2"><StatusBadge status={r.status}/>{sub&&<StatusBadge status={sub.verification_status}/>}</div></div>{sub?.url&&<a href={sub.url} target="_blank" rel="noreferrer" className="mt-3 block truncate text-sm font-bold text-[var(--accent)] underline underline-offset-4">{sub.url}</a>}{ev.length>0&&<div className="mt-4 flex flex-wrap gap-2">{ev.map((e,i)=>{const labels: Record<HistoryEvent["event_type"], string>={stage_drop:"성장 1단계 하락",warning:"2회 연속 실패 경고",reset:"알로 리셋",recovery:"성장 단계 회복"}; return <span key={`${e}-${i}`} className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs font-bold text-[var(--muted)]">{labels[e]}</span>})}</div>}</li>})}</ol>}</div></AppShell>;
}
