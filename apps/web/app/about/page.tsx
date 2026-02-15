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

export const metadata: Metadata = {
  title: "О центре — Национальный центр финансовой грамотности | НЦФГ",
  description:
    "Национальный центр финансовой грамотности с 2005 года реализует проекты по повышению финансовой грамотности. Узнайте о нашей команде, принципах работы и экспертах.",
  openGraph: {
    title: "О центре — НЦФГ",
    description:
      "Национальный центр финансовой грамотности с 2005 года реализует проекты по повышению финансовой грамотности населения России.",
    type: "website",
  },
};

export const revalidate = 60; // Revalidate every 60 seconds

function pickHeroMetrics(metrics: Array<{ key: string; displayValue: string }>) {
  const byKey = new Map(metrics.map((m) => [m.key, m.displayValue]));

  return [
    { value: byKey.get("participants") ?? "30,2 млн", label: "участников" },
    { value: byKey.get("regions") ?? "84", label: "региона" },
    { value: byKey.get("corporate_clients") ?? "3 502", label: "клиента" },
    { value: byKey.get("nps") ?? "9,63", label: "NPS программ" },
  ];
}

export default async function AboutPage() {
  const [siteSetting, aboutPage, peopleData] = await Promise.all([
    fetchSiteSettings(),
    fetchAboutPageData(),
    fetchPeopleData(),
  ]);

  const { people } = peopleData;

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
    }));

  const faqItems = [...aboutPage.faqItems]
      .sort((a, b) => a.order - b.order)
      .map((item) => ({ question: item.question, answer: item.answer }));

  const heroMetrics = pickHeroMetrics(siteSetting.metrics);

  return (
    <>
      <main>
        <Hero
          headline={aboutPage.heroHeadline ?? ""}
          primaryCta={
            aboutPage.heroCta
              ? { label: aboutPage.heroCta.label, href: aboutPage.heroCta.href }
              : undefined
          }
          metrics={heroMetrics}
        />
        <HowWeWork
          title={aboutPage.howWeWorkTitle ?? "Как мы работаем"}
          lead={aboutPage.howWeWorkLead ?? undefined}
          steps={howWeWorkSteps}
        />
        <Principles
          title={aboutPage.principlesTitle ?? "Наши принципы"}
          lead={aboutPage.principlesLead ?? undefined}
          principles={principles}
        />
        <Team title="Наша команда" members={people} />
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
            legalAddress: siteSetting.contactsLegalAddress ?? "",
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
