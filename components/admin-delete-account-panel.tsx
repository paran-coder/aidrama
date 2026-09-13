"use client";

import { useState } from "react";
import { deleteParticipantAccountAction } from "@/lib/actions/admin-account-deletion";
import { PendingSubmitButton } from "@/components/pending-submit-button";

export function AdminDeleteAccountPanel({
  userId,
  displayName,
}: {
  userId: string;
  displayName: string;
}) {
  const [confirmation, setConfirmation] = useState("");
  const canDelete = confirmation.trim() === displayName;

  return (
    <div className="mt-6 rounded-[1.6rem] border border-[var(--danger-line)] bg-[var(--danger-bg)] p-5">
      <p className="eyebrow !text-[var(--danger)]">Permanent deletion</p>
      <h3 className="mt-2 text-lg font-black">계정 영구 삭제</h3>
      <p className="copy-pretty mt-2 text-sm font-bold leading-6 text-[var(--danger)]">
        이 작업은 되돌릴 수 없습니다. 로그인 계정과 프로필, 챌린지, 제출 기록, 주간 결과, 배지가 영구 삭제됩니다.
      </p>
      <form action={deleteParticipantAccountAction} className="mt-4">
        <input type="hidden" name="targetUserId" value={userId} />
        <label className="block text-sm font-black">
          계정을 삭제하려면 아래 입력란에 톡방 닉네임 <span className="text-[var(--danger)]">{displayName}</span>을 정확히 입력하세요.
          <input
            className="input-field mt-2"
            name="confirmDisplayName"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
            placeholder={displayName}
          />
        </label>
        <div className="mt-4">
          <PendingSubmitButton
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--danger-line)] bg-[var(--danger)] px-5 font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
            pendingLabel="계정 삭제 중..."
            disabled={!canDelete}
          >
            계정 영구 삭제
          </PendingSubmitButton>
        </div>
      </form>
    </div>
  );
}
