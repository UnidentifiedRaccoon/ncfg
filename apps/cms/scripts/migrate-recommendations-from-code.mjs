#!/usr/bin/env node

import process from 'node:process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createStrapi } = require('@strapi/strapi');

const LEMANA_EXPANDED_QUOTE = `В компании Лемана ПРО программа финансового благополучия стала ключевым элементом корпоративной культуры и заботы о сотрудниках. Мы выстраиваем системный подход, в котором сочетаются диагностика финансового здоровья, выявление рисков и развитие финансовой грамотности разных целевых групп. Особое внимание уделяем финансовой культуре семьи, создавая обучающие и игровые форматы для детей сотрудников.

Помимо образовательных программ, в нашей экосистеме действуют практические инструменты, интегрированные в бизнес-процессы компании. Мы развиваем авторские решения, создаваемые самими сотрудниками, активно используем аналитику и регулярно обновляем мотивационные программы на основе данных и обратной связи.

Работа по финансовому благополучию строится с учетом актуальных трендов и потребностей команды. Мы анализируем финансовые задачи разных сегментов, помогаем снижать риски и формировать осознанное отношение к деньгам. Сотрудничество с Национальным центром финансовой грамотности, которое продолжается с 2022 года, стало основой нашего профессионального роста - мы ценим экспертизу, инновационный подход и вовлеченность партнеров.

В 2024 году наша программа заняла второе место в конкурсе EWA, была представлена на заседаниях РСПП, Министерства финансов и Московском финансовом форуме, где получила признание как пример современного подхода к поддержке финансового благополучия сотрудников.

Мы гордимся достигнутыми результатами и продолжаем развивать направление, помогая людям чувствовать уверенность в финансовых решениях и повышать качество жизни.

Екатерина Холодкова
Руководитель проектов по повышению благополучия и укреплению здоровья сотрудников

Подробнее о программе в Лемана ПРО - в интервью на сайте культура-денег.рф (https://xn----7sbkdfa4aiwzvkc8j.xn--p1ai/lemana)`;

const RECOMMENDATION_SEED_PAYLOADS = [
  {
    slug: 'lemana-pro',
    company: 'Лемана ПРО',
    quote:
      '«В компании Лемана ПРО программа финансового благополучия стала ключевым элементом корпоративной культуры и заботы о сотрудниках. Мы выстраиваем системный подход, в котором сочетаются диагностика финансового здоровья, выявление рисков и развитие финансовой грамотности разных целевых групп. Особое внимание уделяем финансовой культуре семьи, создавая обучающие и игровые форматы для детей сотрудников».',
    fullQuote: LEMANA_EXPANDED_QUOTE,
    logoImg: null,
    sourceLink: null,
    order: 10,
  },
  {
    slug: 'mts-bank',
    company: 'МТС Банк',
    quote:
      '«ПАО «МТС Банк» благодарит коллектив Национального центра финансовой грамотности за высокий уровень профессионализма в организации проектов «V Всероссийская неделя финансовой грамотности для детей и молодежи» и «VI Всероссийская неделя сбережений» для взрослого населения. Мы высоко ценим надежные партнерские связи, сложившиеся за время нашего плодотворного сотрудничества».',
    fullQuote: null,
    logoImg: '/data/clients/22/image.png',
    sourceLink: null,
    order: 20,
  },
  {
    slug: 'mars',
    company: 'Mars',
    quote:
      '«На данный момент наша задача — сделать доступным данное обучение абсолютно для всех наших сотрудников, включая тех, кто работает на фабриках. Мы ищем подходящий канал коммуникации данных материалов и тестируем разные форматы обучения, с фокусом на онлайн. Есть очень большой интерес к этой теме, особенно к блоку про инвестирование. Поэтому мы обязательно будем продолжать повышать уровень финансовой грамотности наших сотрудников».',
    fullQuote: null,
    logoImg: '/data/clients/7/image.png',
    sourceLink: null,
    order: 30,
  },
];

async function upsertRecommendation(documents, payload) {
  const existing = await documents.findFirst({
    filters: { slug: { $eq: payload.slug } },
    fields: ['documentId', 'slug'],
  });

  if (existing?.documentId) {
    await documents.update({
      documentId: existing.documentId,
      data: payload,
    });
    await documents.publish({ documentId: existing.documentId });
    return { action: 'updated', slug: payload.slug };
  }

  const created = await documents.create({ data: payload });
  await documents.publish({ documentId: created.documentId });
  return { action: 'created', slug: payload.slug };
}

async function main() {
  const app = await createStrapi().load();

  try {
    const documents = app.documents('api::recommendation.recommendation');
    const results = [];

    for (const payload of RECOMMENDATION_SEED_PAYLOADS) {
      results.push(await upsertRecommendation(documents, payload));
    }

    const created = results.filter((result) => result.action === 'created').length;
    const updated = results.filter((result) => result.action === 'updated').length;

    console.log(`[recommendations] Done. created=${created}, updated=${updated}`);
    console.log(`[recommendations] Slugs: ${results.map((result) => result.slug).join(', ')}`);
  } finally {
    await app.destroy();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[recommendations] Migration failed: ${message}`);
  process.exit(1);
});
