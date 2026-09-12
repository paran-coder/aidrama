import { redirect } from "next/navigation";
import { AnalyticsEvent } from "@/components/analytics-event";
import { OwlVisual } from "@/components/owl-visual";
import { startChallengeAction } from "@/lib/actions/challenge";
import { getAppContext } from "@/lib/page-context";
import { getChallenge } from "@/lib/challenge-service";

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) {
  const { user } = await getAppContext();
  if (await getChallenge(user.id, false)) redirect("/dashboard");
  const q = await searchParams; const error = typeof q.error === "string" ? q.error : "";
  return <main className="mx-auto grid min-h-screen max-w-5xl items-center gap-10 px-5 py-10 lg:grid-cols-2"><AnalyticsEvent name="onboarding_view"/><div><p className="eyebrow">Day zero</p><h1 className="mt-4 text-5xl font-black tracking-[-.06em]">알에서 시작해<br/>1000일을 기록합니다.</h1><p className="mt-5 max-w-lg leading-8 text-[var(--muted)]">오늘은 0일차입니다. 가입한 이번 주는 판정하지 않고, 다음 월요일부터 첫 주간 챌린지가 시작됩니다.</p>{error&&<div role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-[var(--danger)]">{error}</div>}<div className="mt-8 space-y-3">{["매주 일요일 23:59 전까지 업로드 링크 제출","1회 실패는 한 단계 하락, 2회는 경고, 3회는 알 리셋","실패 뒤 한 번 성공하면 현재 경과일의 정상 단계로 즉시 회복","리셋되어도 1000일 경과 기록은 사라지지 않음"].map((rule,i)=><div key={rule} className="flex gap-3 rounded-2xl border border-[var(--line)] bg-white/55 p-4"><span className="display-number text-lg text-[var(--accent)]">0{i+1}</span><p className="text-sm font-bold leading-6">{rule}</p></div>)}</div><form action={startChallengeAction} className="mt-7"><button className="primary-button w-full sm:w-auto">챌린지 시작하기</button></form></div><div className="soft-shadow rounded-[2.6rem] p-3"><OwlVisual stage={0}/></div></main>;
}
