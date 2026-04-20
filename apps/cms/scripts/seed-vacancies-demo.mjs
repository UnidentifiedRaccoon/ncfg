#!/usr/bin/env node

import process from 'node:process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createStrapi } = require('@strapi/strapi');

const DEPARTMENT_UID = 'api::vacancy-department.vacancy-department';
const VACANCY_UID = 'api::vacancy.vacancy';

async function settleDocumentEvents() {
  await new Promise((resolve) => {
    setTimeout(resolve, 250);
  });
}

const DEPARTMENT_PAYLOADS = [
  {
    title: 'Контент и редакция',
    slug: 'content-editorial',
    order: 10,
    description: 'Редакторы, методисты и авторы материалов НЦФГ.',
  },
  {
    title: 'Проектный офис',
    slug: 'project-office',
    order: 20,
    description: 'Команда, которая запускает и сопровождает образовательные и корпоративные проекты.',
  },
  {
    title: 'Продукт и аналитика',
    slug: 'product-analytics',
    order: 30,
    description: 'Исследователи, аналитики и продуктовые специалисты.',
  },
  {
    title: 'Маркетинг и партнёрства',
    slug: 'marketing-partnerships',
    order: 40,
    description: 'Развитие партнёрств, спецпроектов и коммуникаций.',
  },
];

