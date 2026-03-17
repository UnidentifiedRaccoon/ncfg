#!/usr/bin/env node

import process from "node:process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createStrapi } = require("@strapi/strapi");

const TEST_UID = "api::diagnostic-test.diagnostic-test";
const ORGANIZATION_UID = "api::diagnostic-organization.diagnostic-organization";
const CAMPAIGN_UID = "api::diagnostic-campaign.diagnostic-campaign";

const TEST_PAYLOAD = {
  code: "financial-wellbeing",
  version: 1,
  title: "Диагностика финансового благополучия",
  questions: [
    {
      key: "q1",
      title: "У вас есть финансовые цели и стратегия их достижения?",
      description: null,
      order: 1,
      options: [
        { key: "1", label: "Нет (не знаю, как это сделать)", weight: 0, order: 1 },
        { key: "2", label: "Да, на ближайшие 1-3 месяца", weight: 3, order: 2 },
        { key: "3", label: "Да, на ближайший год", weight: 5, order: 3 },
        { key: "4", label: "Да, есть финансовые цели на 3 года", weight: 7, order: 4 },
        {
          key: "5",
          label:
            "Да, финансовые цели определены более, чем на 10 лет вперед (включая пенсию)",
          weight: 10,
          order: 5,
        },
      ],
    },
    {
      key: "q2",
      title:
        "Вы ведете семейный бюджет (планируете, контролируете и анализируете доходы и расходы)?",
      description: null,
      order: 2,
      options: [
        { key: "6", label: "Нет (не знаю, как это сделать)", weight: 0, order: 1 },
        { key: "7", label: "Да, на ближайшую неделю", weight: 2, order: 2 },
        { key: "8", label: "Да, на ближайший месяц", weight: 5, order: 3 },
        { key: "9", label: "Да, на ближайший год", weight: 10, order: 4 },
      ],
    },
    {
      key: "q3",
      title:
        "Вы работаете над улучшением своего бюджета (рост доходов и оптимизация расходов)?",
      description: null,
      order: 3,
      options: [
        { key: "13", label: "Нет (не знаю, как это сделать)", weight: 0, order: 1 },
        { key: "14", label: "Да, иногда пытаюсь экономить", weight: 5, order: 2 },
        {
          key: "15",
          label:
            "Да, регулярно оптимизирую расходы и ищу дополнительные доходы (например, делаю налоговые вычеты)",
          weight: 10,
          order: 3,
        },
      ],
    },
    {
      key: "q4",
      title:
        "У вас есть финансовый резерв (подушка безопасности для непредвиденные расходы или в случае временной потери дохода)?",
      description: null,
      order: 4,
      options: [
        { key: "26", label: "У меня нет финансового резерва", weight: 0, order: 1 },
        { key: "27", label: "Есть запас денег на 1-2 месяца", weight: 2, order: 2 },
        { key: "28", label: "Есть резерв примерно на 3-6 месяцев жизни", weight: 5, order: 3 },
        { key: "47", label: "Есть резерв на 10 месяцев и больше", weight: 10, order: 4 },
      ],
    },
    {
      key: "q5",
      title: "У вас есть полисы страхования жизни и здоровья?",
      description: null,
      order: 5,
      options: [
        { key: "10", label: "Нет, никаких полисов страхования нет", weight: 0, order: 1 },
        {
          key: "11",
          label: "Есть, только полисы обязательного страхования (например, ОСАГО)",
          weight: 2,
          order: 2,
        },
        {
          key: "12",
          label: "Есть, моя страховка защищает мое имущество (дом, машину и пр.)",
          weight: 5,
          order: 3,
        },
        {
          key: "48",
          label:
            "Есть, моя страховка защищает ключевые риски: имущество, жизнь и здоровья, ответственность перед другими людьми за причиненный им ущерб",
          weight: 10,
          order: 4,
        },
      ],
    },
    {
      key: "q6",
      title: "Удается ли вам сберегать и/или инвестировать часть доходов?",
      description: null,
      order: 6,
      options: [
        {
          key: "21",
          label: "Не удается, не умею и не знаю как это делать",
          weight: 0,
          order: 1,
        },
        {
          key: "22",
          label: "Иногда сберегаю и/или инвестирую (нерегулярно, несколько раз в год)",
          weight: 2,
          order: 2,
        },
        {
          key: "23",
          label: "Регулярно сберегаю и/или инвестирую 5-10% от каждого дохода",
          weight: 5,
          order: 3,
        },
        {
          key: "24",
          label: "Регулярно сберегаю и/или инвестирую до 20% от дохода",
          weight: 7,
          order: 4,
        },
        {
          key: "25",
          label: "Регулярно сберегаю и/или инвестирую более 20% от дохода",
          weight: 10,
          order: 5,
        },
      ],
    },
    {
      key: "q7",
      title: "Сколько денег уходит на ваши кредиты и долги?",
      description: null,
      order: 7,
      options: [
        { key: "18", label: "Отдаю более половины доходов семьи", weight: 0, order: 1 },
        { key: "19", label: "Отдаю 30 - 50% от доходов семьи", weight: 2, order: 2 },
        { key: "46", label: "Отдаю не более 20% от доходов семьи", weight: 5, order: 3 },
        { key: "20", label: "Кредитов и долгов нет", weight: 10, order: 4 },
      ],
    },
    {
      key: "q8",
      title:
        "Что вы чувствуете, когда думаете о деньгах и своем финансовом положении прямо сейчас?",
      description: null,
      order: 8,
      options: [
        { key: "29", label: "Страх будущего, стресс, опасения, тревога", weight: 0, order: 1 },
        { key: "30", label: "Равнодушие, не вижу будущего, апатия", weight: 2, order: 2 },
        { key: "31", label: "Безопасность, стабильность, реализм", weight: 5, order: 3 },
        { key: "32", label: "Самореализация, уверенность, комфорт", weight: 10, order: 4 },
      ],
    },
    {
      key: "q9",
      title:
        "Вы обсуждаете финансовые вопросы (с партнерами, детьми, финансовыми консультантами)",
      description: null,
      order: 9,
      options: [
        {
          key: "34",
          label: "Нет, стараюсь без крайней необходимости этого не делать",
          weight: 0,
          order: 1,
        },
        {
          key: "35",
          label:
            "Пробую наладить диалог с близким окружением (партнер, дети, семья)",
          weight: 5,
          order: 2,
        },
        {
          key: "36",
          label: "Да, уверенно и отрыто регулярно открыто обсуждаю",
          weight: 10,
          order: 3,
        },
      ],
    },
    {
      key: "q10",
      title:
        "Вы регулярно занимаетесь своим финансовым развитием (читаю новости, книги, блоги, смотрю курсы, работаю с консультантами и пр.)",
      description: null,
      order: 10,
      options: [
        {
          key: "39",
          label: "Нет, нет возможности, времени, желания",
          weight: 0,
          order: 1,
        },
        {
          key: "40",
          label: "Да, иногда пару раз в год пробую",
          weight: 5,
          order: 2,
        },
        {
          key: "41",
          label: "Да, ежемесячно уделяю внимание своему финансовому развитию",
          weight: 10,
          order: 3,
        },
      ],
    },
  ],
};

