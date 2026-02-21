import type { Metadata } from "next";
import { Footer } from "@/widgets";
import { TeamShowcase } from "@/widgets/TeamShowcase";
import { fetchPeopleData, fetchSiteSettings } from "@/shared/api/data-provider";
import { makeFooterData } from "@/shared/lib/footer-data";

export const metadata: Metadata = {
  title: "Демо: Наша команда — 3 варианта | НЦФГ",
  description:
    "Сравнение трех визуальных концепций блока «Наша команда» в стилистике современного банкинга.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TeamShowcasePage() {
  const [siteSetting, peopleData] = await Promise.all([
    fetchSiteSettings(),
    fetchPeopleData(),
  ]);

  const teamMembers = peopleData.people.filter((person) => person.isTeam);

  return (
    <>
      <main className="bg-[#F8FAFC] pt-24 md:pt-28">
        <TeamShowcase
          title="Наша команда"
          lead="Три визуальных направления с одинаковыми данными команды: светлый премиум, темный fintech и narrative-маршрут доверия."
          members={teamMembers}
        />
      </main>
      <Footer data={makeFooterData(siteSetting)} />
    </>
  );
}
