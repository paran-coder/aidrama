import { OWL_STAGES } from "@/lib/challenge";

const palettes = [
  ["#d8d1c6", "#b7aa98"], ["#c7c4af", "#92967d"], ["#b9bea4", "#78886d"], ["#a9b99b", "#627c61"],
  ["#95ae88", "#4f7357"], ["#85a578", "#3f684d"], ["#759b6b", "#315d45"], ["#628f5c", "#244f3a"],
] as const;

export function OwlVisual({ stage, compact = false }: { stage: number; compact?: boolean }) {
  const safeStage = Math.max(0, Math.min(stage, OWL_STAGES.length - 1));
  const [light, dark] = palettes[safeStage];
  const label = OWL_STAGES[safeStage].label;
  const isEgg = safeStage === 0;

  return (
    <div className={`relative grid place-items-center overflow-hidden rounded-[2.2rem] border border-[var(--line)] bg-[var(--surface)] ${compact ? "h-28 w-28" : "min-h-[330px] w-full"}`}>
      <div className="absolute inset-0 grid-paper opacity-70" />
      <div className="absolute bottom-8 h-12 w-2/3 rounded-[100%] bg-black/5 blur-xl" />
      {isEgg ? (
        <svg role="img" aria-label={`부엉이 성장 단계: ${label}`} viewBox="0 0 240 240" className={compact ? "relative size-20" : "relative size-56"}>
          <defs><linearGradient id="egg" x1="0" y1="0" x2="1" y2="1"><stop stopColor={light}/><stop offset="1" stopColor={dark}/></linearGradient></defs>
          <ellipse cx="120" cy="128" rx="67" ry="83" fill="url(#egg)"/>
          <path d="M82 104c12-13 27-19 38-20M158 104c-12-13-27-19-38-20" stroke="#fffdf8" strokeWidth="8" strokeLinecap="round" opacity=".75"/>
          <path d="m111 126 9 9 10-9" stroke="#fffdf8" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".8"/>
        </svg>
      ) : (
        <svg role="img" aria-label={`부엉이 성장 단계: ${label}`} viewBox="0 0 260 260" className={compact ? "relative size-24" : "relative size-60"}>
          <defs><linearGradient id={`body-${safeStage}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={light}/><stop offset="1" stopColor={dark}/></linearGradient></defs>
          <path d="m71 83 19-41 40 28 40-28 19 41v77c0 50-28 76-59 76s-59-26-59-76V83Z" fill={`url(#body-${safeStage})`}/>
          <path d="M95 106c12-17 30-24 35-24s23 7 35 24" stroke="#f6f0e4" strokeWidth="17" strokeLinecap="round" opacity=".9"/>
          <circle cx="105" cy="112" r="20" fill="#fffdf8"/><circle cx="155" cy="112" r="20" fill="#fffdf8"/>
          <circle cx="105" cy="112" r="7" fill="#252824"/><circle cx="155" cy="112" r="7" fill="#252824"/>
          <path d="m130 130-12 13h24l-12-13Z" fill="#d69a4b"/>
          <path d="M99 167c16 17 46 17 62 0" stroke="#f6f0e4" strokeWidth="7" strokeLinecap="round" opacity=".55"/>
          {safeStage >= 4 && <path d="M87 173 60 200M173 173l27 27" stroke={dark} strokeWidth="10" strokeLinecap="round"/>}
          {safeStage >= 6 && <path d="M91 60c19-14 59-14 78 0" stroke="#d9b36c" strokeWidth="8" strokeLinecap="round"/>}
        </svg>
      )}
      {!compact && (
        <div className="absolute bottom-5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-bold text-[var(--muted)]">
          {safeStage + 1}단계 · {label}
        </div>
      )}
    </div>
  );
}
