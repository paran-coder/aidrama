"use client";

import { useEffect, useRef, useState } from "react";

export function WarningDialog({ failures }: { failures: number }) {
  const [open, setOpen] = useState(true);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open) return null;
  const restart = failures >= 3;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/25 p-4 backdrop-blur-sm" role="presentation">
      <section role="alertdialog" aria-modal="true" aria-labelledby="warning-title" aria-describedby="warning-copy" className="w-full max-w-md rounded-[2rem] border border-amber-200 bg-[#fffaf0] p-6 shadow-2xl">
        <div className="mb-4 grid size-11 place-items-center rounded-full bg-amber-100 text-xl" aria-hidden="true">!</div>
        <p className="eyebrow">챌린지 상태</p>
        <h2 id="warning-title" className="mt-2 text-2xl font-black tracking-[-0.04em]">
          {restart ? "지금부터 다시 1주를 시작하세요" : "두 주 연속 제출이 비어 있습니다"}
        </h2>
        <p id="warning-copy" className="mt-3 leading-7 text-[var(--muted)]">
          {restart
            ? "레벨과 획득한 배지는 그대로 유지됩니다. 다음 한 번의 성공부터 새로운 스트릭을 다시 쌓을 수 있습니다."
            : "레벨과 배지는 내려가지 않습니다. 이번 주 한 번의 성공으로 스트릭을 다시 이어가세요."}
        </p>
        <button ref={closeRef} onClick={() => setOpen(false)} className="primary-button mt-6 w-full">확인하고 계속하기</button>
      </section>
    </div>
  );
}
