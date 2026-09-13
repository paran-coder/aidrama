"use client";

import { useState } from "react";
import { deleteMyAccountAction } from "@/lib/actions/profile";
import { PendingSubmitButton } from "@/components/pending-submit-button";

export function AccountDeletionPanel() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const canDelete = confirmation.trim() === "탈퇴";

  return (
    <section className="mt-4 rounded-[2rem] border border-[var(--danger-line)] bg-[var(--danger-bg)] p-6">
      <p className="eyebrow !text-[var(--danger)]">Danger zone</p>
      <h2 className="mt-2 text-xl font-black">회원 탈퇴</h2>
      <p className="copy-pretty mt-3 text-sm font-bold leading-6 text-[var(--danger)]">
        탈퇴하면 계정과 개인 활동 기록이 영구적으로 삭제되며 복구할 수 없습니다.
      </p>
      <button type="button" className="secondary-button mt-5 border-[var(--danger-line)] text-[var(--danger)]" onClick={() => setOpen(true)}>
        회원 탈퇴 안내 보기
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="delete-account-title" className="w-full max-w-lg rounded-[2rem] border border-[var(--danger-line)] bg-[var(--surface)] p-6 shadow-2xl sm:p-7">
            <p className="eyebrow !text-[var(--danger)]">Permanent deletion</p>
            <h3 id="delete-account-title" className="mt-2 text-2xl font-black">정말 탈퇴하시겠습니까?</h3>
            <div className="ui-danger copy-pretty mt-5 rounded-2xl border p-4 text-sm font-bold leading-6">
              <p>탈퇴하면 아래 정보가 영구 삭제됩니다.</p>
              <ul className="mt-2 space-y-1">
                <li>· 로그인 계정, 이메일, 표시 이름</li>
                <li>· 챌린지 진행 상태와 스트릭</li>
                <li>· 제출 URL과 주간 판정 이력</li>
                <li>· 획득한 마일스톤 배지</li>
              </ul>
              <p className="mt-3">사용했던 초대 코드는 다시 사용할 수 없으며, 개인 정보 없이 ‘탈퇴한 사용자’의 사용 이력만 남습니다.</p>
              <p className="mt-3 font-black">삭제 후에는 복구할 수 없습니다.</p>
            </div>

            <form action={deleteMyAccountAction} className="mt-5">
              <label className="block text-sm font-black">
                계속하려면 아래 입력란에 <span className="text-[var(--danger)]">탈퇴</span>라고 입력하세요.
                <input
                  className="input-field mt-2"
                  name="confirmText"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  autoComplete="off"
                  placeholder="탈퇴"
                />
              </label>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button type="button" className="secondary-button w-full" onClick={() => { setOpen(false); setConfirmation(""); }}>취소</button>
                <PendingSubmitButton
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--danger-line)] bg-[var(--danger)] px-5 font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
                  pendingLabel="계정 삭제 중..."
                  disabled={!canDelete}
                >
                  영구 삭제하고 탈퇴
                </PendingSubmitButton>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
