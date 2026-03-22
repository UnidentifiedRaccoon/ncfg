export const ABOUT_HERO_LEAD =
  "Проектируем и внедряем программы финансовой грамотности для регионов, бизнеса и образовательных команд. Помогаем людям и организациям принимать взвешенные финансовые решения.";

export function pickAboutHeroMetrics(metrics: Array<{ key: string; displayValue: string }>) {
  const byKey = new Map(metrics.map((metric) => [metric.key, metric.displayValue]));

  return [
    { value: byKey.get("participants") ?? "30,2 млн", label: "участников" },
    { value: byKey.get("regions") ?? "84", label: "региона" },
    { value: byKey.get("corporate_clients") ?? "3 502", label: "компании" },
    { value: byKey.get("nps") ?? "9,63", label: "NPS программ" },
  ];
}
