"use client";

import { CheckCircle, ShieldCheck } from "lucide-react";
import { Section } from "@/shared/ui/Section";
import { Button } from "@/shared/ui/Button";
import { LeadFormCard } from "./LeadFormCard";
import { leadBadgeClassName, TRUST_CHIPS } from "./constants";

interface LeadFormSuccessProps {
  onReset: () => void;
}

export function LeadFormSuccess({ onReset }: LeadFormSuccessProps) {
  return (
    <Section id="lead-form" background="gray" className="relative overflow-hidden">
      {/* Background atmosphere (subtle) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,rgba(30,58,95,0.20)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,58,95,0.20)_1px,transparent_1px)] bg-[size:56px_56px]" />
        <div className="absolute -top-44 -left-44 h-[520px] w-[520px] rounded-full bg-[#3B82F6]/16 blur-3xl" />
        <div className="absolute -bottom-56 left-1/3 h-[640px] w-[640px] rounded-full bg-[#58A8E0]/14 blur-3xl" />
        <div className="absolute -top-52 -right-52 h-[560px] w-[560px] rounded-full bg-[#1E3A5F]/10 blur-3xl" />
      </div>

      <div className="relative z-10 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="max-w-xl">
          <div className={leadBadgeClassName}>
            <span className="h-1.5 w-1.5 rounded-full bg-[#58A8E0]" />
            Заявка принята. Ответим быстро
          </div>

          <h2 className="mt-5 text-3xl md:text-4xl lg:text-[42px] font-bold tracking-tight text-[#1E3A5F] leading-tight">
            Заявка отправлена
          </h2>
          <p className="mt-4 text-lg md:text-xl text-[#475569] leading-relaxed">
            Спасибо за обращение. Мы свяжемся с вами в ближайшее время и уточним
            детали.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-2 text-xs text-[#475569]">
            <ShieldCheck className="h-4 w-4 text-[#3B82F6]" aria-hidden="true" />
            <span className="font-semibold text-[#1E3A5F]">Нам доверяют:</span>
            {TRUST_CHIPS.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-[#E2E8F0] bg-white/70 px-2.5 py-1"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        <LeadFormCard>
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-6 w-6 text-[#10B981]" />
            <div>
              <div className="text-lg font-semibold text-[#1E3A5F]">
                Отлично. Мы на связи
              </div>
              <div className="mt-1 text-sm text-[#475569] leading-relaxed">
                Если хотите, можете отправить ещё одну заявку.
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button type="button" className="w-full sm:w-auto" onClick={onReset}>
              Отправить ещё
            </Button>
          </div>
        </LeadFormCard>
      </div>
    </Section>
  );
}

