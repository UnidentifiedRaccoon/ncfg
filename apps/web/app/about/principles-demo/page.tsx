import type { Metadata } from "next";
import { Footer } from "@/widgets";
import { PrinciplesShowcase } from "@/widgets/Principles";
import { fetchAboutPageData, fetchSiteSettings } from "@/shared/api/data-provider";
import { makeFooterData } from "@/shared/lib/footer-data";

export const metadata: Metadata = {
  title: "Демо: Наши принципы — 3 варианта | НЦФГ",
  description:
    "Сравнение трех визуальных концепций блока «Наши принципы» в стилистике современного банкинга.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PrinciplesDemoPage() {
  const [siteSetting, aboutPage] = await Promise.all([
    fetchSiteSettings(),
    fetchAboutPageData(),
  ]);

  const principles = [...aboutPage.principles]
    .sort((a, b) => a.order - b.order)
    .map((principle) => ({
      id: principle.key,
      order: principle.order,
      title: principle.title,
      description: principle.description,
    }));

  return (
    <>
      <main>
        <PrinciplesShowcase
          title={aboutPage.principlesTitle ?? "Наши принципы"}
          lead={aboutPage.principlesLead ?? undefined}
          principles={principles}
        />
      </main>
      <Footer data={makeFooterData(siteSetting)} />
    </>
  );
}
