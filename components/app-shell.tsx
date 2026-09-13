import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { logoutAction } from "@/lib/actions/auth";

export function AppShell({ children, displayName, isAdmin = false }: { children: React.ReactNode; displayName: string; isAdmin?: boolean }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(244,240,232,.88)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <BrandLogo />
          <nav aria-label="주요 메뉴" className="hidden items-center gap-1 md:flex">
            {isAdmin ? (
              <>
                <Link className="rounded-full px-4 py-2 text-sm font-bold hover:bg-white/60" href="/admin">운영 관리</Link>
                <Link className="rounded-full px-4 py-2 text-sm font-bold hover:bg-white/60" href="/admin/preview" target="_blank" rel="noreferrer">사용자 화면 미리보기</Link>
                <Link className="rounded-full px-4 py-2 text-sm font-bold hover:bg-white/60" href="/mypage">계정 설정</Link>
              </>
            ) : (
              <>
                <Link className="rounded-full px-4 py-2 text-sm font-bold hover:bg-white/60" href="/dashboard">내 챌린지</Link>
                <Link className="nav-submit-link px-4 py-2 text-sm" href="/dashboard/submit">이번 주 제출</Link>
                <Link className="rounded-full px-4 py-2 text-sm font-bold hover:bg-white/60" href="/community">전체 현황</Link>
                <Link className="rounded-full px-4 py-2 text-sm font-bold hover:bg-white/60" href="/mypage">마이페이지</Link>
              </>
            )}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-bold text-[var(--muted)] sm:block">{displayName}</span>
            <form action={logoutAction}><button className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-bold">로그아웃</button></form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 pb-28 sm:px-6 sm:py-10 md:pb-12">{children}</main>
      <nav aria-label="모바일 메뉴" className={`fixed inset-x-0 bottom-0 z-40 grid ${isAdmin ? "grid-cols-3" : "grid-cols-4"} border-t border-[var(--line)] bg-[rgba(255,253,248,.96)] p-2 backdrop-blur-xl md:hidden`}>
        {isAdmin ? (
          <>
            <Link href="/admin" className="rounded-xl px-2 py-3 text-center text-xs font-extrabold">운영 관리</Link>
            <Link href="/admin/preview" target="_blank" rel="noreferrer" className="rounded-xl px-2 py-3 text-center text-xs font-extrabold">미리보기</Link>
            <Link href="/mypage" className="rounded-xl px-2 py-3 text-center text-xs font-extrabold">계정 설정</Link>
          </>
        ) : (
          <>
            <Link href="/dashboard" className="rounded-xl px-1 py-3 text-center text-[11px] font-extrabold">내 챌린지</Link>
            <Link href="/dashboard/submit" className="nav-submit-link rounded-xl px-1 py-3 text-center text-[11px]">이번 주 제출</Link>
            <Link href="/community" className="rounded-xl px-1 py-3 text-center text-[11px] font-extrabold">전체 현황</Link>
            <Link href="/mypage" className="rounded-xl px-1 py-3 text-center text-[11px] font-extrabold">마이페이지</Link>
          </>
        )}
      </nav>
    </div>
  );
}
