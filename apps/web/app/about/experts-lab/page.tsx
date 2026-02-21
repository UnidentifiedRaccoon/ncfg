import type { Metadata } from "next";
import { Footer } from "@/widgets";
import { ExpertsLab, type ExpertsLabItem } from "@/widgets/ExpertsLab";
import { fetchPeopleData, fetchSiteSettings } from "@/shared/api/data-provider";
import { makeFooterData } from "@/shared/lib/footer-data";

export const metadata: Metadata = {
  title: "Лаборатория экспертов — НЦФГ",
  description:
    "Сравнение трех визуальных концептов блока «Наши эксперты» для страницы о центре.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function cropTag(value: string, maxLength: number = 32): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3).trim()}...`;
}

function pickTags(subtitle: string): string[] {
  const tokens = normalizeWhitespace(subtitle)
    .split(/[,.;]/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .map((token) => cropTag(token));

  if (tokens.length === 0) {
    return ["Финансовая экспертиза"];
  }

  return tokens.slice(0, 3);
}

function toExpertsLabItems(
  people: Awaited<ReturnType<typeof fetchPeopleData>>["people"]
): ExpertsLabItem[] {
  return people
    .filter((person) => person.isExpert && !person.isTeam && (person.headline || person.position))
    .map((person) => {
      const subtitle = normalizeWhitespace(person.headline ?? person.position ?? "");

      return {
        id: person.id,
        fullName: person.fullName,
        photoUrl: person.photoUrl,
        subtitle,
        experienceYears: person.experienceYears,
        tags: pickTags(subtitle),
      };
    });
}

export default async function ExpertsLabPage() {
  const [peopleData, siteSetting] = await Promise.all([
    fetchPeopleData(),
    fetchSiteSettings(),
  ]);

  const experts = toExpertsLabItems(peopleData.people);

  return (
    <>
      <main>
        <ExpertsLab items={experts} />
      </main>
      <Footer data={makeFooterData(siteSetting)} />
    </>
  );
}
