"use client";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-5 py-12">
      <div className="card w-full rounded-[2rem] p-7 text-center sm:p-9">
        <p className="eyebrow">Admin connection issue</p>
        <h1 className="heading-balance mt-3 text-3xl font-black tracking-[-.04em]">운영 정보를 불러오지 못했습니다.</h1>
        <p className="copy-pretty mt-3 text-sm font-bold leading-6 text-[var(--muted)]">관리자 세션을 종료하지 않고 다시 조회합니다. 반복되면 운영 데이터 중 일부 조회가 일시적으로 실패한 상태일 수 있습니다.</p>
        <button type="button" className="primary-button mt-6" onClick={() => reset()}>운영 관리 다시 시도</button>
      </div>
    </main>
  );
}
