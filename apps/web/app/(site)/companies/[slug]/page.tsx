import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  HowWeWork,
  LeadForm,
  FAQ,
  Footer,
  ServiceHtmlSection,
  ServiceMarkdownSection,
  Webinars,
} from "@/widgets";
import { ServiceHero } from "@/widgets/ServiceHero";
import { ServiceDescription } from "@/widgets/ServiceDescription";
import { ServiceExamples } from "@/widgets/ServiceExamples";
import {
  fetchServiceById,
  fetchServiceIds,
  fetchSiteSettings,
} from "@/shared/api/data-provider";
import {
  buildPageMetadata,
  buildServiceDescription,
} from "@/shared/lib/metadata";
import {
  buildBreadcrumbList,
  buildFAQPageStructuredData,
} from "@/shared/lib/structured-data";
import { StructuredDataScript } from "@/shared/ui/StructuredDataScript";
import type { Service } from "@/shared/api/types/service";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SERVICE_NOT_FOUND_DESCRIPTION = "Услуга не найдена или недоступна.";

export const revalidate = 60;

async function safeFetchServiceIds(): Promise<string[]> {
  try {
    return await fetchServiceIds();
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    console.error(`[companies/[slug]] Failed to fetch service ids: ${details}`);
    return [];
  }
}

async function safeFetchService(slug: string, context: string): Promise<Service | null> {
  try {
    return await fetchServiceById(slug);
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    console.error(`[companies/[slug]] Failed to fetch service in ${context}: ${details}`);
    return null;
  }
}

export async function generateStaticParams() {
  const ids = await safeFetchServiceIds();
  return ids.map((id) => ({ slug: id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await safeFetchService(slug, "generateMetadata");

  if (!service) {
    return buildPageMetadata({
      path: `/companies/${slug}`,
      title: "Услуга не найдена",
      description: SERVICE_NOT_FOUND_DESCRIPTION,
      robots: {
        index: false,
        follow: false,
      },
    });
  }

  return buildPageMetadata({
    path: `/companies/${slug}`,
    title: service.title,
    description: buildServiceDescription(service),
  });
}

const faqItems = [
  {
    question: "Как начать сотрудничество?",
    answer:
      "Оставьте заявку на сайте или позвоните нам. Мы проведём бесплатную консультацию, обсудим ваши цели и предложим оптимальное решение для вашей компании.",
  },
  {
    question: "Сколько времени занимает подготовка проекта?",
    answer:
      "Сроки зависят от формата и масштаба проекта. Типовые решения можем запустить за 1-2 недели, комплексные программы — от 1 месяца.",
  },
  {
    question: "Работаете ли вы с компаниями из регионов?",
    answer:
      "Да, мы работаем по всей России. Онлайн-форматы доступны для любого региона, а для офлайн-мероприятий готовы выехать к вам.",
  },
  {
    question: "Можно ли адаптировать программу под нашу компанию?",
    answer:
      "Да, мы гибко подходим к каждому проекту. Адаптируем контент, форматы и расписание под специфику вашей отрасли и потребности сотрудников.",
  },
];

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;

  const [service, siteSetting] = await Promise.all([
    safeFetchService(slug, "ServicePage"),
    fetchSiteSettings(),
  ]);

  if (!service) {
    notFound();
  }

  const breadcrumbStructuredData = buildBreadcrumbList([
    { name: "Главная", path: "/" },
    { name: "Компаниям", path: "/companies" },
    { name: service.title, path: `/companies/${slug}` },
  ]);
  const faqStructuredData = buildFAQPageStructuredData(faqItems);

  // Transform howWeWork string[] to Step[] for HowWeWork widget
  const howWeWorkSteps = (service.howWeWork ?? []).map((step, index) => ({
    id: index + 1,
    title: step,
  }));

  return (
    <>
      <StructuredDataScript data={breadcrumbStructuredData} />
      {faqStructuredData ? <StructuredDataScript data={faqStructuredData} /> : null}
      <main>
        <ServiceHero
          title={service.title}
          shortDescription={service.shortDescription}
          ctaLabel={service.cta?.label}
        />
        <ServiceDescription
          descriptionTitle={service.fullDescriptionTitle || "Описание услуги"}
          descriptionMarkdown={service.fullDescription}
          benefitsTitle={service.benefitsTitle}
          benefits={service.benefits}
        />
        <ServiceHtmlSection
          id="html-section-before"
          html={service.htmlSectionBefore}
        />
        <ServiceMarkdownSection
          id="useful-information"
          title="Полезная информация"
          markdown={service.usefulInformation}
          variant="info-card"
        />
        {howWeWorkSteps.length > 0 && (
          <HowWeWork
            title={service.howWeWorkTitle || "Как мы работаем"}
            steps={howWeWorkSteps}
          />
        )}
        <Webinars
          id="webinars"
          title={service.webinarsTitle || "Вебинары"}
          webinars={service.webinars ?? []}
        />
        <ServiceHtmlSection
          id="html-section-after"
          html={service.htmlSectionAfter}
        />
        <ServiceExamples
          title={service.examplesTitle || "Примеры работ"}
          examples={service.examples ?? []}
        />
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
