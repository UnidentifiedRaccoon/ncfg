import type { Metadata } from "next";
import {
  Hero,
  HowWeWork,
  Principles,
  Team,
  Experts,
  LeadForm,
  FAQ,
  Footer,
} from "@/widgets";
import {
  fetchAboutPageData,
  fetchPeopleData,
  fetchSiteSettings,
} from "@/shared/api/data-provider";
import { ABOUT_HERO_LEAD, pickAboutHeroMetrics } from "@/shared/lib/about-hero";
import { buildPageMetadata } from "@/shared/lib/metadata";
import {
  buildBreadcrumbList,
  buildFAQPageStructuredData,
} from "@/shared/lib/structured-data";
import { StructuredDataScript } from "@/shared/ui/StructuredDataScript";

export const metadata: Metadata = buildPageMetadata({
  path: "/about",
  title: "О центре",
  description:
    "На странице «О центре» вы узнаете, как НЦФГ работает с 2005 года, кто входит в команду и на каких принципах строятся наши проекты.",
});

export const revalidate = 0;

export default async function AboutPage() {
  const [siteSetting, aboutPage, peopleData] = await Promise.all([
    fetchSiteSettings(),
    fetchAboutPageData(),
    fetchPeopleData(),
  ]);

  const { people } = peopleData;
  const teamMembers = people.filter((person) => person.isTeam);

  const howWeWorkSteps = [...aboutPage.howWeWorkSteps]
    .sort((a, b) => a.order - b.order)
    .map((step, index) => ({
      id: step.order > 0 ? step.order : index + 1,
      title: step.title,
      description: step.description ?? undefined,
    }));

  const principles = [...aboutPage.principles]
    .sort((a, b) => a.order - b.order)
    .map((p) => ({
      id: p.key,
      order: p.order,
      title: p.title,
      description: p.description,
      linkLabel: p.linkLabel ?? undefined,
      href: p.href ?? undefined,
    }));

  const faqItems = [...aboutPage.faqItems]
    .sort((a, b) => a.order - b.order)
    .map((item) => ({ question: item.question, answer: item.answer }));

  const heroMetrics = pickAboutHeroMetrics(siteSetting.metrics);
  const breadcrumbStructuredData = buildBreadcrumbList([
    { name: "Главная", path: "/" },
    { name: "О центре", path: "/about" },
  ]);
  const faqStructuredData = buildFAQPageStructuredData(faqItems);

  return (
    <>
      <StructuredDataScript data={breadcrumbStructuredData} />
      {faqStructuredData ? <StructuredDataScript data={faqStructuredData} /> : null}
      <main>
        <Hero
          headline={aboutPage.heroHeadline ?? ""}
          lead={ABOUT_HERO_LEAD}
          primaryCta={
            aboutPage.heroCta
              ? { label: aboutPage.heroCta.label, href: aboutPage.heroCta.href }
              : undefined
          }
          metrics={heroMetrics}
        />
        <Principles
          title={aboutPage.principlesTitle ?? "Наши принципы"}
          lead={aboutPage.principlesLead ?? undefined}
          principles={principles}
        />
        <HowWeWork
          title={aboutPage.howWeWorkTitle ?? "Как мы работаем"}
          lead={aboutPage.howWeWorkLead ?? undefined}
          steps={howWeWorkSteps}
        />
        {teamMembers.length > 0 ? <Team title="Наша команда" members={teamMembers} /> : null}
        <Experts title="Наши эксперты" experts={people} />
        <LeadForm />
        <FAQ title="Частые вопросы" items={faqItems} />
      </main>
      <Footer
        data={{
          organization: {
            fullName: siteSetting.organizationFullName,
            shortName: siteSetting.organizationShortName,
          },
          contacts: {
            phone: siteSetting.contactsPhone,
            email: siteSetting.contactsEmail,
          },
          social: siteSetting.socialLinks.map((l) => ({ label: l.label, href: l.href })),
          legalLinks: siteSetting.legalLinks.map((l) => ({ label: l.label, href: l.href })),
          legalDocuments: {
            title: siteSetting.legalDocumentsTitle ?? "Юридические документы",
            items: siteSetting.legalDocuments.map((d) => ({
              label: d.label,
              href: d.href,
              type: d.type,
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
