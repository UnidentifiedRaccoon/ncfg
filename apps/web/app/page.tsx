import {
  Header,
  Hero,
  Products,
  Services,
  Partners,
  News,
  FAQ,
  LeadForm,
  Footer,
} from "@/widgets";
import {
  fetchHomePageData,
  fetchLatestNewsArticles,
  fetchServicesData,
  fetchSiteSettings,
} from "@/shared/api/data-provider";

function makeHeroMetrics(metrics: Array<{ key: string; displayValue: string }>) {
  const byKey = new Map(metrics.map((m) => [m.key, m.displayValue]));

  return [
    { value: byKey.get("participants") ?? "30,2 млн", label: "участников" },
    { value: byKey.get("regions") ?? "84", label: "региона" },
    { value: byKey.get("corporate_clients") ?? "3 502", label: "клиента" },
    { value: byKey.get("nps") ?? "9,63", label: "NPS программ" },
  ];
}

export default async function Home() {
  const [homePage, siteSetting, servicesData, latestNews] = await Promise.all([
    fetchHomePageData(),
    fetchSiteSettings(),
    fetchServicesData(),
    fetchLatestNewsArticles(4),
  ]);

  const hero = homePage.hero;
  const heroMetrics = makeHeroMetrics(siteSetting.metrics);
  const clientsCarousel = homePage.partners?.clientsCarousel;
  const awards = homePage.partners?.awards ?? [];
  const testimonials = homePage.partners?.testimonials;

  const mappedAwards = awards.map((award) => ({
    id: award.id,
    title: award.title,
    year: award.year ?? null,
    img: award.imgPath ?? undefined,
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

  const mappedTestimonials = testimonials
    ? {
        title: testimonials.title,
        items: testimonials.items.map((item) => ({
          id: item.id,
          company: item.company,
          logoImg: item.logoImgPath ?? "",
          quote: item.quote,
        })),
        more: testimonials.more
          ? {
              labelTop: testimonials.more.labelTop,
              labelBottom: testimonials.more.labelBottom,
              href: testimonials.more.href,
            }
          : { labelTop: "", labelBottom: "", href: "/companies" },
      }
    : {
        title: "",
        items: [],
        more: { labelTop: "", labelBottom: "", href: "/companies" },
      };

  return (
    <>
      <Header />
      <main>
        <Hero
          headline={hero?.headline ?? ""}
          lead={hero?.lead ?? undefined}
          primaryCta={
            hero?.primaryCta
              ? { label: hero.primaryCta.label, href: hero.primaryCta.href }
              : undefined
          }
          metrics={heroMetrics}
        />
        <Products />
        <Services
          title={homePage.servicesTitle ?? "Услуги"}
          services={servicesData.serviceCategories.slice(0, 3).map((category) => ({
            title: category.title,
            description: category.description,
            href: "/companies",
            image: null,
          }))}
        />
        <Partners
          awards={mappedAwards}
          clientsCarousel={mappedClientsCarousel}
          testimonials={mappedTestimonials}
        />
        <LeadForm />
        <FAQ title="Частые вопросы" items={[]} />
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
