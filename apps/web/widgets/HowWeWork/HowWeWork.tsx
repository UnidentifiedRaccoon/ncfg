import { Reveal } from "@/shared/ui/Reveal";
import { Section } from "@/shared/ui/Section";

interface Step {
  id: number;
  title: string;
  description?: string;
}
interface HowWeWorkProps {
  title: string;
  lead?: string;
  steps: Step[];
}
interface TimelineItemProps {
  step: Step;
  totalSteps: number;
  isLeft: boolean;
}
function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function Rail({
  align,
}: {
  align: "center" | "left";
}) {
  const alignClass =
    align === "center"
      ? "left-1/2 -translate-x-1/2"
      : "left-6 -translate-x-1/2";

  return (
    <div
      className={`absolute ${alignClass} top-0 bottom-0 z-0 w-[2px] rounded-full origin-top
                  bg-gradient-to-b from-[#58A8E0] via-[#3B82F6] to-[#1E3A5F]
                  shadow-[0_0_0_6px_rgba(88,168,224,0.06)]`}
      aria-hidden="true"
    />
  );
}
export function HowWeWork({ title, lead, steps }: HowWeWorkProps) {
  return (
    <Section
      id="how-we-work"
      title={title}
      lead={lead}
      className="overflow-x-clip bg-[radial-gradient(circle_at_24%_42%,rgba(88,168,224,0.10),transparent_52%),radial-gradient(circle_at_76%_58%,rgba(59,130,246,0.07),transparent_50%),linear-gradient(180deg,#FFFFFF_0%,#FFFFFF_14%,#F8FBFF_30%,#F4F9FF_70%,#FFFFFF_86%,#FFFFFF_100%)]"
    >
      <div className="relative">
        <div className="relative z-10">
          {/* Desktop rail (center) */}
          <div className="hidden md:block">
            <Rail align="center" />
          </div>

          {/* Mobile rail (left) */}
          <div className="md:hidden">
            <Rail align="left" />
          </div>

          {/* Steps as ordered list for accessibility */}
          <ol className="relative z-10 list-none space-y-8 m-0 p-0 md:space-y-0">
            {steps.map((step, index) => (
              <TimelineItem
                key={step.id}
                step={step}
                totalSteps={steps.length}
                isLeft={index % 2 === 0}
              />
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
function TimelineItem({
  step,
  totalSteps,
  isLeft,
}: TimelineItemProps) {
  const waveHeight = 180;
  const stepCode = pad2(step.id);

  return (
    <li
      className="relative"
      style={{
        // Desktop: position based on wave
        height: "auto",
      }}
    >
      <Reveal variant="card" from={isLeft ? "left" : "right"}>
        {/* Desktop layout */}
        <div
          className="hidden md:flex items-start"
          style={{
            minHeight: `${waveHeight}px`,
            paddingTop: "20px",
          }}
        >
          {/* Spacer for alternating layout */}
          <div className={`w-1/2 ${isLeft ? "order-2" : "order-1"}`} />

          {/* Card container */}
          <div className={`w-1/2 ${isLeft ? "order-1 pr-16" : "order-2 pl-16"}`}>
            <div
              className={`relative max-w-md rounded-xl bg-white/90 backdrop-blur-sm p-6
                          border shadow-sm shadow-[#0F172A]/5 transition-colors transition-shadow duration-300
                          hover:shadow-lg hover:shadow-[#0F172A]/10 hover:border-[#3B82F6]/30
                          before:absolute before:inset-x-6 before:top-0 before:h-px
                          before:bg-gradient-to-r before:from-transparent before:via-[#58A8E0]/70 before:to-transparent
                          after:pointer-events-none after:absolute after:inset-0 after:rounded-xl
                          after:bg-[linear-gradient(110deg,transparent,rgba(88,168,224,0.10),transparent)]
                          after:opacity-0 after:translate-x-[-20%] after:transition after:duration-700
                          hover:after:opacity-100 hover:after:translate-x-[20%]

                          border-[#E2E8F0]/70`}
              style={{
                marginLeft: isLeft ? "auto" : 0,
                marginRight: isLeft ? 0 : "auto",
              }}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-[#3B82F6]/10 px-3 py-1 text-xs font-mono font-semibold tracking-wide text-[#1E3A5F]">
                  {stepCode}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-[#E2E8F0] via-[#E2E8F0]/60 to-transparent" />
              </div>

              <h3 className="mt-3 text-lg font-semibold text-[#1E3A5F] leading-snug">
                <span className="sr-only">
                  Шаг {step.id} из {totalSteps}:{" "}
                </span>
                {step.title}
              </h3>
              {step.description && (
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                  {step.description}
                </p>
              )}
            </div>

            {/* Connector line from card to marker */}
            <div
              className={`absolute top-[56px] h-px w-14
                         ${isLeft ? "right-[calc(50%-60px)]" : "left-[calc(50%-60px)]"}`}
              style={{
                transformOrigin: isLeft ? "100% 50%" : "0% 50%",
                background: isLeft
                  ? "linear-gradient(to left, rgba(59,130,246,0.55), transparent)"
                  : "linear-gradient(to right, rgba(59,130,246,0.55), transparent)",
              }}
              aria-hidden="true"
            />
          </div>

          {/* Marker dot on the rail */}
          <div
            className="absolute left-1/2 -translate-x-1/2 z-10"
            style={{ top: "46px" }}
            aria-hidden="true"
          >
            <div className="h-3 w-3 rounded-full bg-gradient-to-br from-[#58A8E0] to-[#3B82F6] ring-4 ring-[#58A8E0]/15 shadow-[0_6px_18px_rgba(59,130,246,0.25)]" />
          </div>
        </div>

        {/* Mobile layout */}
        <div className="md:hidden relative pl-14">
          {/* Marker dot */}
          <div
            className="absolute left-6 -translate-x-1/2 z-10"
            style={{ top: "28px" }}
            aria-hidden="true"
          >
            <div className="h-3 w-3 rounded-full bg-gradient-to-br from-[#58A8E0] to-[#3B82F6] ring-4 ring-[#58A8E0]/15 shadow-[0_6px_18px_rgba(59,130,246,0.25)]" />
          </div>

          {/* Card */}
          <div
            className={`relative rounded-xl bg-white/90 backdrop-blur-sm p-5
                        border shadow-sm shadow-[#0F172A]/5 transition-colors transition-shadow duration-300
                        hover:shadow-lg hover:shadow-[#0F172A]/10 hover:border-[#3B82F6]/30
                        before:absolute before:inset-x-6 before:top-0 before:h-px
                        before:bg-gradient-to-r before:from-transparent before:via-[#58A8E0]/70 before:to-transparent
                        after:pointer-events-none after:absolute after:inset-0 after:rounded-xl
                        after:bg-[linear-gradient(110deg,transparent,rgba(88,168,224,0.10),transparent)]
                        after:opacity-0 after:translate-x-[-20%] after:transition after:duration-700
                        hover:after:opacity-100 hover:after:translate-x-[20%]

                        border-[#E2E8F0]/70`}
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-[#3B82F6]/10 px-3 py-1 text-xs font-mono font-semibold tracking-wide text-[#1E3A5F]">
                {stepCode}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-[#E2E8F0] via-[#E2E8F0]/60 to-transparent" />
            </div>

            <h3 className="mt-3 text-base font-semibold text-[#1E3A5F] leading-snug">
              <span className="sr-only">
                Шаг {step.id} из {totalSteps}:{" "}
              </span>
              {step.title}
            </h3>
            {step.description && (
              <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                {step.description}
              </p>
            )}
          </div>
        </div>
      </Reveal>
    </li>
  );
}
