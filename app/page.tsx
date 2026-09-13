import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { OwlVisual } from "@/components/owl-visual";
import { getAuthContext } from "@/lib/auth";

export default async function LandingPage() {
  const context = await getAuthContext();
  if (context) redirect(context.isAdmin ? "/admin" : context.profile.status === "suspended" ? "/account-suspended" : "/dashboard");

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between"><BrandLogo href="/"/><Link href="/login" className="secondary-button !min-h-0 !px-4 !py-2 text-sm">로그인</Link></header>

      <section className="grid min-h-[78vh] items-center gap-10 py-14 lg:grid-cols-[.94fr_1.06fr] lg:py-16">
        <div>
          <p className="eyebrow">Invitation-only · Start with 100 days</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[.98] tracking-[-0.065em] sm:text-7xl">
            당신은 이미<br/><span className="text-[var(--accent)]">창작자입니다.</span><br/>먼저 100일.
          </h1>
          <p className="copy-pretty mt-7 max-w-xl text-lg leading-8 text-[var(--muted)]">매주 한 편을 이어가며 100일, 300일, 600일, 900일을 지나 OWL1000까지. 작은 성공을 쌓아 나만의 창작 리듬을 만드는 여정입니다.</p>
          <div className="mt-9 flex flex-wrap gap-3"><Link href="/signup" className="primary-button">초대 코드로 시작하기</Link><a href="#rules" className="secondary-button">성장 방식 보기</a></div>
          <div className="mt-8 flex flex-wrap gap-2 text-xs font-black text-[var(--muted)]">
            {["100 DAYS", "300 DAYS", "600 DAYS", "900 DAYS", "OWL1000"].map((label) => <span key={label} className="rounded-full border border-[var(--line)] bg-white/55 px-3 py-2">{label}</span>)}
          </div>
        </div>
        <div className="soft-shadow overflow-hidden rounded-[2.6rem]"><OwlVisual stage={4} hero /></div>
      </section>

      <section id="rules" className="grid gap-4 border-t border-[var(--line)] py-16 md:grid-cols-3">
        {[
          ["01", "먼저 100일", "1000일을 한 번에 약속하지 않습니다. 첫 목표는 100일, 달성할 때마다 다음 마일스톤이 열립니다."],
          ["02", "매주 한 편", "월요일부터 일요일 23:59까지 작업 링크를 제출합니다. 실패하면 스트릭은 끊기지만 레벨과 이미 얻은 배지는 사라지지 않습니다."],
          ["03", "창작자로 레벨업", "크리에이터에서 시작해 루틴·스토리·시그니처·마스터 크리에이터로 성장합니다. 1000일은 완주의 상징입니다."],
        ].map(([n,t,d]) => <article key={n} className="card rounded-[1.6rem] p-6"><span className="display-number text-3xl text-[var(--accent)]">{n}</span><h2 className="mt-6 text-xl font-black">{t}</h2><p className="copy-pretty mt-2 leading-7 text-[var(--muted)]">{d}</p></article>)}
      </section>

      <footer className="border-t border-[var(--line)] py-8 text-sm text-[var(--muted)]">OWL 1000 · Start creating today.</footer>
    </main>
  );
}
