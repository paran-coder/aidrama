import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { getAuthContext } from "@/lib/auth";
import { loginAction } from "@/lib/actions/auth";
import { PendingSubmitButton } from "@/components/pending-submit-button";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const context = await getAuthContext();
  if (context) redirect(context.isAdmin ? "/admin" : context.profile.status === "suspended" ? "/account-suspended" : "/dashboard");
  const q = await searchParams;
  const error = typeof q.error === "string" ? q.error : "";
  const message = typeof q.message === "string" ? q.message : "";
  return <main className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-8"><BrandLogo href="/"/><div className="my-auto py-14"><p className="eyebrow">Welcome back</p><h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">다시 이어서 성장하세요.</h1><p className="copy-pretty mt-3 leading-7 text-[var(--muted)]">계정으로 로그인하면 마지막 챌린지 상태에서 바로 이어집니다.</p>{(error||message)&&<div role="status" className={`mt-6 rounded-2xl border p-4 text-sm font-bold ${error?'ui-danger':'ui-success'}`}>{error||message}</div>}<form action={loginAction} className="mt-7 space-y-4"><label className="block text-sm font-bold">이메일<input className="input-field mt-2" name="email" type="email" autoComplete="email" required/></label><label className="block text-sm font-bold">비밀번호<input className="input-field mt-2" name="password" type="password" autoComplete="current-password" required/></label><PendingSubmitButton className="primary-button w-full" pendingLabel="로그인 중...">로그인</PendingSubmitButton></form><div className="mt-5 flex justify-between text-sm font-bold"><Link href="/forgot-password" className="text-[var(--muted)] underline underline-offset-4">비밀번호 찾기</Link><Link href="/signup" className="text-[var(--accent)]">처음 참여하시나요?</Link></div></div></main>;
}
