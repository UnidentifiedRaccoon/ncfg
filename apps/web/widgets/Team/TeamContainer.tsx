"use client";

import { useReducedMotion } from "framer-motion";
import { Container } from "@/shared/ui/Container";
import { splitTeamMembers } from "./team-utils";
import { TeamList } from "./TeamList";
import type { TeamProps } from "./types";

export function TeamContainer({ title, members }: TeamProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = prefersReducedMotion ?? false;
  const { featured, rest } = splitTeamMembers(members);

  return (
    <section id="team" className="py-12 md:py-16">
      <Container>
        <div className="mb-10 md:mb-12 text-center max-w-3xl mx-auto">
          <h2 className="text-[28px] md:text-4xl lg:text-[48px] font-bold text-[#1E3A5F] leading-tight tracking-tight">
            {title}
          </h2>
        </div>
      </Container>

      <TeamList
        featured={featured}
        regular={rest}
        prefersReducedMotion={shouldReduceMotion}
      />
    </section>
  );
}

