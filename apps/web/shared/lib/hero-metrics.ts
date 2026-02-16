export interface HeroMetricItem {
  value: string;
  label: string;
}

interface MetricInput {
  key: string;
  displayValue: string;
}

export function makeHeroMetrics(metrics: MetricInput[]): HeroMetricItem[] {
  const byKey = new Map(metrics.map((m) => [m.key, m.displayValue]));

  return [
    { value: byKey.get("participants") ?? "30,2 млн", label: "участников" },
    { value: byKey.get("regions") ?? "84", label: "региона" },
    { value: byKey.get("corporate_clients") ?? "3 502", label: "клиента" },
    { value: byKey.get("nps") ?? "9,63", label: "NPS программ" },
  ];
}

