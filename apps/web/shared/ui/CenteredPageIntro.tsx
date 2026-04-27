import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Container } from "./Container";

interface CenteredPageIntroProps {
  title: ReactNode;
  lead?: ReactNode;
  as?: "h1" | "h2";
  sectionClassName?: string;
  leadClassName?: string;
}

const titleClassName =
  "text-4xl font-bold tracking-tight text-[#1E3A5F] sm:text-5xl md:text-6xl lg:text-[72px] lg:leading-[1.0]";

const defaultLeadClassName =
  "mx-auto mt-5 max-w-4xl text-base leading-relaxed text-[#3F5C86] sm:text-lg md:text-xl lg:text-2xl lg:leading-[1.3]";

export function CenteredPageIntro({
  title,
  lead,
  as: TitleTag = "h1",
  sectionClassName,
  leadClassName,
}: CenteredPageIntroProps) {
  return (
    <section
      data-scroll-reveal=""
      className={cn("pt-10 md:pt-14", sectionClassName)}
    >
      <Container>
        <div className="flex min-h-[280px] flex-col gap-8 px-6 py-6 md:min-h-[360px] md:px-10 md:py-8">
          <div className="mx-auto my-auto w-full max-w-5xl text-center">
            <TitleTag className={titleClassName}>{title}</TitleTag>
            {lead ? (
              <p className={cn(defaultLeadClassName, leadClassName)}>{lead}</p>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
