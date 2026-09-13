import { BrandLogo } from "@/components/brand-logo";
import { forgotPasswordAction } from "@/lib/actions/auth";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) {
  const q=await searchParams; const sent=q.sent==="1";
  return <main className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-8"><BrandLogo href="/"/><section className="my-auto py-16"><p className="eyebrow">Password reset</p><h1 className="mt-3 text-4xl font-black tracking-[-.05em]">비밀번호를 다시 설정합니다.</h1>{sent?<div className="ui-success mt-6 rounded-2xl border p-5 font-bold">가입된 계정이라면 비밀번호 재설정 메일이 발송되었습니다.</div>:<><p className="copy-pretty mt-3 leading-7 text-[var(--muted)]">가입한 이메일 주소를 입력해 주세요.</p><form action={forgotPasswordAction} className="mt-7 space-y-4"><input className="input-field" name="email" type="email" placeholder="you@example.com" required/><button className="primary-button w-full">재설정 메일 받기</button></form></>}</section></main>;
}
