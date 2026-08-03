import type { Metadata } from "next";
import { Roboto_Condensed } from "next/font/google";

import { SeasonalOfferHeroLab } from "./SeasonalOfferHeroLab";

const displayFont = Roboto_Condensed({
  variable: "--font-season-display",
  subsets: ["cyrillic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Эксперимент hero сезонного офера",
  description:
    "Пять вариантов hero для сезонных корпоративных программ финансового благополучия.",
  robots: {
    index: false,
    follow: false,
  },
};

type SeasonalOfferHeroExperimentPageProps = {
  searchParams: Promise<{
    variant?: string;
    theme?: string;
  }>;
};

export default async function SeasonalOfferHeroExperimentPage({
  searchParams,
}: SeasonalOfferHeroExperimentPageProps) {
  const params = await searchParams;
  const initialVariant =
    params.variant === "people" ||
    params.variant === "wellbeing" ||
    params.variant === "typographic" ||
    params.variant === "hybrid" ||
    params.variant === "focus"
      ? params.variant
      : undefined;
  const initialHybridTheme =
    params.theme === "cool" || params.theme === "warm" || params.theme === "blueGold"
      ? params.theme
      : undefined;

  return (
    <div className={displayFont.variable}>
      <SeasonalOfferHeroLab
        initialVariant={initialVariant}
        initialHybridTheme={initialHybridTheme}
      />
    </div>
  );
}
