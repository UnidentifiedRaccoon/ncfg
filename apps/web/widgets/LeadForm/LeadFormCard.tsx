import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

interface LeadFormCardProps {
  children: ReactNode;
  className?: string;
}

export function LeadFormCard({ children, className }: LeadFormCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[#E2E8F0]/80 bg-white",
        "shadow-[0_18px_56px_rgba(15,23,42,0.08)]",
        className
      )}
    >
      {/* Premium top accent line */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#58A8E0] via-[#3B82F6] to-transparent"
      />
      <div className="relative p-5 md:p-6">{children}</div>
    </div>
  );
}

