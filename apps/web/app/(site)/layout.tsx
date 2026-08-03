import Script from "next/script";
import { Suspense } from "react";

import { Header } from "@/widgets";
import { ScrollDepthTracker } from "@/shared/ui/ScrollDepthTracker";
import { UtmCapture } from "@/shared/ui/UtmCapture";
import { YandexMetrikaGoalTracker } from "@/shared/ui/YandexMetrikaGoalTracker";
import { YandexMetrikaRouteTracker } from "@/shared/ui/YandexMetrikaRouteTracker";

export default function SiteLayout({
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
    <>
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
      <Header />
      {children}
    </>
  );
}
