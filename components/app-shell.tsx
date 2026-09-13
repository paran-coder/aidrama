import { AppNav } from "@/components/app-nav";
import { BrandLogo } from "@/components/brand-logo";
import { logoutAction } from "@/lib/actions/auth";

export function AppShell({ children, displayName, isAdmin = false }: { children: React.ReactNode; displayName: string; isAdmin?: boolean }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(244,240,232,.88)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <BrandLogo />
          <AppNav isAdmin={isAdmin} />
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-bold text-[var(--muted)] sm:block">{displayName}</span>
            <form action={logoutAction}><button className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-bold">로그아웃</button></form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 pb-28 sm:px-6 sm:py-10 md:pb-12">{children}</main>
    </div>
  );
}
