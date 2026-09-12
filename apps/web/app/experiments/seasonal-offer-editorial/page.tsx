import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Редакционный Focus B — сезонный оффер",
  description:
    "Шапка сезонного оффера с тремя крупными портретами и редакционной композицией.",
  robots: { index: false, follow: false },
};

export default function SeasonalOfferEditorialPage() {
  redirect("/companies/season-offer");
}
