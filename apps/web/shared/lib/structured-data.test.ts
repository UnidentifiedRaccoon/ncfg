import assert from "node:assert/strict";
import test from "node:test";
import {
  buildBlogPostingStructuredData,
  buildBreadcrumbList,
  buildFAQPageStructuredData,
  buildOrganizationStructuredData,
  buildWebsiteStructuredData,
} from "./structured-data";

function withSiteUrl(siteUrl: string, run: () => void) {
  const previousSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = siteUrl;

  try {
    run();
  } finally {
    if (previousSiteUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = previousSiteUrl;
    }
  }
}

test("buildWebsiteStructuredData returns the expected homepage website schema", () => {
  withSiteUrl("https://ncfg.ru", () => {
    assert.deepEqual(buildWebsiteStructuredData(), {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://ncfg.ru/#website",
      name: "Национальный центр финансовой грамотности",
      alternateName: ["НЦФГ", "ncfg.ru"],
      url: "https://ncfg.ru/",
    });
  });
});

test("buildOrganizationStructuredData includes legal name, contacts, sameAs, and address", () => {
  withSiteUrl("https://ncfg.ru", () => {
    assert.deepEqual(
      buildOrganizationStructuredData({
        organizationFullName:
          "Автономная Некоммерческая Организация «Национальный центр финансовой грамотности» (АНО «НЦФГ»)",
        organizationShortName: "НЦФГ",
        contactsPhone: "+7 (499) 501-11-73",
        contactsEmail: "info@finzdorov.pro",
        socialLinks: [
          { href: "https://vk.com/ncfingram" },
          { href: "https://t.me/wellf_club" },
        ],
      }),
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": "https://ncfg.ru/#organization",
        name: "Национальный центр финансовой грамотности",
        legalName:
          "Автономная Некоммерческая Организация «Национальный центр финансовой грамотности» (АНО «НЦФГ»)",
        alternateName: ["НЦФГ"],
        url: "https://ncfg.ru/",
        logo: {
          "@type": "ImageObject",
          url: "https://ncfg.ru/logo.svg",
        },
        telephone: "+7 (499) 501-11-73",
        email: "info@finzdorov.pro",
        sameAs: ["https://vk.com/ncfingram", "https://t.me/wellf_club"],
        address: {
          "@type": "PostalAddress",
          postalCode: "125239",
          addressLocality: "Москва",
          streetAddress: "б-р Матроса Железняка, д. 13, кв. 31",
          addressCountry: "RU",
        },
      }
    );
  });
});

test("buildBreadcrumbList returns schema.org data with absolute URLs", () => {
  withSiteUrl("example.org", () => {
    assert.deepEqual(
      buildBreadcrumbList([
        { name: "Главная", path: "/" },
        { name: "Блог", path: "/blog" },
        { name: "Статья", path: "/blog/article" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Главная",
            item: "https://example.org/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Блог",
            item: "https://example.org/blog",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Статья",
            item: "https://example.org/blog/article",
          },
        ],
      }
    );
  });
});

test("buildFAQPageStructuredData returns a FAQPage schema with normalized questions and answers", () => {
  assert.deepEqual(
    buildFAQPageStructuredData([
      {
        question: "  Как начать сотрудничество?  ",
        answer: " Оставьте заявку на сайте или позвоните нам. ",
      },
      {
        question: "Сколько времени занимает подготовка проекта?",
        answer: "Типовые решения можем запустить за 1-2 недели.",
      },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Как начать сотрудничество?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Оставьте заявку на сайте или позвоните нам.",
          },
        },
        {
          "@type": "Question",
          name: "Сколько времени занимает подготовка проекта?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Типовые решения можем запустить за 1-2 недели.",
          },
        },
      ],
    }
  );
});

test("buildFAQPageStructuredData skips empty or whitespace-only questions and answers", () => {
  assert.equal(
    buildFAQPageStructuredData([
      { question: "  ", answer: "Ответ" },
      { question: "Вопрос", answer: "   " },
    ]),
    null
  );
});

test("buildBlogPostingStructuredData uses the article image fallback order and organization publisher", () => {
  withSiteUrl("https://ncfg.ru", () => {
    assert.deepEqual(
      buildBlogPostingStructuredData({
        title: "Как говорить о деньгах в компании",
        slug: "kak-govorit-o-dengakh-v-kompanii",
        category: { title: "Для компаний" },
        createdAt: "2026-04-01T08:00:00.000Z",
        updatedAt: "2026-04-02T09:15:00.000Z",
        postImage: null,
        anonsImage: "https://cdn.ncfg.ru/uploads/anons-cover.jpg",
        description: "Материал НЦФГ с практическими выводами и рекомендациями.",
      }),
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: "Как говорить о деньгах в компании",
        datePublished: "2026-04-01T08:00:00.000Z",
        dateModified: "2026-04-02T09:15:00.000Z",
        image: "https://cdn.ncfg.ru/uploads/anons-cover.jpg",
        author: {
          "@id": "https://ncfg.ru/#organization",
        },
        publisher: {
          "@type": "Organization",
          "@id": "https://ncfg.ru/#organization",
          name: "Национальный центр финансовой грамотности",
          logo: {
            "@type": "ImageObject",
            url: "https://ncfg.ru/logo.svg",
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": "https://ncfg.ru/blog/kak-govorit-o-dengakh-v-kompanii",
        },
        url: "https://ncfg.ru/blog/kak-govorit-o-dengakh-v-kompanii",
        description: "Материал НЦФГ с практическими выводами и рекомендациями.",
        inLanguage: "ru-RU",
        articleSection: "Для компаний",
      }
    );
  });
});

test("buildBlogPostingStructuredData falls back to the default site image", () => {
  withSiteUrl("https://ncfg.ru", () => {
    const structuredData = buildBlogPostingStructuredData({
      title: "Как составить семейный бюджет",
      slug: "kak-sostavit-semeinyi-biudzhet",
      category: null,
      createdAt: "2026-04-01T08:00:00.000Z",
      updatedAt: "2026-04-01T08:00:00.000Z",
      postImage: null,
      anonsImage: null,
      description: "Материал НЦФГ с практическими выводами и рекомендациями.",
    });

    assert.equal(structuredData.image, "https://ncfg.ru/logo.svg");
    assert.equal("articleSection" in structuredData, false);
  });
});
