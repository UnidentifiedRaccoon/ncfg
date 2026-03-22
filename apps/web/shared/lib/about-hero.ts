export const ABOUT_HERO_LEAD =
  "Проектируем и внедряем программы финансовой грамотности для регионов, бизнеса и образовательных команд. Помогаем людям и организациям принимать взвешенные финансовые решения.";

const HERO_METRIC_KEYS = [
  ["participants", "участников"],
  ["regions", "региона"],
  ["corporate_clients", "компании"],
  ["nps", "NPS программ"],
] as const;

export function pickAboutHeroMetrics(metrics: Array<{ key: string; displayValue: string }>) {
  const byKey = new Map(metrics.map((metric) => [metric.key, metric.displayValue]));

  return HERO_METRIC_KEYS.flatMap(([key, label]) => {
    const value = byKey.get(key);
    return value ? [{ value, label }] : [];
  });
}
