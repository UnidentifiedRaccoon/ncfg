/**
 * Migration Script: JSON to Strapi
 * 
 * Migrates content from static JSON files to Strapi CMS:
 * - Tags (extracted from news)
 * - News Articles
 * - Service Categories
 * - Services
 * - People (Team members and Experts)
 * 
 * Usage:
 *   npm run migrate           # Run all migrations
 *   npm run migrate:tags      # Only migrate tags
 *   npm run migrate:news      # Only migrate news
 *   npm run migrate:categories # Only migrate service categories
 *   npm run migrate:services  # Only migrate services
 *   npm run migrate:people    # Only migrate people
 *   node scripts/migrate-to-strapi.mjs --only=site-settings
 *   node scripts/migrate-to-strapi.mjs --only=home-page
 *   node scripts/migrate-to-strapi.mjs --only=companies-page
 *   node scripts/migrate-to-strapi.mjs --only=individuals-page
 *   node scripts/migrate-to-strapi.mjs --only=about-page
 *   node scripts/migrate-to-strapi.mjs --only=blog-page
 *   node scripts/migrate-to-strapi.mjs --only=service-slugs-kebab
 *   node scripts/migrate-to-strapi.mjs --only=service-ui-icons
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

// Configuration
const CONFIG = {
  strapiUrl: process.env.STRAPI_URL || 'http://localhost:1337',
  strapiToken: process.env.STRAPI_API_TOKEN,
  paths: {
    news: path.join(__dirname, '..', process.env.NEWS_JSON_PATH || 'apps/web/public/content/news/ncfg_news.json'),
    services: path.join(__dirname, '..', process.env.SERVICES_JSON_PATH || 'apps/web/public/content/ncfg_services.json'),
    people: path.join(__dirname, '..', process.env.PEOPLE_JSON_PATH || 'apps/web/public/content/ncfg_finzdorov_people.json'),
    newsImages: path.join(__dirname, '..', process.env.NEWS_IMAGES_PATH || 'apps/web/public/content/news/anonsImages'),
    home: path.join(__dirname, '..', process.env.HOME_JSON_PATH || 'apps/web/public/content/home.json'),
    companiesPage: path.join(__dirname, '..', process.env.COMPANIES_JSON_PATH || 'apps/web/public/content/companies.json'),
    individualsPage: path.join(__dirname, '..', process.env.INDIVIDUALS_JSON_PATH || 'apps/web/public/content/individuals.json'),
    howWeWork: path.join(__dirname, '..', process.env.HOW_WE_WORK_JSON_PATH || 'apps/web/public/content/ncfg_how_we_work.json'),
    principles: path.join(__dirname, '..', process.env.PRINCIPLES_JSON_PATH || 'apps/web/public/content/ncfg_principles.json'),
    blog: path.join(__dirname, '..', process.env.BLOG_JSON_PATH || 'apps/web/public/content/blog.json'),
  },
};

// Helper: Make API request to Strapi
async function strapiRequest(endpoint, method = 'GET', data = null) {
  const url = `${CONFIG.strapiUrl}/api${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (CONFIG.strapiToken) {
    options.headers['Authorization'] = `Bearer ${CONFIG.strapiToken}`;
  }

  if (data) {
    options.body = JSON.stringify({ data });
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Strapi API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

// Helper: Upload file to Strapi
async function uploadFile(filePath) {
  const formData = new FormData();
  const fileBuffer = await fs.readFile(filePath);
  const fileName = path.basename(filePath);
  
  formData.append('files', fileBuffer, { filename: fileName });

  const options = {
    method: 'POST',
    body: formData,
    headers: {
      ...formData.getHeaders(),
    },
  };

  if (CONFIG.strapiToken) {
    options.headers['Authorization'] = `Bearer ${CONFIG.strapiToken}`;
  }

  const response = await fetch(`${CONFIG.strapiUrl}/api/upload`, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return result[0]; // Return the uploaded file info
}

// Helper: Read JSON file
async function readJSON(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

// Helper: Create slug from text (supports Cyrillic)
function slugify(text) {
  // Cyrillic to Latin transliteration map
  const cyrillicMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
    'я': 'ya'
  };
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .split('')
    .map(char => cyrillicMap[char] || char)
    .join('')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function toKebabFromLegacyId(value) {
  return String(value).trim().toLowerCase().replace(/_/g, '-');
}

function parseNumberFromDisplayValue(displayValue) {
  if (displayValue === null || displayValue === undefined) return null;

  const cleaned = String(displayValue)
    .toLowerCase()
    .replace(/,/g, '.')
    .replace(/[^0-9.\-]+/g, '')
    .trim();

  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

async function upsertSingleType(endpoint, data) {
  try {
    await strapiRequest(endpoint, 'GET');
  } catch {
    // If single type is not created yet, Strapi may return 404. PUT should create/update it.
  }

  return await strapiRequest(endpoint, 'PUT', data);
}

// ====================
// MIGRATION: Tags
// ====================
async function migrateTags() {
  console.log('\n📌 Migrating Tags...');
  
  const newsData = await readJSON(CONFIG.paths.news);
  
  // Extract unique tags from news articles
  const uniqueTags = new Set();
  newsData.forEach(article => {
    if (article.tags && Array.isArray(article.tags)) {
      article.tags.forEach(tag => uniqueTags.add(tag));
    }
  });

  const tags = Array.from(uniqueTags);
  console.log(`   Found ${tags.length} unique tags`);

  const tagMap = new Map(); // name -> Strapi ID

  for (const tagName of tags) {
    try {
      // Check if tag already exists
      const existing = await strapiRequest(`/tags?filters[name][$eq]=${encodeURIComponent(tagName)}`);
      
      if (existing.data && existing.data.length > 0) {
        console.log(`   ⏭️  Tag "${tagName}" already exists`);
        tagMap.set(tagName, existing.data[0].id);
        continue;
      }

      // Create new tag
      const result = await strapiRequest('/tags', 'POST', {
        name: tagName,
        slug: slugify(tagName),
      });
      
      console.log(`   ✅ Created tag: ${tagName}`);
      tagMap.set(tagName, result.data.id);
    } catch (error) {
      console.error(`   ❌ Error creating tag "${tagName}":`, error.message);
    }
  }

  return tagMap;
}

// ====================
// MIGRATION: News Articles
// ====================
async function migrateNews(tagMap = null) {
  console.log('\n📰 Migrating News Articles...');
  
  const newsData = await readJSON(CONFIG.paths.news);
  console.log(`   Found ${newsData.length} news articles`);

  // Get tag map if not provided
  if (!tagMap) {
    tagMap = new Map();
    const existingTags = await strapiRequest('/tags?pagination[limit]=100');
    existingTags.data?.forEach(tag => {
      tagMap.set(tag.attributes?.name || tag.name, tag.id);
    });
  }

  for (const article of newsData) {
    try {
      // Check if article already exists
      const existing = await strapiRequest(`/news-articles?filters[slug][$eq]=${encodeURIComponent(article.slug)}&populate=anonsImage`);
      
      if (existing.data && existing.data.length > 0) {
        const existingArticle = existing.data[0];
        const hasImage = existingArticle.anonsImage || existingArticle.attributes?.anonsImage;
        
        // If article exists but has no image, try to upload it
        if (!hasImage && article.anonsImage) {
          const imageName = article.anonsImage.replace(/^(news\/anonsImages\/|\/news\/anonsImages\/)/, '');
          const imagePath = path.join(CONFIG.paths.newsImages, imageName);
          try {
            await fs.access(imagePath);
            console.log(`   📷 Uploading missing image for existing article: ${imageName}`);
            const uploadedFile = await uploadFile(imagePath);
            const documentId = existingArticle.documentId || existingArticle.id;
            await strapiRequest(`/news-articles/${documentId}`, 'PUT', {
              anonsImage: uploadedFile.id,
            });
            console.log(`   ✅ Image uploaded and linked to existing article`);
          } catch (imgError) {
            console.log(`   ⚠️  Image upload failed: ${imgError.message}`);
          }
        } else {
          console.log(`   ⏭️  Article "${article.title.substring(0, 40)}..." already exists`);
        }
        continue;
      }

      // Resolve tag IDs
      const tagIds = [];
      if (article.tags && Array.isArray(article.tags)) {
        article.tags.forEach(tagName => {
          const tagId = tagMap.get(tagName);
          if (tagId) {
            tagIds.push(tagId);
          }
        });
      }

      // Create article
      const articleData = {
        title: article.title,
        slug: article.slug,
        body: article.body,
        publishedDate: article.createdAt,
        tags: tagIds,
        publishedAt: new Date().toISOString(), // Publish immediately
      };

      const result = await strapiRequest('/news-articles', 'POST', articleData);
      console.log(`   ✅ Created article: ${article.title.substring(0, 50)}...`);

      // Handle image upload if exists
      if (article.anonsImage) {
        // Support both old path (news/anonsImages/...) and new path (apps/web/public/content/news/anonsImages/...)
        const imageName = article.anonsImage.replace(/^(news\/anonsImages\/|\/news\/anonsImages\/)/, '');
        const imagePath = path.join(CONFIG.paths.newsImages, imageName);
        try {
          await fs.access(imagePath);
          console.log(`   📷 Uploading image: ${imageName}`);
          const uploadedFile = await uploadFile(imagePath);
          // Strapi 5 uses documentId for updates
          const documentId = result.data.documentId || result.data.id;
          await strapiRequest(`/news-articles/${documentId}`, 'PUT', {
            anonsImage: uploadedFile.id,
          });
          console.log(`   ✅ Image uploaded and linked`);
        } catch (imgError) {
          console.log(`   ⚠️  Image not found or upload failed: ${imagePath} - ${imgError.message}`);
        }
      }
    } catch (error) {
      console.error(`   ❌ Error creating article "${article.title}":`, error.message);
    }
  }
}

// ====================
// MIGRATION: Service Categories
// ====================
async function migrateServiceCategories() {
  console.log('\n📁 Migrating Service Categories...');
  
  const servicesData = await readJSON(CONFIG.paths.services);
  const categories = servicesData.serviceCategories || [];
  console.log(`   Found ${categories.length} service categories`);

  const categoryMap = new Map(); // id -> Strapi ID

  for (const category of categories) {
    try {
      const desiredSlug = toKebabFromLegacyId(category.id);

      const bySlug = await strapiRequest(
        `/service-categories?filters[slug][$eq]=${encodeURIComponent(desiredSlug)}&pagination[limit]=1`
      );
      const byTitle = await strapiRequest(
        `/service-categories?filters[title][$eq]=${encodeURIComponent(category.title)}&pagination[limit]=1`
      );

      const existing =
        (bySlug.data && bySlug.data.length > 0 ? bySlug.data[0] : null) ||
        (byTitle.data && byTitle.data.length > 0 ? byTitle.data[0] : null);

      const categoryData = {
        title: category.title,
        slug: desiredSlug,
        description: category.description || null,
        order: category.order || 0,
        publishedAt: new Date().toISOString(),
      };

      if (existing) {
        const documentId = existing.documentId || existing.id;
        await strapiRequest(`/service-categories/${documentId}`, 'PUT', categoryData);
        console.log(`   ✅ Updated category: ${category.title}`);
        categoryMap.set(category.id, existing.id);
      } else {
        const result = await strapiRequest('/service-categories', 'POST', categoryData);
        console.log(`   ✅ Created category: ${category.title}`);
        categoryMap.set(category.id, result.data.id);
      }
    } catch (error) {
      console.error(`   ❌ Error creating category "${category.title}":`, error.message);
    }
  }

  return categoryMap;
}

// ====================
// MIGRATION: Services
// ====================
async function migrateServices(categoryMap = null) {
  console.log('\n🛠️  Migrating Services...');
  
  const servicesData = await readJSON(CONFIG.paths.services);
  const categories = servicesData.serviceCategories || [];

  // Get category map if not provided
  if (!categoryMap) {
    categoryMap = new Map();
    const existingCategories = await strapiRequest('/service-categories?pagination[limit]=100');
    existingCategories.data?.forEach((cat) => {
      const attrs = cat.attributes || cat;
      const existingSlug = attrs.slug;
      const existingTitle = attrs.title;

      categories.forEach((origCat) => {
        if (existingSlug && toKebabFromLegacyId(origCat.id) === existingSlug) {
          categoryMap.set(origCat.id, cat.id);
          return;
        }
        if (existingTitle && origCat.title === existingTitle) {
          categoryMap.set(origCat.id, cat.id);
        }
      });
    });
  }

  for (const category of categories) {
    const services = category.services || [];
    console.log(`   Processing ${services.length} services in "${category.title}"`);

    for (const service of services) {
      try {
        const desiredSlug = toKebabFromLegacyId(service.id);

        const bySlug = await strapiRequest(
          `/services?filters[slug][$eq]=${encodeURIComponent(desiredSlug)}&pagination[limit]=1`
        );
        const byTitle = await strapiRequest(
          `/services?filters[title][$eq]=${encodeURIComponent(service.title)}&pagination[limit]=1`
        );

        const existing =
          (bySlug.data && bySlug.data.length > 0 ? bySlug.data[0] : null) ||
          (byTitle.data && byTitle.data.length > 0 ? byTitle.data[0] : null);

        const serviceData = {
          title: service.title,
          slug: desiredSlug,
          order: service.order || 0,
          shortDescription: service.shortDescription || null,
          fullDescription: service.fullDescription || null,
          publishedAt: new Date().toISOString(),
        };

        const strapiCategoryId = categoryMap.get(category.id);
        if (strapiCategoryId) {
          serviceData.category = strapiCategoryId;
        }

        if (Array.isArray(service.benefits)) {
          serviceData.benefits = service.benefits.map((text) => ({ text }));
        }
        if (Array.isArray(service.howWeWork)) {
          serviceData.howWeWork = service.howWeWork.map((text) => ({ text }));
        }
        if (Array.isArray(service.examples)) {
          serviceData.examples = service.examples.map((example) => ({
            exampleId: example.id !== undefined && example.id !== null ? String(example.id) : null,
            title: example.title,
            type: example.type || 'custom',
            link: example.link || null,
            description: example.description || null,
            notes: example.notes || null,
            durationMinutes: example.durationMinutes || null,
          }));
        }
        if (service.cta) {
          serviceData.cta = {
            label: service.cta.label,
            type: service.cta.type || 'form',
          };
        }

        if (existing) {
          const documentId = existing.documentId || existing.id;
          await strapiRequest(`/services/${documentId}`, 'PUT', serviceData);
          console.log(`     ✅ Updated service: ${service.title.substring(0, 40)}...`);
        } else {
          await strapiRequest('/services', 'POST', serviceData);
          console.log(`     ✅ Created service: ${service.title.substring(0, 40)}...`);
        }
      } catch (error) {
        console.error(`     ❌ Error creating service "${service.title}":`, error.message);
      }
    }
  }
}

// ====================
// MIGRATION: People
// ====================
async function migratePeople() {
  console.log('\n👥 Migrating People...');
  
  const peopleData = await readJSON(CONFIG.paths.people);
  const people = peopleData.people || [];
  console.log(`   Found ${people.length} people`);

  for (const person of people) {
    try {
      // Check if person already exists
      const existing = await strapiRequest(`/people?filters[personId][$eq]=${encodeURIComponent(person.id)}`);
      
      if (existing.data && existing.data.length > 0) {
        console.log(`   ⏭️  Person "${person.fullName}" already exists`);
        continue;
      }

      const personData = {
        fullName: person.fullName,
        personId: person.id,
        isTeam: person.isTeam || false,
        isExpert: person.isExpert || false,
        notes: person.notes,
        order: parseInt(person.id?.replace('person_', '') || '0'),
        publishedAt: new Date().toISOString(),
      };

      // Transform team info
      if (person.team) {
        personData.team = {
          unit: person.team.unit,
          title: person.team.title,
          department: person.team.department,
        };
      }

      // Transform expert profile
      if (person.expertProfile) {
        const ep = person.expertProfile;
        personData.expertProfile = {
          headline: ep.headline,
          roles: ep.roles || [],
          specialization: ep.specialization,
          position: ep.position,
          organization: ep.organization,
          registry: ep.registry,
          experienceYears: ep.experienceYears,
          experienceText: ep.experienceText,
          activities: ep.activities || [],
          education: ep.education || [],
          background: ep.background || [],
          statuses: ep.statuses || [],
          products: ep.products || [],
          books: ep.books || [],
          mediaMentions: ep.mediaMentions || [],
          sourcePages: ep.source?.pages || [],
          sourceUrl: ep.source?.url,
        };

        // Transform metrics
        if (ep.metrics) {
          personData.expertProfile.metrics = {
            courseParticipants: ep.metrics.courseParticipants,
            moneySavedRub: ep.metrics.moneySavedRub,
            returnedTaxesRub: ep.metrics.returnedTaxesRub,
            eventsCount: ep.metrics.eventsCount,
            audienceSize: ep.metrics.audienceSize,
          };
        }
      }

      const result = await strapiRequest('/people', 'POST', personData);
      console.log(`   ✅ Created person: ${person.fullName}`);
    } catch (error) {
      console.error(`   ❌ Error creating person "${person.fullName}":`, error.message);
    }
  }
}

// ====================
// MIGRATION: Site Settings (Footer + Metrics)
// ====================
async function migrateSiteSettings() {
  console.log('\n⚙️  Migrating Site Settings...');

  const homeData = await readJSON(CONFIG.paths.home);
  const footer = homeData?.sections?.Footer?.data;
  const statsItems = homeData?.sections?.Stats?.data?.items || [];

  if (!footer) {
    throw new Error('home.json does not contain sections.Footer.data');
  }

  const legalDocumentsItems = footer.legalDocuments?.items || [];

  const payload = {
    organizationFullName: footer.organization?.fullName,
    organizationShortName: footer.organization?.shortName,
    contactsPhone: footer.contacts?.phone,
    contactsEmail: footer.contacts?.email,
    contactsLegalAddress: footer.contacts?.legalAddress,
    socialLinks: (footer.social || []).map((l) => ({ label: l.label, href: l.href })),
    legalLinks: (footer.legalLinks || []).map((l) => ({ label: l.label, href: l.href })),
    legalDocumentsTitle: footer.legalDocuments?.title,
    legalDocuments: legalDocumentsItems.map((doc) => ({
      label: doc.label,
      href: doc.href,
      type: doc.type === 'pdf' || doc.type === 'docx' ? doc.type : 'other',
    })),
    copyrightYears: footer.copyright?.years,
    copyrightText: footer.copyright?.text,
    copyrightNotice: footer.copyright?.notice,
    metrics: (statsItems || []).map((item) => ({
      key: item.key,
      label: item.label,
      displayValue: item.displayValue,
      valueNumber: parseNumberFromDisplayValue(item.displayValue),
    })),
  };

  const result = await upsertSingleType('/site-setting', payload);
  console.log(`   ✅ Site settings updated (id: ${result?.data?.id ?? 'n/a'})`);
}

// ====================
// MIGRATION: Home Page
// ====================
async function migrateHomePage() {
  console.log('\n🏠 Migrating Home Page...');

  const homeData = await readJSON(CONFIG.paths.home);
  const hero = homeData?.sections?.Hero?.data;
  const services = homeData?.sections?.Services?.data;
  const partners = homeData?.sections?.Partners?.data;
  const faq = homeData?.sections?.FAQ?.data;
  const news = homeData?.sections?.News?.data;

  if (!hero) {
    throw new Error('home.json does not contain sections.Hero.data');
  }

  const payload = {
    hero: {
      headline: hero.headline,
      lead: hero.lead,
      primaryCta: hero.primaryCta ? { label: hero.primaryCta.label, href: hero.primaryCta.href } : null,
    },
    supportingHeadings: (hero.supportingHeadings || []).map((text) => ({ text })),
    proofPoints: (hero.proofPoints || []).map((pp) => ({
      strong: Boolean(pp.strong),
      text: pp.text,
      links: (pp.links || []).map((l) => ({ label: l.label, href: l.href })),
    })),
    servicesTitle: services?.title || null,
    partners: partners
      ? {
          awards: (partners.awards || []).map((a) => ({
            title: a.title,
            year: a.year || null,
            imgPath: a.img || null,
          })),
          clientsCarousel: partners.clientsCarousel
            ? {
                title: partners.clientsCarousel.title,
                archiveCta: partners.clientsCarousel.archiveCta
                  ? {
                      label: partners.clientsCarousel.archiveCta.label,
                      href: partners.clientsCarousel.archiveCta.href,
                    }
                  : null,
                categories: (partners.clientsCarousel.categories || []).map((c) => ({
                  key: c.id,
                  name: c.name,
                  logos: (c.logos || []).map((logo) => ({
                    title: logo.title,
                    href: logo.href || null,
                    imgPath: logo.img || null,
                  })),
                  moreDisplay: c.more?.display || null,
                  moreValue: c.more?.value || null,
                  moreUnit: c.more?.unit || null,
                })),
              }
            : null,
          testimonials: partners.testimonials
            ? {
                title: partners.testimonials.title,
                items: (partners.testimonials.items || []).map((t) => ({
                  company: t.company,
                  logoImgPath: t.logoImg || null,
                  quote: t.quote,
                })),
                more: partners.testimonials.more
                  ? {
                      labelTop: partners.testimonials.more.labelTop,
                      labelBottom: partners.testimonials.more.labelBottom,
                      href: partners.testimonials.more.href,
                    }
                  : null,
              }
            : null,
        }
      : null,
    faqTitle: faq?.title || null,
    newsTitle: news?.title || null,
    newsTeaser: news?.teaser || null,
    newsArchiveLink: news?.links && news.links.length > 0 ? { label: news.links[0].label, href: news.links[0].href } : null,
  };

  const result = await upsertSingleType('/home-page', payload);
  console.log(`   ✅ Home page updated (id: ${result?.data?.id ?? 'n/a'})`);
}

// ====================
// MIGRATION: Companies Page
// ====================
async function migrateCompaniesPage() {
  console.log('\n🏢 Migrating Companies Page...');

  const data = await readJSON(CONFIG.paths.companiesPage);
  const hero = data?.hero;
  const faq = data?.faq || [];

  if (!hero) {
    throw new Error('companies.json does not contain hero');
  }

  const payload = {
    hero: {
      headline: hero.headline,
      lead: hero.lead,
      primaryCta: hero.primaryCta ? { label: hero.primaryCta.label, href: hero.primaryCta.href } : null,
    },
    faqItems: faq.map((item, index) => ({
      question: item.question,
      answer: item.answer,
      order: item.id || index + 1,
    })),
  };

  const result = await upsertSingleType('/companies-page', payload);
  console.log(`   ✅ Companies page updated (id: ${result?.data?.id ?? 'n/a'})`);
}

// ====================
// MIGRATION: Individuals Page
// ====================
async function migrateIndividualsPage() {
  console.log('\n👤 Migrating Individuals Page...');

  const data = await readJSON(CONFIG.paths.individualsPage);
  const hero = data?.hero;
  const products = data?.products || [];
  const faq = data?.faq || [];

  if (!hero) {
    throw new Error('individuals.json does not contain hero');
  }

  const payload = {
    hero: {
      headline: hero.headline,
      lead: hero.lead,
      primaryCta: hero.primaryCta ? { label: hero.primaryCta.label, href: hero.primaryCta.href } : null,
    },
    productsTitle: 'Наши продукты',
    productsLead: 'Выберите подходящий формат обучения финансовой грамотности',
    products: products.map((p) => ({
      title: p.title,
      description: p.description,
      href: p.href,
      audience: p.audience || null,
      iconKey: p.icon || null,
      imagePath: p.image || null,
    })),
    faqItems: faq.map((item, index) => ({
      question: item.question,
      answer: item.answer,
      order: item.id || index + 1,
    })),
  };

  const result = await upsertSingleType('/individuals-page', payload);
  console.log(`   ✅ Individuals page updated (id: ${result?.data?.id ?? 'n/a'})`);
}

// ====================
// MIGRATION: About Page
// ====================
async function migrateAboutPage() {
  console.log('\nℹ️  Migrating About Page...');

  const howWeWorkData = await readJSON(CONFIG.paths.howWeWork);
  const principlesData = await readJSON(CONFIG.paths.principles);

  const payload = {
    heroHeadline:
      'Национальный центр финансовой грамотности — лидер в сфере финансового просвещения с 2005 года',
    heroCta: { label: 'Наши проекты', href: '/companies' },
    howWeWorkTitle: howWeWorkData.title,
    howWeWorkLead: howWeWorkData.description,
    howWeWorkSteps: (howWeWorkData.steps || []).map((s, index) => ({
      order: s.id || index + 1,
      title: s.title,
      description: s.description || null,
    })),
    principlesTitle: principlesData.title,
    principlesLead: principlesData.description,
    principles: (principlesData.principles || []).map((p) => ({
      key: p.id,
      order: p.order || 0,
      title: p.title,
      description: p.description,
    })),
    faqItems: [
      {
        question: 'Как давно существует НЦФГ?',
        answer:
          'Национальный центр финансовой грамотности работает с 2005 года. За это время мы реализовали сотни проектов по повышению финансовой грамотности для государственных структур, бизнеса и частных лиц.',
        order: 1,
      },
      {
        question: 'Какие специалисты работают в НЦФГ?',
        answer:
          'В нашей команде работают сертифицированные финансовые консультанты, методологи образовательных программ, эксперты по инвестициям, налогам и недвижимости. Многие из них имеют более 20 лет опыта на финансовом рынке.',
        order: 2,
      },
      {
        question: 'Можно ли сотрудничать с НЦФГ как эксперт?',
        answer:
          'Да, мы всегда открыты для сотрудничества с профессионалами в области финансов. Оставьте заявку на сайте, и мы свяжемся с вами для обсуждения возможных форматов взаимодействия.',
        order: 3,
      },
      {
        question: 'В каких регионах работает НЦФГ?',
        answer:
          'НЦФГ реализует проекты по всей России — в 84 регионах. Мы работаем как онлайн, так и офлайн, что позволяет охватить максимально широкую аудиторию.',
        order: 4,
      },
    ],
  };

  const result = await upsertSingleType('/about-page', payload);
  console.log(`   ✅ About page updated (id: ${result?.data?.id ?? 'n/a'})`);
}

// ====================
// MIGRATION: Blog Page Meta
// ====================
async function migrateBlogPage() {
  console.log('\n📝 Migrating Blog Page...');

  const data = await readJSON(CONFIG.paths.blog);
  const meta = data?.meta;

  if (!meta) {
    throw new Error('blog.json does not contain meta');
  }

  const payload = {
    title: meta.title,
    lead: meta.lead,
  };

  const result = await upsertSingleType('/blog-page', payload);
  console.log(`   ✅ Blog page updated (id: ${result?.data?.id ?? 'n/a'})`);
}

// ====================
// MIGRATION: Service slugs to kebab-case (data-only)
// ====================
async function migrateServiceSlugsKebab() {
  console.log('\n🔤 Migrating service/category slugs to kebab-case...');

  const servicesData = await readJSON(CONFIG.paths.services);
  const categories = servicesData.serviceCategories || [];

  for (const category of categories) {
    const desiredSlug = toKebabFromLegacyId(category.id);
    try {
      const existing = await strapiRequest(
        `/service-categories?filters[title][$eq]=${encodeURIComponent(category.title)}&pagination[limit]=1`
      );
      const item = existing.data && existing.data.length > 0 ? existing.data[0] : null;
      if (!item) {
        console.log(`   ⚠️  Category not found in Strapi (skip): ${category.title}`);
        continue;
      }
      const documentId = item.documentId || item.id;
      await strapiRequest(`/service-categories/${documentId}`, 'PUT', { slug: desiredSlug });
      console.log(`   ✅ Category slug: ${category.title} -> ${desiredSlug}`);
    } catch (error) {
      console.error(`   ❌ Error updating category slug "${category.title}":`, error.message);
    }
  }

  for (const category of categories) {
    for (const service of category.services || []) {
      const desiredSlug = toKebabFromLegacyId(service.id);
      try {
        const existing = await strapiRequest(
          `/services?filters[title][$eq]=${encodeURIComponent(service.title)}&pagination[limit]=1`
        );
        const item = existing.data && existing.data.length > 0 ? existing.data[0] : null;
        if (!item) {
          console.log(`   ⚠️  Service not found in Strapi (skip): ${service.title}`);
          continue;
        }
        const documentId = item.documentId || item.id;
        await strapiRequest(`/services/${documentId}`, 'PUT', { slug: desiredSlug });
        console.log(`   ✅ Service slug: ${service.title.substring(0, 48)} -> ${desiredSlug}`);
      } catch (error) {
        console.error(`   ❌ Error updating service slug "${service.title}":`, error.message);
      }
    }
  }
}

// ====================
// MIGRATION: Service UI icons
// ====================
async function migrateServiceUiIcons() {
  console.log('\n🎨 Migrating Service UI icons...');

  const companiesData = await readJSON(CONFIG.paths.companiesPage);
  const blocks = companiesData?.services || [];

  const items = [];
  for (const block of blocks) {
    for (const item of block.items || []) {
      items.push(item);
    }
  }

  console.log(`   Found ${items.length} service items in companies.json`);

  for (const item of items) {
    const serviceSlug = toKebabFromLegacyId(item.id);
    const iconKey = item.icon;

    if (!serviceSlug || !iconKey) continue;

    try {
      const serviceRes = await strapiRequest(
        `/services?filters[slug][$eq]=${encodeURIComponent(serviceSlug)}&pagination[limit]=1`
      );
      const service = serviceRes.data && serviceRes.data.length > 0 ? serviceRes.data[0] : null;

      if (!service) {
        console.log(`   ⚠️  Service not found for icon mapping: ${serviceSlug}`);
        continue;
      }

      const existingRes = await strapiRequest(
        `/service-uis?filters[service][id][$eq]=${service.id}&pagination[limit]=1&populate=service`
      );
      const existing = existingRes.data && existingRes.data.length > 0 ? existingRes.data[0] : null;

      const payload = {
        service: service.id,
        iconKey,
      };

      if (existing) {
        const documentId = existing.documentId || existing.id;
        await strapiRequest(`/service-uis/${documentId}`, 'PUT', payload);
        console.log(`   ✅ Updated icon: ${serviceSlug} -> ${iconKey}`);
      } else {
        await strapiRequest('/service-uis', 'POST', payload);
        console.log(`   ✅ Created icon: ${serviceSlug} -> ${iconKey}`);
      }
    } catch (error) {
      console.error(`   ❌ Error migrating icon for "${item.id}":`, error.message);
    }
  }
}

// ====================
// MAIN
// ====================
async function main() {
  console.log('🚀 NCFG Data Migration to Strapi');
  console.log('================================');
  console.log(`   Strapi URL: ${CONFIG.strapiUrl}`);
  console.log(`   Token configured: ${CONFIG.strapiToken ? 'Yes' : 'No'}`);

  // Parse command line arguments
  const args = process.argv.slice(2);
  const onlyArg = args.find(arg => arg.startsWith('--only='));
  const only = onlyArg ? onlyArg.split('=')[1] : null;

  try {
    // Test connection
    console.log('\n🔌 Testing Strapi connection...');
    await fetch(`${CONFIG.strapiUrl}/api`);
    console.log('   ✅ Connected to Strapi');

    let tagMap = null;
    let categoryMap = null;

    if (!only || only === 'tags') {
      tagMap = await migrateTags();
    }

    if (!only || only === 'news') {
      await migrateNews(tagMap);
    }

    if (!only || only === 'categories') {
      categoryMap = await migrateServiceCategories();
    }

    if (!only || only === 'services') {
      await migrateServices(categoryMap);
    }

    if (!only || only === 'people') {
      await migratePeople();
    }

    console.log('\n✨ Migration complete!');
    console.log('\nNext steps:');
    console.log('1. Start Strapi: cd apps/cms && npm run develop');
    console.log('2. Create an admin user at http://localhost:1337/admin');
    console.log('3. Generate an API token: Settings > API Tokens');
    console.log('4. Update scripts/.env with the token');
    console.log('5. Re-run this script to migrate data');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('\n❌ Cannot connect to Strapi. Please ensure Strapi is running:');
      console.error('   cd apps/cms && npm run develop');
    } else {
      console.error('\n❌ Migration failed:', error.message);
    }
    process.exit(1);
  }
}

main();
