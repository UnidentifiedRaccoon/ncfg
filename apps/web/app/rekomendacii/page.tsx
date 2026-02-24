import type { Metadata } from "next";
import { fetchHomePageData, fetchSiteSettings } from "@/shared/api/data-provider";
import { Container } from "@/shared/ui/Container";
import { Footer, RecommendationsShowcase } from "@/widgets";

export const metadata: Metadata = {
  title: "Рекомендации | НЦФГ",
  description:
    "Рекомендации партнеров и клиентов НЦФГ на отдельной странице в формате Capital Grid.",
  openGraph: {
    title: "Рекомендации | НЦФГ",
    description:
      "Отдельная страница «Рекомендации» в стиле Capital Grid и визуальной системе НЦФГ.",
    type: "website",
  },
};

export const revalidate = 60;

const LEMANA_EXPANDED_QUOTE = `В компании Лемана ПРО программа финансового благополучия стала ключевым элементом корпоративной культуры и заботы о сотрудниках. Мы выстраиваем системный подход, в котором сочетаются диагностика финансового здоровья, выявление рисков и развитие финансовой грамотности разных целевых групп. Особое внимание уделяем финансовой культуре семьи, создавая обучающие и игровые форматы для детей сотрудников.

Помимо образовательных программ, в нашей экосистеме действуют практические инструменты, интегрированные в бизнес-процессы компании. Мы развиваем авторские решения, создаваемые самими сотрудниками, активно используем аналитику и регулярно обновляем мотивационные программы на основе данных и обратной связи.

Работа по финансовому благополучию строится с учетом актуальных трендов и потребностей команды. Мы анализируем финансовые задачи разных сегментов, помогаем снижать риски и формировать осознанное отношение к деньгам. Сотрудничество с Национальным центром финансовой грамотности, которое продолжается с 2022 года, стало основой нашего профессионального роста - мы ценим экспертизу, инновационный подход и вовлеченность партнеров.

В 2024 году наша программа заняла второе место в конкурсе EWA, была представлена на заседаниях РСПП, Министерства финансов и Московском финансовом форуме, где получила признание как пример современного подхода к поддержке финансового благополучия сотрудников.

Мы гордимся достигнутыми результатами и продолжаем развивать направление, помогая людям чувствовать уверенность в финансовых решениях и повышать качество жизни.

Екатерина Холодкова
Руководитель проектов по повышению благополучия и укреплению здоровья сотрудников

Подробнее о программе в Лемана ПРО - в интервью на сайте культура-денег.рф (https://xn----7sbkdfa4aiwzvkc8j.xn--p1ai/lemana)`;

function withExpandedQuote(company: string, quote: string): string {
  return company.toLowerCase().includes("лемана") ? LEMANA_EXPANDED_QUOTE : quote;
}

export default async function RecommendationsPage() {
  const [homePage, siteSetting] = await Promise.all([fetchHomePageData(), fetchSiteSettings()]);

  const testimonials = homePage.partners?.testimonials;
  const recommendationItems =
    testimonials?.items
      .filter((item) => item.quote.trim().length > 0)
      .map((item) => ({
        id: item.id,
        company: item.company,
        quote: withExpandedQuote(item.company, item.quote),
      })) ?? [];

  return (
    <>
      <main className="pb-10 md:pb-12">
        <section className="pt-10 md:pt-14">
          <Container>
            <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 md:p-8">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.54] bg-[radial-gradient(920px_360px_at_8%_0%,rgba(59,130,246,0.13),transparent_62%),radial-gradient(620px_240px_at_100%_100%,rgba(88,168,224,0.12),transparent_60%),linear-gradient(to_right,rgba(226,232,240,0.52)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.52)_1px,transparent_1px)] bg-[size:auto,auto,24px_24px,24px_24px]"
              />
              <div className="relative z-10">
                <h1 className="text-3xl font-bold tracking-tight text-[#1E3A5F] md:text-5xl">
                  Рекомендации
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#475569] md:text-lg">
                  Отзывы партнеров и клиентов о совместных проектах и программах НЦФГ.
                </p>
              </div>
            </div>
          </Container>
        </section>

        <section className="pt-6 md:pt-8">
          <Container>
            <RecommendationsShowcase items={recommendationItems} />
          </Container>
        </section>
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
