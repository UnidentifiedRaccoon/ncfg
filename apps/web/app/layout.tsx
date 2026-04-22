import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { SITE_NAME, getMetadataBase } from "@/shared/lib/metadata";
import { ScrollRevealObserver } from "@/shared/ui/ScrollRevealObserver";
import { RouteScrollBehavior } from "@/shared/ui/RouteScrollBehavior";
import { YandexMetrikaRouteTracker } from "@/shared/ui/YandexMetrikaRouteTracker";
import { YandexMetrikaGoalTracker } from "@/shared/ui/YandexMetrikaGoalTracker";
import { ScrollDepthTracker } from "@/shared/ui/ScrollDepthTracker";
import { UtmCapture } from "@/shared/ui/UtmCapture";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: SITE_NAME,
  metadataBase: getMetadataBase(),
  manifest: "/manifest.webmanifest",
  openGraph: {
    siteName: SITE_NAME,
  },
  appleWebApp: {
    title: SITE_NAME,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-120.png", sizes: "120x120", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
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
        <Suspense fallback={null}>
          <RouteScrollBehavior />
        </Suspense>
        {isMetrikaEnabled ? (
          <>
            <Script id="yandex-metrika" strategy="afterInteractive">
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
            <YandexMetrikaGoalTracker />
            <ScrollDepthTracker />
            <UtmCapture />
          </>
        ) : null}
        <ScrollRevealObserver />
        {children}
      </body>
    </html>
  );
}
