import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { logoutAction } from "@/lib/actions/auth";
import { getAuthContext } from "@/lib/auth";

export default async function AccountSuspendedPage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");
  const resolved = context!;
  if (resolved.isAdmin) redirect("/admin");
  if (resolved.profile.status !== "suspended") redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col px-5 py-8">
      <BrandLogo href="/" />
      <section className="my-auto rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-7 sm:p-9">
        <p className="eyebrow">Account status</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-.05em]">계정 이용이 일시 중지되었습니다.</h1>
        <p className="copy-pretty mt-4 leading-7 text-[var(--muted)]">기존 챌린지와 제출 기록은 보존되어 있습니다. 운영자가 계정을 다시 활성화하면 이전 기록에서 그대로 이어갈 수 있습니다.</p>
        {resolved.profile.suspension_reason && (
          <div className="mt-6 rounded-2xl bg-[var(--surface-2)] p-4 text-sm font-bold leading-6">
            운영 사유: {resolved.profile.suspension_reason}
          </div>
        )}
        <form action={logoutAction} className="mt-6"><button className="secondary-button">로그아웃</button></form>
      </section>
    </main>
  );
}
