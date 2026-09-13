import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { getAuthContext } from "@/lib/auth";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { signupAction } from "@/lib/actions/auth";

export default async function SignupPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const context = await getAuthContext();
  if (context) redirect(context.isAdmin ? "/admin" : context.profile.status === "suspended" ? "/account-suspended" : "/dashboard");
  const q = await searchParams;
  const error = typeof q.error === "string" ? q.error : "";

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-5 py-8">
      <BrandLogo href="/" />
      <div className="my-auto py-12">
        <p className="eyebrow">Participant signup</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">OWL1000 참여자로 시작합니다.</h1>
        <p className="copy-pretty mt-3 leading-7 text-[var(--muted)]">이 페이지는 챌린지 참여자에게 공유된 가입 페이지입니다.</p>
        {error && <div role="alert" className="ui-danger mt-6 rounded-2xl border p-4 text-sm font-bold">{error}</div>}
        <form action={signupAction} className="mt-7 space-y-4">
          <label className="block text-sm font-bold">
            톡방 닉네임
            <input className="input-field mt-2" name="displayName" maxLength={40} autoComplete="nickname" required />
            <span className="copy-pretty mt-2 block text-xs font-medium leading-5 text-[var(--muted)]">챌린지 톡방에서 사용 중인 닉네임을 정확히 입력해 주세요. 운영자가 참여자를 확인할 때 사용됩니다.</span>
          </label>
          <label className="block text-sm font-bold">이메일<input className="input-field mt-2" name="email" type="email" autoComplete="email" required /></label>
          <label className="block text-sm font-bold">비밀번호<input className="input-field mt-2" name="password" type="password" minLength={8} autoComplete="new-password" required /><span className="mt-1 block text-xs font-medium text-[var(--muted)]">8자 이상</span></label>
          <PendingSubmitButton className="primary-button w-full" pendingLabel="계정 만드는 중...">계정 만들기</PendingSubmitButton>
        </form>
        <p className="mt-5 text-center text-sm text-[var(--muted)]">이미 계정이 있다면 <Link href="/login" className="font-extrabold text-[var(--accent)]">로그인</Link></p>
      </div>
    </main>
  );
}
