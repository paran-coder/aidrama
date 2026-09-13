"use client";

import { useFormStatus } from "react-dom";

export function PendingSubmitButton({
  children,
  pendingLabel = "처리 중...",
  className = "primary-button",
  disabled = false,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button className={className} type="submit" disabled={pending || disabled} aria-disabled={pending || disabled}>
      {pending ? pendingLabel : children}
    </button>
  );
}
