"use client";

import { notFound, useParams } from "next/navigation";
import type { DiagnosticPublicQuestion } from "@/shared/api/types/diagnostic";
import { DiagnosticSurvey } from "@/features/diagnostics";

const MOCK_QUESTIONS: DiagnosticPublicQuestion[] = [
  {
    key: "q1",
    title: "Как вы оцениваете текущий уровень финансовой грамотности в вашей организации?",
    description: "Выберите вариант, наиболее точно описывающий ситуацию.",
    order: 1,
    options: [
      { key: "q1_a", label: "Высокий — сотрудники хорошо разбираются в базовых финансовых инструментах", order: 1 },
      { key: "q1_b", label: "Средний — есть базовые знания, но не хватает системного подхода", order: 2 },
      { key: "q1_c", label: "Низкий — большинство сотрудников не имеют финансовой подготовки", order: 3 },
      { key: "q1_d", label: "Затрудняюсь ответить", order: 4 },
    ],
  },
  {
    key: "q2",
    title: "Какие форматы обучения наиболее востребованы?",
    description: null,
    order: 2,
    options: [
      { key: "q2_a", label: "Очные семинары и тренинги", order: 1 },
      { key: "q2_b", label: "Онлайн-курсы и вебинары", order: 2 },
      { key: "q2_c", label: "Индивидуальные консультации", order: 3 },
      { key: "q2_d", label: "Смешанный формат", order: 4 },
    ],
  },
  {
    key: "q3",
    title: "Используются ли в организации программы финансового планирования?",
    description: "Имеется в виду: бюджетирование, инвестиционное планирование, управление рисками.",
    order: 3,
    options: [
      { key: "q3_a", label: "Да, регулярно применяются", order: 1 },
      { key: "q3_b", label: "Есть отдельные инициативы, но без системного подхода", order: 2 },
      { key: "q3_c", label: "Нет, таких программ пока нет", order: 3 },
    ],
  },
  {
    key: "q4",
    title: "Готова ли организация выделить ресурсы на развитие финансовой культуры?",
    description: null,
    order: 4,
    options: [
      { key: "q4_a", label: "Да, это приоритетная задача", order: 1 },
      { key: "q4_b", label: "Возможно, при наличии чёткого плана", order: 2 },
      { key: "q4_c", label: "Скорее нет — ресурсы ограничены", order: 3 },
      { key: "q4_d", label: "Нет, это не актуально", order: 4 },
    ],
  },
  {
    key: "q5",
    title: "Какой результат вы ожидаете от диагностики?",
    description: null,
    order: 5,
    options: [
      { key: "q5_a", label: "Получить объективную оценку текущего состояния", order: 1 },
      { key: "q5_b", label: "Определить направления для развития", order: 2 },
      { key: "q5_c", label: "Подготовить обоснование для руководства", order: 3 },
    ],
  },
];

const CAMPAIGN_TITLE = "Диагностика финансовой грамотности";
const ORGANIZATION_NAME = "Демо-организация";
const TEST_TITLE = "Финансовая грамотность";

export default function DemoVariantPage() {
  const params = useParams<{ variant: string }>();

  if (params.variant !== "dark") {
    notFound();
  }

  return (
    <DiagnosticSurvey
      campaignSlug="demo"
      campaignTitle={CAMPAIGN_TITLE}
      organizationName={ORGANIZATION_NAME}
      testTitle={TEST_TITLE}
      questions={MOCK_QUESTIONS}
      demoMode
    />
  );
}
