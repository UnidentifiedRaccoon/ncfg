import type { Metadata } from "next";
import { buildPageMetadata } from "@/shared/lib/metadata";
import { HomePageContent } from "@/app/_components/HomePageContent";

export const revalidate = 0;

export const metadata: Metadata = buildPageMetadata({
  path: "/",
  title: "Национальный центр финансовой грамотности - официальный сайт",
  description:
    "Национальный центр финансовой грамотности (НЦФГ): программы финансовой грамотности, финансового благополучия и обучения для компаний и частных лиц.",
});

export default function Home() {
  return <HomePageContent />;
}
