import {
  Hero,
  Products,
  Projects,
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
  fetchRecommendations,
  fetchServicesData,
  fetchSiteSettings,
} from "@/shared/api/data-provider";

const DEFAULT_CLIENTS_ARCHIVE_CTA = {
  label: "Все клиенты",
  href: "/companies",
} as const;

const TESTIMONIALS_MORE_LABELS = {
  top: "Все",
  bottom: "рекомендации",
} as const;

const MOCK_RECOMMENDATIONS = [
  {
    id: 1,
    company: "МТС Банк",
    logoImg: "/data/clients/22/image.png",
    quote:
      "ПАО «МТС Банк» благодарит коллектив НЦФГ за высокий профессионализм в организации федеральных проектов по финансовой грамотности.",
  },
  {
    id: 2,
    company: "Mars",
    logoImg: "/data/clients/7/image.png",
    quote:
      "Мы видим реальный интерес сотрудников к программам НЦФГ и продолжаем развивать направление финансового благополучия команды.",
  },
  {
    id: 3,
    company: "Сбербанк",
    logoImg: "/data/clients/12/image.png",
    quote:
      "Совместные инициативы с НЦФГ показывают высокую вовлечённость и прикладную ценность для участников программ.",
  },
  {
    id: 4,
    company: "UNILEVER",
    logoImg: "/data/clients/46/image.png",
    quote:
      "Гибкий формат программ НЦФГ позволил масштабировать обучение в регионах и получить сильный практический эффект.",
  },
  {
    id: 5,
    company: "Лента",
    logoImg: "/data/clients/2/image.png",
    quote:
      "Системный подход НЦФГ помог адаптировать обучение под графики и специфику работы сотрудников в ритейле.",
  },
  {
    id: 6,
    company: "Минфин России",
    logoImg: "/data/clients/26/image.png",
    quote:
      "НЦФГ — один из ключевых партнёров в реализации стратегии повышения финансовой грамотности населения.",
  },
  {
    id: 7,
    company: "Райффайзенбанк",
    logoImg: "/data/clients/45/image.png",
    quote:
      "Экспертиза НЦФГ и качество контента обеспечили высокую обратную связь от участников вебинаров.",
  },
  {
    id: 8,
    company: "ИКЕА",
    logoImg: "/data/clients/6/image.png",
    quote:
      "Короткие практичные форматы НЦФГ отлично подошли нашей аудитории и показали высокий уровень удовлетворённости.",
  },
  {
    id: 9,
    company: "Центральный банк РФ",
    logoImg: "/data/clients/27/image.png",
    quote:
      "НЦФГ демонстрирует системный подход и высокие компетенции в проектах финансового просвещения.",
  },
  {
    id: 10,
    company: "Росгосстрах",
    logoImg: "/data/clients/19/image.png",
    quote:
      "Сотрудничество с НЦФГ позволило создать образовательные материалы, которые полезны и понятны нашей аудитории.",
  },
] as const;

function makeHeroMetrics(metrics: Array<{ key: string; displayValue: string }>) {
  const byKey = new Map(metrics.map((m) => [m.key, m.displayValue]));

  return [
    { value: byKey.get("participants") ?? "30,2 млн", label: "участников" },
    { value: byKey.get("regions") ?? "84", label: "региона" },
    { value: byKey.get("corporate_clients") ?? "3 502", label: "компании" },
    { value: byKey.get("nps") ?? "9,63", label: "NPS программ" },
  ];
}

export default async function Home() {
  const [homePage, siteSetting, servicesData, latestNews, recommendations] = await Promise.all([
    fetchHomePageData(),
    fetchSiteSettings(),
    fetchServicesData(),
    fetchLatestNewsArticles(4),
    fetchRecommendations(10),
  ]);

  const hero = homePage.hero;
  const heroMetrics = makeHeroMetrics(siteSetting.metrics);
  const clientsCarousel = homePage.partners?.clientsCarousel;
  const awards = homePage.partners?.awards ?? [];

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
          : DEFAULT_CLIENTS_ARCHIVE_CTA,
      }
    : {
        title: "",
        categories: [],
        archiveCta: DEFAULT_CLIENTS_ARCHIVE_CTA,
      };

  const recommendationsItems = recommendations
    .filter((item) => item.quote.trim().length > 0)
    .map((item) => ({
      id: item.id,
      company: item.company,
      logoImg: item.logoImg ?? "",
      quote: item.quote,
    }));
  const safeRecommendations =
    recommendationsItems.length > 0 ? recommendationsItems : [...MOCK_RECOMMENDATIONS];

  const mappedTestimonials = {
    title: "Рекомендации",
    items: safeRecommendations,
    more: {
      labelTop: TESTIMONIALS_MORE_LABELS.top,
      labelBottom: TESTIMONIALS_MORE_LABELS.bottom,
      href: "/rekomendacii",
      value: safeRecommendations.length,
    },
  };

  return (
    <>
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
