import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  Header,
  HowWeWork,
  LeadForm,
  FAQ,
  Footer,
} from "@/widgets";
import { ServiceHero } from "@/widgets/ServiceHero";
import { ServiceDescription } from "@/widgets/ServiceDescription";
import { ServiceExamples } from "@/widgets/ServiceExamples";
import { fetchServicesData, fetchSiteSettings } from "@/shared/api/data-provider";
import type { Service, ServicesData } from "@/shared/api/types/service";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Find service by ID across all categories
function findServiceById(data: ServicesData, id: string): Service | null {
  for (const category of data.serviceCategories) {
    const service = category.services.find((s) => s.id === id);
    if (service) {
      return service;
    }
  }
  return null;
}

// Get all published service IDs
function getAllServiceIds(data: ServicesData): string[] {
  const ids: string[] = [];
  for (const category of data.serviceCategories) {
    for (const service of category.services) {
      ids.push(service.id);
    }
  }
  return ids;
}

export async function generateStaticParams() {
  const servicesData = await fetchServicesData();
  const ids = getAllServiceIds(servicesData);
  return ids.map((id) => ({ slug: id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const servicesData = await fetchServicesData();
  const service = findServiceById(servicesData, slug);

  if (!service) {
    return {
      title: "Услуга не найдена — НЦФГ",
    };
  }

  return {
    title: `${service.title} — НЦФГ`,
    description: service.shortDescription,
    openGraph: {
      title: `${service.title} — НЦФГ`,
      description: service.shortDescription,
      type: "website",
    },
  };
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

  if (slug.includes("_")) {
    redirect(`/companies/${slug.replace(/_/g, "-")}`);
  }

  const [servicesData, siteSetting] = await Promise.all([
    fetchServicesData(),
    fetchSiteSettings(),
  ]);
  const service = findServiceById(servicesData, slug);

  if (!service) {
    notFound();
  }

  // Transform howWeWork string[] to Step[] for HowWeWork widget
  const howWeWorkSteps = service.howWeWork?.map((step, index) => ({
    id: index + 1,
    title: step,
  }));

  return (
    <>
      <Header />
      <main>
        <ServiceHero
          title={service.title}
          shortDescription={service.shortDescription}
          ctaLabel={service.cta?.label}
        />
        <ServiceDescription
          fullDescription={service.fullDescription}
          benefits={service.benefits}
        />
        {howWeWorkSteps && howWeWorkSteps.length > 0 && (
          <HowWeWork title="Как мы работаем" steps={howWeWorkSteps} />
        )}
        {service.examples && service.examples.length > 0 && (
          <ServiceExamples examples={service.examples} />
        )}
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
