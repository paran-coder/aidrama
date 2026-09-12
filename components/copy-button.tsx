"use client";

import { useState } from "react";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return <button className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-bold" onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1400); }} type="button">{copied ? "복사됨" : "복사"}</button>;
}
