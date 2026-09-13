import { BrandLogo } from "@/components/brand-logo";
import { resetPasswordAction } from "@/lib/actions/auth";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) {
  const q=await searchParams; const error=typeof q.error==="string"?q.error:"";
  return <main className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-8"><BrandLogo href="/"/><section className="my-auto py-16"><p className="eyebrow">New password</p><h1 className="mt-3 text-4xl font-black tracking-[-.05em]">새 비밀번호를 입력하세요.</h1>{error&&<div role="alert" className="ui-danger mt-6 rounded-2xl border p-4 text-sm font-bold">{error}</div>}<form action={resetPasswordAction} className="mt-7 space-y-4"><input className="input-field" name="password" type="password" minLength={8} placeholder="8자 이상" required/><button className="primary-button w-full">비밀번호 변경</button></form></section></main>;
}
