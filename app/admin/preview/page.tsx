import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { MilestoneBadges } from "@/components/milestone-badges";
import { OwlVisual } from "@/components/owl-visual";
import { ProgressBar } from "@/components/progress-bar";
import { requireAdmin } from "@/lib/auth";

export default async function AdminPreviewPage() {
  const { profile } = await requireAdmin();
  const sampleBadges = [{ milestone_days: 100 as const, awarded_at: new Date().toISOString() }];
  return (
    <AppShell displayName={profile.display_name} isAdmin>
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="eyebrow">Read-only preview</p><h1 className="mt-3 text-4xl font-black tracking-[-.05em]">사용자 화면 미리보기</h1><p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-[var(--muted)]">관리자 계정에 실제 챌린지를 만들지 않고 v1.2.0의 성장 화면을 확인합니다. 제출이나 실제 상태 변경은 일어나지 않습니다.</p></div>
          <Link className="secondary-button" href="/admin">운영 관리로 돌아가기</Link>
        </div>
        <div className="mt-8 grid gap-7 lg:grid-cols-[1.05fr_.95fr] lg:items-stretch">
          <section className="soft-shadow rounded-[2.6rem] p-3"><OwlVisual stage={1} /></section>
          <section className="flex flex-col justify-center rounded-[2.4rem] border border-[var(--line)] bg-[rgba(255,253,248,.72)] p-6 sm:p-8">
            <p className="eyebrow">Preview challenge</p>
            <div className="mt-5 flex items-end justify-between gap-4"><div><p className="text-sm font-black text-[var(--muted)]">현재 목표</p><p className="display-number mt-1 text-6xl">300<span className="ml-1 font-sans text-lg font-black tracking-normal">일</span></p></div><div className="text-right"><p className="text-xs font-black text-[var(--muted)]">Lv.2</p><p className="mt-1 font-black text-[var(--accent)]">루틴 크리에이터</p></div></div>
            <div className="mt-7"><ProgressBar value={80} label="240 / 300일" /></div>
            <div className="mt-6 grid grid-cols-2 gap-4"><div className="rounded-2xl bg-[var(--surface-2)] p-4"><p className="display-number text-4xl">12</p><p className="mt-1 text-xs font-black text-[var(--muted)]">현재 스트릭</p></div><div className="rounded-2xl bg-[var(--surface-2)] p-4"><p className="display-number text-4xl">240</p><p className="mt-1 text-xs font-black text-[var(--muted)]">전체 경과일</p></div></div>
          </section>
        </div>
        <section className="card mt-6 rounded-[2rem] p-6"><p className="eyebrow">Milestones</p><h2 className="mt-2 text-xl font-black">배지 미리보기</h2><div className="mt-5"><MilestoneBadges badges={sampleBadges} /></div></section>
      </div>
    </AppShell>
  );
}
