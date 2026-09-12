import Link from "next/link";
import { AnalyticsEvent } from "@/components/analytics-event";
import { AppShell } from "@/components/app-shell";
import { OwlVisual } from "@/components/owl-visual";
import { challengeProgress, effectiveStage } from "@/lib/challenge";
import { processMissedWeeks } from "@/lib/challenge-service";
import type { Challenge } from "@/lib/types";
import { getAppContext } from "@/lib/page-context";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function CommunityPage() {
  const { user, profile, isAdmin }=await getAppContext(); const admin=createAdminClient();
  const [{data:profiles},{data:challenges}]=await Promise.all([admin.from("profiles").select("id,display_name"),admin.from("challenges").select("*")]);
  type CommunityProfile = { id: string; display_name: string };
  const typedProfiles=(profiles??[]) as CommunityProfile[];
  const typedChallenges=(challenges??[]) as Challenge[];
  const refreshedChallenges=(await Promise.all(typedChallenges.map((challenge: Challenge)=>processMissedWeeks(challenge.user_id))))
    .filter((challenge): challenge is Challenge=>Boolean(challenge));
  const profileMap=new Map(typedProfiles.map((p: CommunityProfile)=>[p.id,p]));
  const rows=refreshedChallenges.map((challenge: Challenge)=>({challenge,profile:profileMap.get(challenge.user_id)})).filter((x): x is {challenge: Challenge; profile: CommunityProfile}=>Boolean(x.profile)).sort((a,b)=>b.challenge.longest_streak-a.challenge.longest_streak || b.challenge.streak-a.challenge.streak);
  return <AppShell displayName={profile.display_name} isAdmin={isAdmin}><AnalyticsEvent name="community_view"/><div><p className="eyebrow">Community</p><div className="mt-3 flex flex-wrap items-end justify-between gap-4"><h1 className="text-4xl font-black tracking-[-.05em]">함께 가는 사람들.</h1><p className="text-sm font-bold text-[var(--muted)]">최장 스트릭 순 · {rows.length}명</p></div>{rows.length===0?<div className="card mt-8 rounded-[2rem] p-8 text-center font-bold">아직 챌린지를 시작한 참여자가 없습니다.</div>:<div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{rows.map(({challenge,profile:p},index)=>{const stage=effectiveStage(challenge);const progress=challengeProgress(challenge);const me=challenge.user_id===user.id; return <Link href={`/community/${challenge.user_id}`} key={challenge.id} className={`card group rounded-[2rem] p-4 transition hover:-translate-y-1 ${me?"ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg)]":""}`}><div className="flex items-center gap-4"><OwlVisual stage={stage} compact/><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate font-black">{p!.display_name}</p>{me&&<span className="rounded-full bg-[var(--accent)] px-2 py-1 text-[10px] font-black text-white">나</span>}</div><p className="mt-1 text-xs font-bold text-[var(--muted)]">#{index+1} · {progress.day}일째</p><p className="display-number mt-3 text-2xl">{challenge.streak}<span className="ml-1 font-sans text-xs font-extrabold tracking-normal text-[var(--muted)]">주 연속</span></p></div></div></Link>})}</div>}</div></AppShell>;
}
