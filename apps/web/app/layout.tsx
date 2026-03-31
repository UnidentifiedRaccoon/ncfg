import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { getMetadataBase } from "@/shared/lib/metadata";
import { ScrollRevealObserver } from "@/shared/ui/ScrollRevealObserver";
import { SmoothAnchor } from "@/shared/ui/SmoothAnchor";
import { YandexMetrikaRouteTracker } from "@/shared/ui/YandexMetrikaRouteTracker";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
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
            <Suspense fallback={null}>
              <YandexMetrikaRouteTracker counterId={ymCounterId} />
            </Suspense>
          </>
        ) : null}
        <SmoothAnchor />
        <ScrollRevealObserver />
        {children}
      </body>
    </html>
  );
}
