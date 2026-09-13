export function StatusBadge({ status }: { status: "verified" | "unverified" | "success" | "failure" }) {
  const map = {
    verified: ["검증됨", "ui-success"],
    unverified: ["미검증", "ui-warning"],
    success: ["성공", "ui-success"],
    failure: ["미제출", "ui-danger"],
  } as const;
  const [label, classes] = map[status];
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${classes}`}>{label}</span>;
}
