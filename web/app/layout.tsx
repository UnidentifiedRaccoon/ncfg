import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SmoothAnchor } from "@/shared/ui/SmoothAnchor";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "НЦФГ — Национальный центр финансовой грамотности",
  description:
    "Более 20 лет реализуем проекты по финансовой грамотности. 30 миллионов участников, 84 региона, программы для компаний и частных лиц.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "НЦФГ — Национальный центр финансовой грамотности",
    description:
      "Более 20 лет реализуем проекты по финансовой грамотности. 30 миллионов участников, 84 региона.",
    locale: "ru_RU",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} font-sans antialiased`}>
        <SmoothAnchor />
        {children}
      </body>
    </html>
  );
}
