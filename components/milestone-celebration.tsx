"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BADGE_ASSETS, OWL_ASSETS } from "@/lib/owl-assets";
import { CREATOR_LEVELS, type Milestone } from "@/lib/growth";

const LEVEL_BY_MILESTONE: Record<Milestone, number> = {
  100: 1,
  300: 2,
  600: 3,
  900: 4,
  1000: 4,
};

export function MilestoneCelebration({ milestone, userId }: { milestone: Milestone; userId: string }) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("milestone")) return;
    url.searchParams.delete("milestone");
    const query = url.searchParams.toString();
    window.history.replaceState({}, "", `${url.pathname}${query ? `?${query}` : ""}${url.hash}`);
  }, []);

  if (!open) return null;

  const levelIndex = LEVEL_BY_MILESTONE[milestone];
  const level = CREATOR_LEVELS[levelIndex];
  const completed = milestone === 1000;

  return (
    <aside
      className="milestone-celebration fixed inset-x-4 bottom-4 z-50 mx-auto w-[min(42rem,calc(100%-2rem))] overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[rgba(255,253,248,.96)] p-4 shadow-2xl backdrop-blur-xl sm:p-5"
      role="status"
      aria-live="polite"
      aria-label={`${milestone}일 마일스톤 달성`}
    >
      <div className="milestone-sparkles" aria-hidden="true">
        <span>✦</span><span>✿</span><span>✦</span><span>❋</span><span>✦</span>
      </div>
      <div className="relative flex items-center gap-4 sm:gap-5">
        <div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-[1.4rem] bg-[var(--surface-2)] sm:size-24">
          <img src={OWL_ASSETS.thumbs[levelIndex]} alt="" className="h-[92%] w-[92%] object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="eyebrow">Milestone unlocked</p>
          <h2 className="mt-1 text-xl font-black tracking-[-.035em] sm:text-2xl">
            {completed ? "OWL1000 완주!" : `${milestone}일 배지를 획득했습니다.`}
          </h2>
          <p className="copy-pretty mt-1 text-sm font-bold leading-6 text-[var(--muted)]">
            {completed
              ? "1000일의 기록이 완성되었습니다. 획득한 모든 배지와 여정은 영구적으로 남습니다."
              : `이제 Lv.${level.level} ${level.label}입니다. 레벨과 배지는 실패해도 내려가지 않습니다.`}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <img src={BADGE_ASSETS[milestone]} alt={`${milestone}일 배지`} className="size-10 object-contain" />
            {completed && <Link className="secondary-button !min-h-0 !px-3 !py-2 text-xs" href={`/complete/${userId}`}>완주 기록 보기</Link>}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="self-start rounded-full border border-[var(--line)] bg-white/70 px-3 py-2 text-xs font-black text-[var(--muted)]"
          aria-label="마일스톤 축하 알림 닫기"
        >
          닫기
        </button>
      </div>
    </aside>
  );
}
