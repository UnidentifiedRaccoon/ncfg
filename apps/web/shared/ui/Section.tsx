import { cn } from "@/shared/lib/cn";
import { Container } from "./Container";
import { type ReactNode } from "react";
import { ScrollReveal } from "./ScrollReveal";

interface SectionProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  contentClassName?: string;
  title?: string;
  lead?: ReactNode;
  id?: string;
  background?: "white" | "gray";
  panel?: boolean;
  /** Add top divider line (use when adjacent section has same background) */
  dividerTop?: boolean;
}

export function Section({
  children,
  className,
  containerClassName,
  contentClassName,
  title,
  lead,
  id,
  background = "white",
  panel = false,
  dividerTop = false,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-14 md:py-20",
        background === "gray" && "bg-transparent",
        "relative",
        className
      )}
    >
      <Container className={containerClassName}>
        {dividerTop && (
          <div className="mb-12 md:mb-16" />
        )}
        {(title || lead) && (
          <ScrollReveal className="mb-10 md:mb-14 text-center max-w-3xl mx-auto">
            {title && (
              <h2 className="neo-title text-[30px] md:text-5xl lg:text-[56px] font-extrabold leading-[1.04]">
                {title}
              </h2>
            )}
            {lead && (
              <p className="neo-subtitle mt-5 text-lg md:text-[22px] leading-relaxed">
                {lead}
              </p>
            )}
          </ScrollReveal>
        )}
        <ScrollReveal delay={0.08}>
          <div
            className={cn(
              panel
                ? "neo-panel relative overflow-hidden p-5 md:p-8 lg:p-10"
                : "relative",
              contentClassName
            )}
          >
            {children}
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
