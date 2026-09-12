import Link from "next/link";

export function BrandLogo({ href = "/dashboard" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 font-black tracking-[-0.03em]" aria-label="Owl 1000 홈">
      <span className="grid size-9 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)]" aria-hidden="true">
        <svg viewBox="0 0 40 40" className="size-6" fill="none">
          <path d="M9 14 13 7l7 5 7-5 4 7v11c0 6-5 10-11 10S9 31 9 25V14Z" fill="#425f4b"/>
          <circle cx="15.5" cy="20" r="3.5" fill="#fffdf8"/><circle cx="24.5" cy="20" r="3.5" fill="#fffdf8"/>
          <circle cx="15.5" cy="20" r="1.4" fill="#252824"/><circle cx="24.5" cy="20" r="1.4" fill="#252824"/>
          <path d="m20 23-2.3 2.5h4.6L20 23Z" fill="#d69a4b"/>
        </svg>
      </span>
      <span>OWL <span className="font-medium text-[var(--muted)]">1000</span></span>
    </Link>
  );
}
