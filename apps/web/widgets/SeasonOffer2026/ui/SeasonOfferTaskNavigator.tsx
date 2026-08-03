import {
  BriefcaseBusiness,
  CalendarRange,
  Landmark,
  PiggyBank,
  ShieldAlert,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/shared/ui/Button";
import { Section } from "@/shared/ui/Section";

import type {
  SeasonOfferTaskIcon,
  SeasonOfferTaskNavigatorContent,
} from "../model/types";

const taskIcons: Record<SeasonOfferTaskIcon, LucideIcon> = {
  foundation: PiggyBank,
  pressure: ShieldAlert,
  market: Landmark,
  hr: BriefcaseBusiness,
  family: UsersRound,
  annual: CalendarRange,
};

export function SeasonOfferTaskNavigator({
  title,
  lead,
  tasks,
}: SeasonOfferTaskNavigatorContent) {
  return (
    <Section id="season-offer-tasks" title={title} lead={lead}>
      <ol className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {tasks.map((task, index) => {
          const Icon = taskIcons[task.icon];

          return (
            <li
              key={task.id}
              className="group relative flex min-h-full flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-[#3B82F6]/35 hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none md:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#3B82F6]/10 text-[#3B82F6]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="font-mono text-xs font-semibold tracking-[0.16em] text-[#64748B]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold leading-snug text-[#1E3A5F] md:text-xl">
                {task.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[#475569] md:text-base">
                {task.description}
              </p>

              <Button
                href={task.program.href}
                variant="ghost"
                className="mt-5 min-h-11 w-full justify-start border border-[#E2E8F0] px-4 text-left !text-[#2563EB] group-hover:border-[#3B82F6]/25 sm:w-auto"
                aria-label={`${task.program.label}: перейти к описанию программы`}
              >
                {task.program.label}
              </Button>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
