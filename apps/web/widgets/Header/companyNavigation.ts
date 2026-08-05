export interface CompanyServiceLink {
  title: string;
  href: string;
}

export interface CompanyNavigationCategory {
  id: string;
  title: string;
  services: readonly CompanyServiceLink[];
}

export const COMPANY_NAVIGATION = [
  {
    id: "wellbeing",
    title: "Программы финансового благополучия для сотрудников",
    services: [
      {
        title: "Цикл вебинаров и тренингов",
        href: "/companies/tsikl-vebinarov-i-treningov",
      },
      {
        title: "Финансовая диагностика",
        href: "/companies/finansovaya-diagnostika",
      },
      {
        title: "Марафоны и челленджи для развития навыков",
        href: "/companies/marafony-i-chellendzhi-dlya-razvitiya-navykov",
      },
      {
        title: "Финансовые экскурсии",
        href: "/companies/finansovye-ekskursii",
      },
      {
        title: "Обучение детей сотрудников",
        href: "/companies/obuchenie-detey-sotrudnikov",
      },
      {
        title: "Комплексная программа",
        href: "/companies/kompleksnaya-programma",
      },
    ],
  },
  {
    id: "materials",
    title: "Методические и образовательные материалы",
    services: [
      {
        title: "Разработка курсов по финансовому благополучию",
        href: "/companies/razrabotka-kursov-po-finansovomu-blagopoluchiyu",
      },
      {
        title: "Информационные брошюры и презентации",
        href: "/companies/informatsionnye-broshyury-i-prezentatsii",
      },
      {
        title: "Авторские статьи экспертов НЦФГ",
        href: "/companies/avtorskie-stati-ekspertov-ntsfg",
      },
    ],
  },
  {
    id: "events",
    title: "Мероприятия и публичные выступления",
    services: [
      {
        title: "Организация и модерация массовых мероприятий",
        href: "/companies/organizatsiya-i-moderatsiya-massovyh-meropriyatiy-po-razvitiyu-finansovoy-gramotnosti-i-kultury",
      },
      {
        title: "Лекции и выступления экспертов НЦФГ",
        href: "/companies/lektsii-i-vystupleniya-ekspertov-ntsfg-na-publichnyh-meropriyatiyah",
      },
    ],
  },
] as const satisfies readonly CompanyNavigationCategory[];

export const SEASONAL_HR_OFFER = {
  title: "Сезонный оффер 2026",
  href: "/companies/season-offer",
  description: "Готовые форматы для HR-команд на осень 2026 года.",
} as const;
