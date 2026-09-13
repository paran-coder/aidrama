"use client";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-5 py-12">
      <div className="card w-full rounded-[2rem] p-7 text-center sm:p-9">
        <p className="eyebrow">Temporary connection issue</p>
        <h1 className="mt-3 text-3xl font-black tracking-[-.04em]">잠시 연결이 불안정합니다.</h1>
        <p className="mt-3 text-sm font-bold leading-6 text-[var(--muted)]">현재 화면을 다시 불러오면 대부분 바로 이어서 사용할 수 있습니다. 입력한 계정이나 챌린지 기록이 삭제된 것은 아닙니다.</p>
        <button type="button" className="primary-button mt-6" onClick={() => reset()}>다시 불러오기</button>
      </div>
    </main>
  );
}
