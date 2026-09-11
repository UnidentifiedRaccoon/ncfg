import type { PlanId, ResponseId } from "./types";

export const sessionSteps = ["Начало", "Первый план", "Новое условие", "Новый план", "Разбор"] as const;
export const sessionBudget = 100;
export const preparationCost = 20;

export const players = {
  anna: {
    id: "anna",
    number: 1,
    name: "Анна",
    priority: "За развитие",
    motivation: "Отвечает за запуск: хочет проверить спрос и получить первые заказы.",
    firstProposal: "Проверить спрос можно пилотом за 40.",
    revisedProposal: "Можно начать с теста предзаказов за 20.",
  },
  mikhail: {
    id: "mikhail",
    number: 2,
    name: "Михаил",
    priority: "За резерв",
    motivation: "Отвечает за расходы: хочет оставить 60 на аренду и непредвиденные траты.",
    firstProposal: "Готов начать, если оставим запас 60.",
    revisedProposal: "Давайте обсудим, какой запас останется.",
  },
} as const;

export const plans = [
  { id: "launch", title: "Полный запуск", amount: 60, response: "Анна сможет запустить мастерскую, но в резерве останется 40. Михаилу важно обсудить недостающие 20." },
  { id: "pilot", title: "Небольшой пилот", amount: 40, response: "Анна сможет проверить спрос, а Михаил — оставить 60 в резерве. План учитывает интересы обоих игроков." },
  { id: "wait", title: "Отложить запуск", amount: 0, response: "Михаил сохраняет весь бюджет, но Анна пока не начнёт проект. Нужен повод и срок для возвращения к плану." },
] as const;

export const responses = [
  { id: "continue", title: "Оплатить подготовку и запустить проект" },
  { id: "reduce", title: "Начать с теста предзаказов" },
  { id: "pause", title: "Взять паузу и уточнить условия" },
] as const;

export const reflections = [
  { id: "conditions", title: "Уточнять условия до договорённости", text: "Первый расчёт не включал подготовку помещения. Какие ещё вопросы стоило задать до выбора плана?" },
  { id: "interests", title: "Услышать интерес другого игрока", text: "Анне важно проверить спрос, Михаилу — иметь запас на расходы. Как выбранный план учитывает интересы каждого?" },
  { id: "revision", title: "Пересматривать решение вместе", text: "Новое условие изменило расчёт. По какому правилу вы будете возвращаться к договорённости в следующем раунде?" },
] as const;

export function getOutcome(planId: PlanId, responseId: ResponseId) {
  const plan = plans.find(item => item.id === planId)!;
  const activityCost = responseId === "pause" ? 0 : responseId === "reduce" ? 20 : plan.amount || 40;
  const preparation = responseId === "pause" ? 0 : preparationCost;
  const spent = activityCost + preparation;
  return {
    activityCost,
    preparation,
    spent,
    reserve: sessionBudget - spent,
    title: responseId === "pause" ? "Пауза с открытым вопросом" : responseId === "reduce" ? planId === "wait" ? "Решили начать с предзаказов" : "Первый шаг стал меньше" : "Запуск потребовал больше денег",
    development: responseId === "pause"
      ? "Анна пока откладывает запуск. Договоритесь, какую информацию нужно получить и когда снова собраться."
      : responseId === "reduce"
        ? "Анна сможет проверить спрос через предзаказы. Полный запуск ещё впереди."
        : planId === "launch" ? "Анна запускает мастерскую в полном объёме." : "Анна начинает пилот: можно проверить спрос на небольшом объёме.",
    reserveComment: responseId === "pause"
      ? "Общий резерв — все 100, как и хотел Михаил. Ни оборудование, ни подготовка пока не оплачены."
      : responseId === "reduce"
        ? "Общий резерв — 60: ориентир Михаила сохранён."
        : `В резерве ${sessionBudget - spent} — на ${60 - (sessionBudget - spent)} меньше, чем хотел Михаил. Такой запас нужно согласовать с ним.`,
  };
}