const VACANCY_PAYLOADS = [
  {
    title: 'Редактор образовательных программ',
    slug: 'editor-educational-programs',
    departmentSlug: 'content-editorial',
    employmentType: 'full-time',
    workFormat: 'hybrid',
    location: 'Москва',
    salaryText: 'от 140 000 ₽ на руки',
    publishedDate: '2026-04-10',
    lead:
      'Ищем редактора, который поможет собирать учебные продукты НЦФГ в ясные, современные и хорошо структурированные программы.',
    body: `
<p>В этой роли вы будете собирать программы для сотрудников компаний, курировать авторов и следить за качеством материалов на всех этапах производства.</p>
<h2>Чем предстоит заниматься</h2>
<ul>
  <li>Проектировать структуру образовательных программ и методических материалов.</li>
  <li>Редактировать тексты, сценарии вебинаров и лендинговые описания.</li>
  <li>Координировать работу авторов, дизайнеров и экспертов.</li>
  <li>Следить за единым editorial tone и качеством контента.</li>
</ul>
<h2>Что важно</h2>
<ul>
  <li>Опыт редакторской или методической работы от 3 лет.</li>
  <li>Умение превращать экспертный материал в понятный продукт.</li>
  <li>Навык работы с несколькими стейкхолдерами одновременно.</li>
  <li>Интерес к темам финансовой грамотности и образования взрослых.</li>
</ul>
<h2>Что предлагаем</h2>
<ul>
  <li>Сильную экспертную среду и заметные общественные проекты.</li>
  <li>Гибридный формат работы и команду без лишней бюрократии.</li>
  <li>Пространство для роста до lead editorial роли.</li>
</ul>`,
  },
  {
    title: 'Менеджер корпоративных образовательных проектов',
    slug: 'corporate-education-project-manager',
    departmentSlug: 'project-office',
    employmentType: 'full-time',
    workFormat: 'office',
    location: 'Москва',
    salaryText: '170 000 - 210 000 ₽ gross',
    publishedDate: '2026-04-12',
    lead:
      'Нужен сильный PM, который умеет вести корпоративные программы от брифа и сметы до запуска и отчёта перед заказчиком.',
    body: `
<p>Вы будете отвечать за организацию комплексных образовательных проектов для компаний и партнёров НЦФГ.</p>
<h2>Задачи</h2>
<ul>
  <li>Вести план проекта, бюджет, риски и коммуникации с заказчиком.</li>
  <li>Координировать внутреннюю команду и внешних подрядчиков.</li>
  <li>Следить за сроками, качеством контента и выполнением KPI.</li>
  <li>Собирать отчётность и предлагать улучшения для следующих запусков.</li>
</ul>
<h2>Ожидания</h2>
<ul>
  <li>Опыт управления проектами от 3 лет.</li>
  <li>Умение держать в фокусе и процесс, и клиентский сервис.</li>
  <li>Навык спокойно работать с несколькими потоками задач.</li>
  <li>Опыт в edtech, HR-проектах или корпоративном обучении будет плюсом.</li>
</ul>
<h2>Условия</h2>
<ul>
  <li>Официальное оформление и прозрачные процессы.</li>
  <li>Офисный формат с гибким началом рабочего дня.</li>
  <li>Реальные проекты федерального масштаба.</li>
</ul>`,
  },
  {
    title: 'Аналитик пользовательских исследований',
    slug: 'user-research-analyst',
    departmentSlug: 'product-analytics',
    employmentType: 'project',
    workFormat: 'remote',
    location: 'Россия',
    salaryText: 'по договорённости',
    publishedDate: '2026-04-08',
    lead:
      'Ищем исследователя, который поможет лучше понимать финансовые сценарии пользователей и превращать инсайты в продуктовые решения.',
    body: `
<p>Роль подойдёт человеку, который одинаково уверенно чувствует себя в глубинных интервью, таблицах и презентациях для команды.</p>
<h2>Что нужно делать</h2>
<ul>
  <li>Планировать и проводить качественные и количественные исследования.</li>
  <li>Собирать инсайты о поведении и потребностях целевых аудиторий.</li>
  <li>Формулировать рекомендации для контента, сервисов и образовательных продуктов.</li>
  <li>Упаковывать выводы в понятные артефакты для команды и партнёров.</li>
</ul>
<h2>Нам важно</h2>
<ul>
  <li>Опыт в UX research или CX analytics от 2 лет.</li>
  <li>Умение работать с гипотезами и объяснять сложное простым языком.</li>
  <li>Самостоятельность и аккуратность в работе с данными.</li>
</ul>
<h2>Формат</h2>
<ul>
  <li>Проектная занятость на 4-6 месяцев.</li>
  <li>Удалённая работа, распределённая команда.</li>
  <li>Возможность продлить сотрудничество после первого этапа.</li>
</ul>`,
  },
  {
    title: 'Стажёр в команду партнёрств',
    slug: 'partnerships-intern',
    departmentSlug: 'marketing-partnerships',
    employmentType: 'internship',
    workFormat: 'hybrid',
    location: 'Москва',
    salaryText: 'стипендия 45 000 ₽',
    publishedDate: '2026-04-05',
    lead:
      'Подойдёт тем, кто хочет быстро погрузиться в коммуникации, спецпроекты и партнёрскую работу в социальной и образовательной сфере.',
    body: `
<p>Это стартовая роль с понятной зоной ответственности, менторством и возможностью вырасти в координатора партнёрских проектов.</p>
<h2>Чем будете заниматься</h2>
<ul>
  <li>Помогать в подготовке презентаций, писем и партнёрских материалов.</li>
  <li>Собирать фактуру и конкурентные примеры по рынку.</li>
  <li>Поддерживать команду в организации встреч и спецпроектов.</li>
  <li>Вести аккуратный учёт задач и договорённостей.</li>
</ul>
<h2>Кого ждём</h2>
<ul>
  <li>Студента старших курсов или выпускника с сильными коммуникативными навыками.</li>
  <li>Внимательность к деталям и готовность быстро учиться.</li>
  <li>Интерес к социальным проектам, образованию и устойчивым коммуникациям.</li>
</ul>
<h2>Что получите</h2>
<ul>
  <li>Наставничество и понятный onboarding.</li>
  <li>Реальную практику, а не формальные поручения.</li>
  <li>Возможность перейти в штат после стажировки.</li>
</ul>`,
  },
  {
    title: 'Редактор спецпроектов и исследований',
    slug: 'special-projects-editor',
    departmentSlug: 'content-editorial',
    employmentType: 'part-time',
    workFormat: 'remote',
    location: 'Россия',
    salaryText: '80 000 - 110 000 ₽',
    publishedDate: '2026-04-03',
    lead:
      'Ищем редактора на частичную занятость для подготовки исследований, white paper и длинных экспертных материалов.',
    body: `
<p>Роль для человека, который умеет аккуратно работать с экспертным содержанием и держать высокий редакторский стандарт.</p>
<h2>Основные задачи</h2>
<ul>
  <li>Редактировать аналитические обзоры, интервью и специальные материалы.</li>
  <li>Собирать тексты из интервью, черновиков и комментариев экспертов.</li>
  <li>Поддерживать единую редакционную систему и шаблоны работы.</li>
</ul>
<h2>Требования</h2>
<ul>
  <li>Опыт в медиа, корпоративной редакции или исследовательских проектах.</li>
  <li>Хорошее чувство структуры и уверенная работа с длинными текстами.</li>
  <li>Самоорганизация и умение работать удалённо.</li>
</ul>
<h2>Условия</h2>
<ul>
  <li>Частичная занятость, гибкий график.</li>
  <li>Удалённый формат.</li>
  <li>Понятный пул задач и бережная коммуникация с командой.</li>
</ul>`,
  },
];