const ORGANIZATION_PAYLOAD = {
  name: "Тестовая организация",
};

const CAMPAIGN_PAYLOAD = {
  title: "Демо-диагностика финансового благополучия",
  slug: "demo-financial-wellbeing",
  isActive: true,
  startsAt: null,
  endsAt: null,
};

async function settleDocumentEvents() {
  // Strapi schedules document lifecycle work after transaction commit.
  // A short drain avoids false-negative shutdown errors in one-off seed scripts.
  await new Promise((resolve) => {
    setTimeout(resolve, 250);
  });
}

async function upsertTest(documents, payload) {
  const existing = await documents.findFirst({
    fields: ["documentId", "code", "version"],
    filters: {
      code: {
        $eq: payload.code,
      },
      version: {
        $eq: payload.version,
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
    return { action: "updated", documentId: existing.documentId };
  }

  const created = await documents.create({ data: payload });
  await documents.publish({
    documentId: created.documentId,
  });

  return { action: "created", documentId: created.documentId };
}

async function upsertOrganization(documents, payload) {
  const existing = await documents.findFirst({
    fields: ["documentId", "name"],
    filters: {
      name: {
        $eq: payload.name,
      },
    },
  });

  if (existing?.documentId) {
    await documents.update({
      documentId: existing.documentId,
      data: payload,
    });
    return { action: "updated", documentId: existing.documentId };
  }

  const created = await documents.create({ data: payload });
  return { action: "created", documentId: created.documentId };
}

async function upsertCampaign(documents, payload, organizationDocumentId, testDocumentId) {
  const data = {
    ...payload,
    organization: { documentId: organizationDocumentId },
    test: { documentId: testDocumentId },
  };

  const existing = await documents.findFirst({
    fields: ["documentId", "slug"],
    filters: {
      slug: {
        $eq: payload.slug,
      },
    },
  });

  if (existing?.documentId) {
    await documents.update({
      documentId: existing.documentId,
      data,
    });
    await documents.publish({
      documentId: existing.documentId,
    });
    return { action: "updated", documentId: existing.documentId };
  }

  const created = await documents.create({ data });
  await documents.publish({
    documentId: created.documentId,
  });

  return { action: "created", documentId: created.documentId };
}

async function main() {
  const app = await createStrapi().load();

  try {
    const testDocuments = app.documents(TEST_UID);
    const organizationDocuments = app.documents(ORGANIZATION_UID);
    const campaignDocuments = app.documents(CAMPAIGN_UID);

    const test = await upsertTest(testDocuments, TEST_PAYLOAD);
    const organization = await upsertOrganization(
      organizationDocuments,
      ORGANIZATION_PAYLOAD
    );
    const campaign = await upsertCampaign(
      campaignDocuments,
      CAMPAIGN_PAYLOAD,
      organization.documentId,
      test.documentId
    );

    console.log(`[diagnostics-demo] test ${test.action}: ${test.documentId}`);
    console.log(
      `[diagnostics-demo] organization ${organization.action}: ${organization.documentId}`
    );
    console.log(
      `[diagnostics-demo] campaign ${campaign.action}: ${campaign.documentId}`
    );
    console.log(
      `[diagnostics-demo] public url: /diagnostika/${CAMPAIGN_PAYLOAD.slug}`
    );
  } finally {
    await settleDocumentEvents();
    await app.destroy();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[diagnostics-demo] failed: ${message}`);
  process.exit(1);
});
