import type { Metadata } from "next";
import { fetchServicesData, fetchSiteSettings } from "@/shared/api/data-provider";
import type { Service, ServicesData } from "@/shared/api/types/service";
import { makeFooterData } from "@/shared/lib/footer-data";

// Find service by ID across all categories.
function findServiceById(data: ServicesData, id: string): Service | null {
  for (const category of data.serviceCategories) {
    const service = category.services.find((s) => s.id === id);
    if (service) return service;
  }
  return null;
}

// Get all published service IDs.
function getAllServiceIds(data: ServicesData): string[] {
  const ids: string[] = [];
  for (const category of data.serviceCategories) {
    for (const service of category.services) {
      ids.push(service.id);
    }
  }
  return ids;
}

export async function getServiceStaticParams() {
  const servicesData = await fetchServicesData();
  return getAllServiceIds(servicesData).map((id) => ({ slug: id }));
}

export async function getServiceMetadata(slug: string): Promise<Metadata> {
  const servicesData = await fetchServicesData();
  const service = findServiceById(servicesData, slug);

  if (!service) {
    return { title: "Услуга не найдена — НЦФГ" };
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

export async function getServicePageModel(slug: string) {
  const [servicesData, siteSetting] = await Promise.all([
    fetchServicesData(),
    fetchSiteSettings(),
  ]);

  const service = findServiceById(servicesData, slug);

  return {
    service,
    howWeWorkSteps: service?.howWeWork?.map((step, index) => ({ id: index + 1, title: step })),
    footerData: makeFooterData(siteSetting),
  };
}

