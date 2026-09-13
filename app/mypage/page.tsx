import { AppShell } from "@/components/app-shell";
import { MilestoneBadges } from "@/components/milestone-badges";
import { updatePasswordAction, updateProfileAction } from "@/lib/actions/profile";
import { getAppContext } from "@/lib/page-context";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { getChallenge, getChallengeBadges } from "@/lib/challenge-service";
import { CREATOR_LEVELS, creatorLevelIndex } from "@/lib/growth";
import { challengeProgress } from "@/lib/challenge";
import { AccountDeletionPanel } from "@/components/account-deletion-panel";

export default async function MyPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const {user,profile,isAdmin}=await getAppContext();
  const q=await searchParams;
  const error=typeof q.error==="string"?q.error:"";
  const saved=q.saved==="1";
  const password=q.password==="1";
  const challenge = isAdmin ? null : await getChallenge(user.id, false);
  const badges = challenge ? await getChallengeBadges(challenge.id) : [];
  const progress = challenge ? challengeProgress(challenge) : null;
  const levelIndex = creatorLevelIndex(badges, progress?.day ?? 0);
  const level = CREATOR_LEVELS[levelIndex];

  return <AppShell displayName={profile.display_name} isAdmin={isAdmin}><div className="mx-auto max-w-2xl"><p className="eyebrow">Account</p><h1 className="mt-3 text-4xl font-black tracking-[-.05em]">{isAdmin ? "계정 설정" : "마이페이지"}</h1>{error&&<div role="alert" className="ui-danger mt-6 rounded-2xl border p-4 text-sm font-bold">{error}</div>}{(saved||password)&&<div role="status" className="ui-success mt-6 rounded-2xl border p-4 text-sm font-bold">{saved?"프로필이 저장되었습니다.":"비밀번호가 변경되었습니다."}</div>}
  {!isAdmin && challenge && <section className="card mt-8 rounded-[2rem] p-6"><p className="eyebrow">Creator identity</p><div className="mt-2 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-black">Lv.{level.level} · {level.label}</h2><p className="copy-pretty mt-1 text-sm leading-6 text-[var(--muted)]">{level.subtitle}</p></div></div><div className="mt-5"><MilestoneBadges badges={badges} currentDay={progress?.day ?? 0} /></div></section>}
  <section className={`card rounded-[2rem] p-6 ${!isAdmin && challenge ? "mt-4" : "mt-8"}`}><h2 className="text-xl font-black">프로필</h2><form action={updateProfileAction} className="mt-5 space-y-4"><label className="block text-sm font-bold">표시 이름<input className="input-field mt-2" name="displayName" defaultValue={profile.display_name} maxLength={40} required/></label><label className="block text-sm font-bold">이메일<input className="input-field mt-2" value={user.email??""} disabled readOnly/></label><PendingSubmitButton pendingLabel="저장 중...">정보 저장</PendingSubmitButton></form></section><section className="card mt-4 rounded-[2rem] p-6"><h2 className="text-xl font-black">비밀번호 변경</h2><form action={updatePasswordAction} className="mt-5 space-y-4"><label className="block text-sm font-bold">새 비밀번호<input className="input-field mt-2" name="password" type="password" minLength={8} required/></label><PendingSubmitButton className="secondary-button" pendingLabel="변경 중...">비밀번호 변경</PendingSubmitButton></form></section>{!isAdmin ? <AccountDeletionPanel /> : <section className="card mt-4 rounded-[2rem] p-6"><h2 className="text-xl font-black">회원 탈퇴</h2><p className="copy-pretty mt-2 text-sm font-bold leading-6 text-[var(--muted)]">관리자 계정은 운영 보호를 위해 마이페이지에서 직접 탈퇴할 수 없습니다.</p></section>}</div></AppShell>;
}
