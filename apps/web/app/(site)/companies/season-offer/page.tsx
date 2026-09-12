import { HeroMotionScene } from "@/shared/ui/HeroMotionScene";
import type { Metadata } from "next";

import {
  SeasonOfferAssurance,
  SeasonOfferHero,
  SeasonOfferPrograms,
  SeasonOfferTaskNavigator,
  seasonOffer2026Content,
} from "@/widgets/SeasonOffer2026";
import { FAQ } from "@/widgets/FAQ";
import { Footer } from "@/widgets/Footer";
import { HowWeWork } from "@/widgets/HowWeWork";
import { LeadForm } from "@/widgets/LeadForm";
import { fetchSiteSettings } from "@/shared/api/data-provider";
import { buildPageMetadata } from "@/shared/lib/metadata";
import {
  buildBreadcrumbList,
  buildFAQPageStructuredData,
} from "@/shared/lib/structured-data";
import { StructuredDataScript } from "@/shared/ui/StructuredDataScript";

const PAGE_PATH = "/companies/season-offer";

export const revalidate = 0;

export const metadata: Metadata = buildPageMetadata({
  path: PAGE_PATH,
  title: "Финансовое благополучие сотрудников — осень 2026",
  description:
    "Сезонные корпоративные программы НЦФГ: вебинары, практикумы и комплексное обучение финансовому благополучию сотрудников осенью 2026 года.",
  imagePath: "/services/well-being.png",
});

export default async function SeasonOffer2026Page() {
  const siteSetting = await fetchSiteSettings();
  const breadcrumbStructuredData = buildBreadcrumbList([
    { name: "Главная", path: "/" },
    { name: "Компаниям", path: "/companies" },
    { name: "Программы осени 2026", path: PAGE_PATH },
  ]);
  const faqStructuredData = buildFAQPageStructuredData(
    seasonOffer2026Content.faq.items
  );

  return (
    <>
      <StructuredDataScript data={breadcrumbStructuredData} />
      {faqStructuredData ? (
        <StructuredDataScript data={faqStructuredData} />
      ) : null}

      <main>
        <HeroMotionScene
          hero={<SeasonOfferHero {...seasonOffer2026Content.hero} />}
          variant="editorial"
          sentinel={false}
        >
          <SeasonOfferTaskNavigator
            {...seasonOffer2026Content.taskNavigator}
          />
          <SeasonOfferPrograms
            {...seasonOffer2026Content.programCatalog}
            formHref={seasonOffer2026Content.formHref}
          />
          <HowWeWork {...seasonOffer2026Content.howWeWork} />
          <SeasonOfferAssurance {...seasonOffer2026Content.assurance} />
          <FAQ {...seasonOffer2026Content.faq} />

          <div id="season-offer-lead" className="scroll-mt-20">
            <LeadForm
              audience="corporate"
              programs={seasonOffer2026Content.programCatalog.programs.map(({ id, title }) => ({ id, title }))}
            />
          </div>
        </HeroMotionScene>
      </main>

      <Footer
        ctaHref={seasonOffer2026Content.formHref}
        data={{
          organization: {
            fullName: siteSetting.organizationFullName,
            shortName: siteSetting.organizationShortName,
          },
          contacts: {
            phone: siteSetting.contactsPhone,
            email: siteSetting.contactsEmail,
          },
          social: siteSetting.socialLinks.map((link) => ({
            label: link.label,
            href: link.href,
          })),
          legalLinks: siteSetting.legalLinks.map((link) => ({
            label: link.label,
            href: link.href,
          })),
          legalDocuments: {
            title: siteSetting.legalDocumentsTitle ?? "Юридические документы",
            items: siteSetting.legalDocuments.map((document) => ({
              label: document.label,
              href: document.href,
              type: document.type,
            })),
          },
          copyright: {
            years: siteSetting.copyrightYears ?? "",
            text: siteSetting.copyrightText ?? "",
            notice: siteSetting.copyrightNotice ?? "",
          },
        }}
      />
    </>
  );
}
