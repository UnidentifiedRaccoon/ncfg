import type { Metadata } from "next";
import {
  Hero,
  Products,
  Projects,
  Services,
  Partners,
  News,
  LeadForm,
  Footer,
} from "@/widgets";
import {
  fetchHomePageData,
  fetchLatestNewsArticles,
  fetchRecommendations,
  fetchServicesData,
  fetchSiteSettings,
} from "@/shared/api/data-provider";
import { buildPageMetadata } from "@/shared/lib/metadata";
import {
  buildOrganizationStructuredData,
  buildWebsiteStructuredData,
} from "@/shared/lib/structured-data";
import { StructuredDataScript } from "@/shared/ui/StructuredDataScript";

export const metadata: Metadata = buildPageMetadata({
  path: "/",
  title: "Национальный центр финансовой грамотности",
  description:
    "НЦФГ помогает компаниям и частным лицам развивать финансовую грамотность через программы, обучение и практические материалы.",
});

function makeHeroMetrics(metrics: Array<{ key: string; displayValue: string }>) {
  const byKey = new Map(metrics.map((m) => [m.key, m.displayValue]));

  return [
    ["participants", "участников"],
    ["regions", "региона"],
    ["corporate_clients", "компании"],
    ["nps", "NPS программ"],
  ].flatMap(([key, label]) => {
    const value = byKey.get(key);
    return value ? [{ value, label }] : [];
  });
}

export default async function Home() {
  const [homePage, siteSetting, servicesData, latestNews, recommendations] = await Promise.all([
    fetchHomePageData(),
    fetchSiteSettings(),
    fetchServicesData(),
    fetchLatestNewsArticles(4),
    fetchRecommendations(3),
  ]);

  const hero = homePage.hero;
  const heroMetrics = makeHeroMetrics(siteSetting.metrics);
  const clientsCarousel = homePage.partners?.clientsCarousel;
  const awards = homePage.partners?.awards ?? [];

  const mappedAwards = awards.map((award) => ({
    id: award.id,
    title: award.title,
    year: award.year ?? null,
  }));

  const mappedClientsCarousel = clientsCarousel
    ? {
        title: clientsCarousel.title,
        categories: clientsCarousel.categories.map((category) => ({
          id: category.key,
          name: category.name,
          logos: category.logos.map((logo) => ({
            id: logo.id,
            title: logo.title,
            href: logo.href ?? null,
            img: logo.imgPath ?? "",
          })),
          more: {
            display: category.moreDisplay ?? "",
            value: category.moreValue ?? 0,
            unit: category.moreUnit ?? "",
          },
        })),
        archiveCta: clientsCarousel.archiveCta
          ? {
              label: clientsCarousel.archiveCta.label,
              href: clientsCarousel.archiveCta.href,
            }
          : { label: "Все клиенты", href: "/companies" },
      }
    : {
        title: "",
        categories: [],
        archiveCta: { label: "Все клиенты", href: "/companies" },
      };

  const mappedTestimonials = {
    title: "Рекомендации",
    items: recommendations
      .filter((item) => item.quote.trim().length > 0)
      .map((item) => ({
        id: item.id,
        company: item.company,
        logoImg: item.logoImg ?? "",
        quote: item.quote,
      })),
    more: { href: "/rekomendacii" },
  };

  const websiteStructuredData = buildWebsiteStructuredData();
  const organizationStructuredData = buildOrganizationStructuredData({
    organizationFullName: siteSetting.organizationFullName,
    organizationShortName: siteSetting.organizationShortName,
    contactsPhone: siteSetting.contactsPhone,
    contactsEmail: siteSetting.contactsEmail,
    socialLinks: siteSetting.socialLinks,
  });

  return (
    <>
      <StructuredDataScript data={websiteStructuredData} />
      <StructuredDataScript data={organizationStructuredData} />
      <main>
        <Hero
          headline={hero?.headline ?? ""}
          accentWord="финансовой грамотности"
          lead={hero?.lead ?? undefined}
          primaryCta={
            hero?.primaryCta
              ? { label: hero.primaryCta.label, href: hero.primaryCta.href }
              : undefined
          }
          metrics={heroMetrics}
        />
        <Services
          title={homePage.servicesTitle ?? "Услуги"}
          services={servicesData.serviceCategories.slice(0, 3).map((category) => ({
            id: category.id,
            title: category.title,
            description: category.description,
            href: `/companies#services-${category.id}`,
          }))}
        />
        <Products />
        <Projects />
        <Partners
          awards={mappedAwards}
          clientsCarousel={mappedClientsCarousel}
          testimonials={mappedTestimonials}
        />
        <LeadForm />
        <News
          title={homePage.newsTitle ?? "Новости"}
          lead={homePage.newsTeaser ?? undefined}
          posts={latestNews}
          archiveHref={homePage.newsArchiveLink?.href ?? "/blog"}
        />
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
