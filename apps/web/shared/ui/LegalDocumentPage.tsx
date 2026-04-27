import { cn } from "@/shared/lib/cn";
import { Container } from "./Container";

interface LegalDocumentPageProps {
  title: string;
  city: string;
  dateLabel: string;
  dateTime: string;
  html: string;
  contentClassName: string;
}

export function LegalDocumentPage({
  title,
  city,
  dateLabel,
  dateTime,
  html,
  contentClassName,
}: LegalDocumentPageProps) {
  return (
    <main className="bg-[radial-gradient(circle_at_top_left,#EFF6FF_0%,#F8FAFC_42%,#FFFFFF_72%)] pb-10 md:pb-14">
      <section data-scroll-reveal="" className="pt-10 md:pt-14">
        <Container>
          <div className="relative overflow-hidden rounded-3xl border border-[#D6E5FA] bg-white/95 px-6 py-8 shadow-[0_26px_70px_rgba(30,58,95,0.11)] md:px-10 md:py-11">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#BFDBFE]/45 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-[#E0F2FE]/60 blur-3xl"
            />

            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#3B82F6]">
                Документ
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#1E3A5F] sm:text-4xl md:text-5xl">
                {title}
              </h1>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-[#64748B]">
                <span>{city}</span>
                <time dateTime={dateTime}>{dateLabel}</time>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section data-scroll-reveal="" className="pt-6 md:pt-8">
        <Container>
          <article className="rounded-3xl border border-[#E2E8F0] bg-white px-5 py-6 shadow-[0_18px_44px_rgba(15,23,42,0.08)] md:px-10 md:py-9">
            <div
              className={cn("post-content max-w-none", contentClassName)}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </article>
        </Container>
      </section>
    </main>
  );
}
