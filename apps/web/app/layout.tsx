import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import { SmoothAnchor } from "@/shared/ui/SmoothAnchor";
import { YandexMetrikaRouteTracker } from "@/shared/ui/YandexMetrikaRouteTracker";
import { Header } from "@/widgets";
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
  const ymCounterId = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID);
  const isMetrikaEnabled =
    process.env.NODE_ENV === "production" &&
    Number.isFinite(ymCounterId) &&
    ymCounterId > 0;

  return (
    <html lang="ru">
      <body className={`${inter.variable} font-sans antialiased`}>
        {isMetrikaEnabled ? (
          <>
            <Script id="yandex-metrika" strategy="beforeInteractive">
              {`
(function(m,e,t,r,i,k,a){
  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();
  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${ymCounterId}', 'ym');

ym(${ymCounterId}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
              `.trim()}
            </Script>
            <noscript>
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://mc.yandex.ru/watch/${ymCounterId}`}
                  className="absolute left-[-9999px]"
                  alt=""
                />
              </div>
            </noscript>
            <YandexMetrikaRouteTracker counterId={ymCounterId} />
          </>
        ) : null}
        <SmoothAnchor />
        <Header variant="dock" />
        {children}
      </body>
    </html>
  );
}
