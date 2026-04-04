import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/shared/lib/metadata";

const isPreview = process.env.DEPLOY_ENV === "preview";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  const sitemapUrl = new URL("/sitemap.xml", `${siteUrl}/`).toString();

  if (isPreview) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
      sitemap: sitemapUrl,
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: sitemapUrl,
  };
}
