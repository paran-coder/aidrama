import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { getAuthContext } from "@/lib/auth";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { signupAction } from "@/lib/actions/auth";

export default async function SignupPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const context = await getAuthContext();
  if (context) redirect(context.isAdmin ? "/admin" : context.profile.status === "suspended" ? "/account-suspended" : "/dashboard");
  const q = await searchParams; const error = typeof q.error === "string" ? q.error : "";
  return <main className="mx-auto flex min-h-screen max-w-lg flex-col px-5 py-8"><BrandLogo href="/"/><div className="my-auto py-12"><p className="eyebrow">Private invitation</p><h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">초대 코드로 시작합니다.</h1><p className="copy-pretty mt-3 leading-7 text-[var(--muted)]">한 개의 코드는 한 명만 사용할 수 있습니다. 가입이 완료되면 즉시 사용 처리됩니다.</p>{error&&<div role="alert" className="ui-danger mt-6 rounded-2xl border p-4 text-sm font-bold">{error}</div>}<form action={signupAction} className="mt-7 space-y-4"><label className="block text-sm font-bold">초대 코드<input className="input-field mt-2 uppercase tracking-widest" name="inviteCode" placeholder="OWL-ABCDE-12345" autoComplete="off" required/></label><label className="block text-sm font-bold">표시 이름<input className="input-field mt-2" name="displayName" maxLength={40} required/></label><label className="block text-sm font-bold">이메일<input className="input-field mt-2" name="email" type="email" autoComplete="email" required/></label><label className="block text-sm font-bold">비밀번호<input className="input-field mt-2" name="password" type="password" minLength={8} autoComplete="new-password" required/><span className="mt-1 block text-xs font-medium text-[var(--muted)]">8자 이상</span></label><PendingSubmitButton className="primary-button w-full" pendingLabel="계정 만드는 중...">계정 만들기</PendingSubmitButton></form><p className="mt-5 text-center text-sm text-[var(--muted)]">이미 계정이 있다면 <Link href="/login" className="font-extrabold text-[var(--accent)]">로그인</Link></p></div></main>;
}
