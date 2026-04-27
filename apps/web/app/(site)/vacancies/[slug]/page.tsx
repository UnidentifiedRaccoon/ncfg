import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Footer, mapSiteSettingsToFooterData, Vacancy } from "@/widgets";
import {
  fetchSiteSettings,
  fetchVacancies,
  fetchVacancy,
  fetchVacancySlugs,
} from "@/shared/api/data-provider";
import {
  buildPageMetadata,
  buildVacancyPageDescription,
} from "@/shared/lib/metadata";
import { buildBreadcrumbList } from "@/shared/lib/structured-data";
import { StructuredDataScript } from "@/shared/ui/StructuredDataScript";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const VACANCY_NOT_FOUND_DESCRIPTION =
  "Вакансия не найдена или больше не опубликована.";

export const revalidate = 0;

export async function generateStaticParams() {
  const slugs = await fetchVacancySlugs();
  return slugs.map((slug) => ({ slug }));
}

async function safeFetchVacancy(slug: string) {
  try {
    return await fetchVacancy(slug);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[vacancies/${slug}] failed to fetch vacancy from Strapi: ${message}`);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const vacancy = await safeFetchVacancy(slug);

  if (!vacancy) {
    return buildPageMetadata({
      path: `/vacancies/${slug}`,
      title: "Вакансия не найдена",
      description: VACANCY_NOT_FOUND_DESCRIPTION,
      robots: {
        index: false,
        follow: false,
      },
    });
  }

  return buildPageMetadata({
    path: `/vacancies/${vacancy.slug}`,
    title: vacancy.title,
    description: buildVacancyPageDescription(vacancy),
    imagePath: vacancy.coverImage ?? undefined,
  });
}

export default async function VacancyPage({ params }: PageProps) {
  const { slug } = await params;
  const [siteSetting, allVacancies, vacancy] = await Promise.all([
    fetchSiteSettings(),
    fetchVacancies(),
    safeFetchVacancy(slug),
  ]);

  if (!vacancy) {
    notFound();
  }

  const breadcrumbStructuredData = buildBreadcrumbList([
    { name: "Главная", path: "/" },
    { name: "Вакансии", path: "/vacancies" },
    { name: vacancy.title, path: `/vacancies/${vacancy.slug}` },
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <StructuredDataScript data={breadcrumbStructuredData} />
      <main className="flex-1">
        <Vacancy vacancy={vacancy} allVacancies={allVacancies} />
      </main>
      <Footer data={mapSiteSettingsToFooterData(siteSetting)} />
    </div>
  );
}
