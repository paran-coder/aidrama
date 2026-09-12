import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { OwlVisual } from "@/components/owl-visual";
import { getUser } from "@/lib/auth";

export default async function LandingPage() {
  const user = await getUser();
  if (user) redirect("/dashboard");
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between"><BrandLogo href="/"/><Link href="/login" className="secondary-button !min-h-0 !px-4 !py-2 text-sm">로그인</Link></header>
      <section className="grid min-h-[78vh] items-center gap-10 py-16 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <p className="eyebrow">Invitation-only · 1000 day practice</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[.98] tracking-[-0.065em] sm:text-7xl">매주 한 편.<br/>1000일이면<br/><span className="text-[var(--accent)]">다른 사람이 됩니다.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--muted)]">AI드라마 크리에이터가 작업을 멈추지 않도록, 한 마리의 부엉이와 함께 매주 업로드를 이어가는 장기 챌린지입니다.</p>
          <div className="mt-9 flex flex-wrap gap-3"><Link href="/signup" className="primary-button">초대 코드로 참여하기</Link><a href="#rules" className="secondary-button">규칙 보기</a></div>
        </div>
        <div className="soft-shadow rounded-[2.6rem] p-3"><OwlVisual stage={4}/></div>
      </section>
      <section id="rules" className="grid gap-4 border-t border-[var(--line)] py-16 md:grid-cols-3">
        {[['01','매주 한 편','월요일부터 일요일 23:59까지 SNS 업로드 링크를 제출합니다.'],['02','실패도 기록','1회 하락, 2회 경고, 3회 알 리셋. 하지만 1000일의 시간은 지워지지 않습니다.'],['03','다음 성공으로 회복','페널티 상태에서도 한 번 다시 성공하면 현재 경과일에 맞는 성장으로 복귀합니다.']].map(([n,t,d]) => <article key={n} className="card rounded-[1.6rem] p-6"><span className="display-number text-3xl text-[var(--accent)]">{n}</span><h2 className="mt-6 text-xl font-black">{t}</h2><p className="mt-2 leading-7 text-[var(--muted)]">{d}</p></article>)}
      </section>
      <footer className="border-t border-[var(--line)] py-8 text-sm text-[var(--muted)]">OWL 1000 · AI Drama Challenge</footer>
    </main>
  );
}
