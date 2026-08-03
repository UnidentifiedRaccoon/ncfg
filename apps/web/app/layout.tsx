import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { SITE_NAME, getMetadataBase } from "@/shared/lib/metadata";
import { CmsFreshnessGuard } from "@/shared/ui/CmsFreshnessGuard";
import { ScrollRevealObserver } from "@/shared/ui/ScrollRevealObserver";
import { RouteScrollBehavior } from "@/shared/ui/RouteScrollBehavior";
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
  return (
    <html lang="ru">
      <body className={`${inter.variable} font-sans antialiased`}>
        <CmsFreshnessGuard />
        <Suspense fallback={null}>
          <RouteScrollBehavior />
        </Suspense>
        <ScrollRevealObserver />
        {children}
      </body>
    </html>
  );
}
