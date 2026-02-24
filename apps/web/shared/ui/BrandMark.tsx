import { cn } from "@/shared/lib/cn";

interface BrandMarkProps {
  className?: string;
  compact?: boolean;
}

export function BrandMark({ className, compact = false }: BrandMarkProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden rounded-xl",
          "bg-gradient-to-br from-[#4FC3F7] via-[#3B82F6] to-[#7C3AED]",
          "shadow-[0_12px_28px_rgba(59,130,246,0.35)]",
          compact ? "h-9 w-9 text-sm" : "h-10 w-10 text-base"
        )}
      >
        <span className="font-extrabold text-white">Н</span>
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.55),transparent_45%)]" />
      </span>
      <span
        className={cn(
          "font-black tracking-[0.16em] leading-none",
          compact ? "text-lg" : "text-xl"
        )}
      >
        НЦФГ
      </span>
    </div>
  );
}
