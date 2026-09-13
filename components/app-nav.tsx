"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  external?: boolean;
};

const USER_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "내 챌린지" },
  { href: "/dashboard/submit", label: "이번 주 제출" },
  { href: "/community", label: "전체 현황" },
  { href: "/mypage", label: "마이페이지" },
];

const ADMIN_ITEMS: NavItem[] = [
  { href: "/admin", label: "운영 관리" },
  { href: "/admin/preview", label: "사용자 화면 미리보기", external: true },
  { href: "/mypage", label: "계정 설정" },
];

function isCurrentPath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname.startsWith("/dashboard/history");
  }
  if (href === "/dashboard/submit") return pathname.startsWith("/dashboard/submit");
  if (href === "/community") return pathname === "/community" || pathname.startsWith("/community/");
  if (href === "/admin") return pathname === "/admin" || pathname.startsWith("/admin/participants/");
  if (href === "/admin/preview") return pathname.startsWith("/admin/preview");
  return pathname === href || pathname.startsWith(`${href}/`);
}

function DesktopLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isCurrentPath(pathname, item.href);
  return (
    <Link
      href={item.href}
      className={`nav-link ${active ? "nav-link-active" : ""}`}
      aria-current={active ? "page" : undefined}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noreferrer" : undefined}
    >
      {item.label}
    </Link>
  );
}

function MobileLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isCurrentPath(pathname, item.href);
  return (
    <Link
      href={item.href}
      className={`mobile-nav-link ${active ? "mobile-nav-link-active" : ""}`}
      aria-current={active ? "page" : undefined}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noreferrer" : undefined}
    >
      {item.label === "사용자 화면 미리보기" ? "미리보기" : item.label}
    </Link>
  );
}

export function AppNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const items = isAdmin ? ADMIN_ITEMS : USER_ITEMS;

  return (
    <>
      <nav aria-label="주요 메뉴" className="hidden items-center gap-1 md:flex">
        {items.map((item) => <DesktopLink key={item.href} item={item} pathname={pathname} />)}
      </nav>
      <nav
        aria-label="모바일 메뉴"
        className={`fixed inset-x-0 bottom-0 z-40 grid ${isAdmin ? "grid-cols-3" : "grid-cols-4"} border-t border-[var(--line)] bg-[rgba(255,253,248,.96)] p-2 backdrop-blur-xl md:hidden`}
      >
        {items.map((item) => <MobileLink key={item.href} item={item} pathname={pathname} />)}
      </nav>
    </>
  );
}
