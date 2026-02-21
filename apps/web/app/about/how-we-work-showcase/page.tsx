import type { Metadata } from "next";
import { fetchAboutPageData } from "@/shared/api/data-provider";
import { HowWeWorkShowcase } from "@/widgets/HowWeWorkShowcase";

export const metadata: Metadata = {
  title: "Демо: Как мы работаем — НЦФГ",
  description:
    "Демонстрационная страница с тремя вариантами блока «Как мы работаем» в современном banking-стиле.",
};

export default async function HowWeWorkShowcasePage() {
  const aboutPage = await fetchAboutPageData();

  const steps = [...aboutPage.howWeWorkSteps]
    .sort((a, b) => a.order - b.order)
    .map((step, index) => ({
      id: step.order > 0 ? step.order : index + 1,
      title: step.title,
      description: step.description ?? undefined,
    }));

  return (
    <main className="bg-[#F8FAFC] pt-24 md:pt-28">
      <HowWeWorkShowcase
        title={aboutPage.howWeWorkTitle ?? "Как мы работаем"}
        lead={aboutPage.howWeWorkLead ?? undefined}
        steps={steps}
      />
    </main>
  );
}
