type LegacyPathResolution =
  | { type: "redirect"; destinationPath: string }
  | { type: "gone" };

const LEGACY_EXACT_REDIRECTS: Readonly<Record<string, string>> = {
  "/about-us": "/about",
  "/agreement": "/polzovatelskoe-soglashenie",
  "/articles": "/blog",
  "/chastnym-litsam": "/individuals",
  "/clients-partners": "/companies",
  "/klienty": "/companies",
  "/klienty-partnery": "/companies",
  "/kompaniyam": "/companies",
  "/news": "/blog",
  "/novosti": "/blog",
  "/o-tsentre": "/about",
  "/partnery": "/companies",
  "/politika-konfidentsialnosti": "/politika-konfidencialnosti",
  "/privacy": "/politika-konfidencialnosti",
  "/privacy-policy": "/politika-konfidencialnosti",
  "/recommendation": "/rekomendacii",
  "/recommendations": "/rekomendacii",
  "/service": "/companies",
  "/services": "/companies",
  "/sitemap-index.xml": "/sitemap.xml",
  "/sitemap_index.xml": "/sitemap.xml",
  "/stati": "/blog",
  "/terms": "/polzovatelskoe-soglashenie",
  "/uslugi": "/companies",
  "/user-agreement": "/polzovatelskoe-soglashenie",
};

const LEGACY_PREFIX_REDIRECTS = [
  { sourcePrefix: "/articles/", destinationPrefix: "/blog/" },
  { sourcePrefix: "/company/", destinationPrefix: "/companies/" },
  { sourcePrefix: "/news/", destinationPrefix: "/blog/" },
  { sourcePrefix: "/novosti/", destinationPrefix: "/blog/" },
  { sourcePrefix: "/services/", destinationPrefix: "/companies/" },
  { sourcePrefix: "/stati/", destinationPrefix: "/blog/" },
  { sourcePrefix: "/uslugi/", destinationPrefix: "/companies/" },
] as const;

const LEGACY_GONE_EXACT = new Set<string>([
  "/atom.xml",
  "/feed",
  "/rss",
  "/wp-login.php",
  "/xmlrpc.php",
]);

const LEGACY_GONE_PREFIXES = ["/wp-admin"] as const;

const LEGACY_COMPANY_SERVICE_SLUG_REDIRECTS: Readonly<Record<string, string>> = {
  // Legacy services used in historical content exports.
  "brochures-and-presentations": "informatsionnye-broshyury-i-prezentatsii",
  brochures_and_presentations: "informatsionnye-broshyury-i-prezentatsii",
  "challenges-and-marathons": "marafony-i-chellendzhi-dlya-razvitiya-navykov",
  challenges_and_marathons: "marafony-i-chellendzhi-dlya-razvitiya-navykov",
  "course-development": "razrabotka-kursov-po-finansovoy-gramotnosti",
  course_development: "razrabotka-kursov-po-finansovoy-gramotnosti",
  "expert-articles": "avtorskie-stati-ekspertov-ntsfg",
  expert_articles: "avtorskie-stati-ekspertov-ntsfg",
  "financial-diagnostics": "finansovaya-diagnostika",
  financial_diagnostics: "finansovaya-diagnostika",
  "integrated-program": "kompleksnaya-programma",
  integrated_program: "kompleksnaya-programma",
  "kids-programs-for-employees": "obuchenie-detey-sotrudnikov",
  kids_programs_for_employees: "obuchenie-detey-sotrudnikov",
  "mass-events-management":
    "organizatsiya-i-moderatsiya-massovyh-meropriyatiy-po-razvitiyu-finansovoy-gramotnosti-i-kultury",
  mass_events_management:
    "organizatsiya-i-moderatsiya-massovyh-meropriyatiy-po-razvitiyu-finansovoy-gramotnosti-i-kultury",
  "public-talks":
    "lektsii-i-vystupleniya-ekspertov-ntsfg-na-publichnyh-meropriyatiyah",
  public_talks: "lektsii-i-vystupleniya-ekspertov-ntsfg-na-publichnyh-meropriyatiyah",
  "webinar-cycles": "tsikl-vebinarov-i-treningov",
  webinar_cycles: "tsikl-vebinarov-i-treningov",
};

function normalizePathname(pathname: string): string {
  const trimmed = pathname.trim().toLowerCase();
  if (!trimmed) {
    return "/";
  }

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const normalizedSlashes = withLeadingSlash.replace(/\/{2,}/g, "/");

  if (normalizedSlashes.length > 1 && normalizedSlashes.endsWith("/")) {
    return normalizedSlashes.slice(0, -1);
  }

  return normalizedSlashes;
}

function resolveCompanySlugRedirect(pathname: string): string | null {
  if (!pathname.startsWith("/companies/")) {
    return null;
  }

  const slug = pathname.slice("/companies/".length);
  if (!slug || slug.includes("/")) {
    return null;
  }

  const mappedSlug = LEGACY_COMPANY_SERVICE_SLUG_REDIRECTS[slug];
  if (mappedSlug) {
    return `/companies/${mappedSlug}`;
  }

  if (slug.includes("_")) {
    return `/companies/${slug.replace(/_/g, "-")}`;
  }

  return null;
}

function normalizeDestinationPath(pathname: string): string {
  const normalized = normalizePathname(pathname);
  const companySlugRedirect = resolveCompanySlugRedirect(normalized);
  return companySlugRedirect ?? normalized;
}

export function resolveLegacyPath(pathname: string): LegacyPathResolution | null {
  const normalizedPath = normalizePathname(pathname);

  if (LEGACY_GONE_EXACT.has(normalizedPath)) {
    return { type: "gone" };
  }

  for (const prefix of LEGACY_GONE_PREFIXES) {
    if (normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)) {
      return { type: "gone" };
    }
  }

  const companySlugRedirect = resolveCompanySlugRedirect(normalizedPath);
  if (companySlugRedirect && companySlugRedirect !== normalizedPath) {
    return { type: "redirect", destinationPath: companySlugRedirect };
  }

  const exactRedirect = LEGACY_EXACT_REDIRECTS[normalizedPath];
  if (exactRedirect) {
    const destinationPath = normalizeDestinationPath(exactRedirect);
    if (destinationPath !== normalizedPath) {
      return { type: "redirect", destinationPath };
    }
  }

  for (const rule of LEGACY_PREFIX_REDIRECTS) {
    if (!normalizedPath.startsWith(rule.sourcePrefix)) {
      continue;
    }

    const suffix = normalizedPath.slice(rule.sourcePrefix.length);
    const candidatePath = `${rule.destinationPrefix}${suffix}`;
    const destinationPath = normalizeDestinationPath(candidatePath);

    if (destinationPath !== normalizedPath) {
      return { type: "redirect", destinationPath };
    }
  }

  return null;
}
