export function StatusBadge({ status }: { status: "verified" | "unverified" | "success" | "failure" }) {
  const map = {
    verified: ["검증됨", "text-[var(--success)] bg-emerald-50 border-emerald-200"],
    unverified: ["미검증", "text-[var(--warning)] bg-amber-50 border-amber-200"],
    success: ["성공", "text-[var(--success)] bg-emerald-50 border-emerald-200"],
    failure: ["미제출", "text-[var(--danger)] bg-red-50 border-red-200"],
  } as const;
  const [label, classes] = map[status];
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${classes}`}>{label}</span>;
}