async function upsertDepartment(documents, payload) {
  const existing = await documents.findFirst({
    fields: ['documentId', 'slug'],
    filters: {
      slug: {
        $eq: payload.slug,
      },
    },
  });

  if (existing?.documentId) {
    await documents.update({
      documentId: existing.documentId,
      data: payload,
    });
    return {
      action: 'updated',
      documentId: existing.documentId,
      slug: payload.slug,
    };
  }

  const created = await documents.create({ data: payload });
  return {
    action: 'created',
    documentId: created.documentId,
    slug: payload.slug,
  };
}

async function upsertVacancy(documents, payload) {
  const existing = await documents.findFirst({
    fields: ['documentId', 'slug'],
    filters: {
      slug: {
        $eq: payload.slug,
      },
    },
  });

  if (existing?.documentId) {
    await documents.update({
      documentId: existing.documentId,
      data: payload,
    });
    await documents.publish({
      documentId: existing.documentId,
    });
    return {
      action: 'updated',
      documentId: existing.documentId,
      slug: payload.slug,
    };
  }

  const created = await documents.create({ data: payload });
  await documents.publish({
    documentId: created.documentId,
  });

  return {
    action: 'created',
    documentId: created.documentId,
    slug: payload.slug,
  };
}

async function main() {
  const app = await createStrapi().load();

  try {
    const departmentDocs = app.documents(DEPARTMENT_UID);
    const vacancyDocs = app.documents(VACANCY_UID);
    const departmentBySlug = new Map();
    const departmentResults = [];

    for (const payload of DEPARTMENT_PAYLOADS) {
      const result = await upsertDepartment(departmentDocs, payload);
      departmentBySlug.set(payload.slug, result.documentId);
      departmentResults.push(result);
    }

    const vacancyResults = [];

    for (const payload of VACANCY_PAYLOADS) {
      const departmentDocumentId = departmentBySlug.get(payload.departmentSlug);

      if (!departmentDocumentId) {
        throw new Error(`Department documentId not found for slug "${payload.departmentSlug}"`);
      }

      const { departmentSlug, ...rest } = payload;
      vacancyResults.push(
        await upsertVacancy(vacancyDocs, {
          ...rest,
          department: {
            documentId: departmentDocumentId,
          },
        })
      );
    }

    const createdDepartments = departmentResults.filter((item) => item.action === 'created').length;
    const updatedDepartments = departmentResults.filter((item) => item.action === 'updated').length;
    const createdVacancies = vacancyResults.filter((item) => item.action === 'created').length;
    const updatedVacancies = vacancyResults.filter((item) => item.action === 'updated').length;

    console.log(
      `[vacancies] Departments done. created=${createdDepartments}, updated=${updatedDepartments}`
    );
    console.log(
      `[vacancies] Vacancies done. created=${createdVacancies}, updated=${updatedVacancies}`
    );
    console.log(
      `[vacancies] Slugs: ${vacancyResults.map((item) => item.slug).join(', ')}`
    );
  } finally {
    await settleDocumentEvents();
    await app.destroy();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[vacancies] Seed failed: ${message}`);
  process.exit(1);
});
