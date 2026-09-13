import { CREATOR_LEVELS } from "@/lib/growth";
import { OWL_ASSETS } from "@/lib/owl-assets";

export function OwlVisual({
  stage,
  compact = false,
  hero = false,
}: {
  stage: number;
  compact?: boolean;
  hero?: boolean;
}) {
  const safeStage = Math.max(0, Math.min(stage, CREATOR_LEVELS.length - 1));
  const level = CREATOR_LEVELS[safeStage];
  const src = hero ? OWL_ASSETS.hero : compact ? OWL_ASSETS.thumbs[safeStage] : OWL_ASSETS.stages[safeStage];

  if (compact) {
    return (
      <div className="relative grid size-28 shrink-0 place-items-center overflow-hidden rounded-[1.65rem] border border-[var(--line)] bg-[var(--surface)]">
        <div className="absolute inset-0 grid-paper opacity-30" />
        <img
          src={src}
          alt={`Lv.${level.level} ${level.label} 부엉이`}
          className="relative h-[92%] w-[92%] object-contain"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className={`relative grid h-full w-full place-items-center overflow-hidden rounded-[2.2rem] border border-[var(--line)] bg-[var(--surface)] ${hero ? "min-h-[440px] lg:min-h-[500px]" : "min-h-[380px]"}`}>
      <div className="absolute inset-0 grid-paper opacity-28" />
      <div className="absolute bottom-10 h-8 w-1/2 rounded-[100%] bg-black/5 blur-xl" />
      <img
        src={src}
        alt={`${hero ? "OWL1000 대표" : `Lv.${level.level} ${level.label}`} 부엉이`}
        className={`relative object-contain ${hero ? "max-h-[455px] w-auto max-w-[90%] lg:max-h-[510px]" : "max-h-[430px] w-auto max-w-[88%]"}`}
      />
      {!hero && (
        <div className="absolute bottom-5 rounded-full border border-[var(--line)] bg-[rgba(255,253,248,.92)] px-4 py-2 text-xs font-black text-[var(--muted)] backdrop-blur-sm">
          Lv.{level.level} · {level.label}
        </div>
      )}
    </div>
  );
}
