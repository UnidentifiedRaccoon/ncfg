/**
 * Strapi API Response Types
 * 
 * These types match the Strapi 5 REST API response structure.
 */

// ==================
// Generic Types
// ==================

export interface StrapiImage {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    thumbnail?: StrapiImageFormat;
    small?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    large?: StrapiImageFormat;
  } | null;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
}

export interface StrapiImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  url: string;
}

// ==================
// Blog Category (Rubric)
// ==================

export interface StrapiBlogCategory {
  id: number;
  documentId: string;
  slug: string;
  title: string;
  order: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==================
// News Article
// ==================

export interface StrapiNewsArticle {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  body: string | null;
  anonsImage: StrapiImage | null;
  category: StrapiBlogCategory | null;
  publishedDate: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// ==================
// Service Category
// ==================

export interface StrapiServiceCategory {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: string | null;
  order: number;
  services?: StrapiService[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// ==================
// Service
// ==================

export interface StrapiTextItem {
  id: number;
  text: string;
}

export interface StrapiServiceExample {
  id: number;
  exampleId: string | null;
  title: string;
  type: 'link' | 'fact' | 'presentation' | 'custom' | null;
  link: string | null;
  description: string | null;
  notes: string | null;
  durationMinutes: string | null;
}

export interface StrapiProductItem {
  id: number;
  productId: string | null;
  title: string;
  type: 'online_school' | 'subscription_club' | 'custom_project' | 'other' | null;
  notes: string | null;
  pricingOptions: StrapiTextItem[];
}

export interface StrapiCallToAction {
  id: number;
  label: string;
  type: 'form' | 'link' | 'email' | 'phone';
}

export interface StrapiService {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  order: number;
  shortDescription: string | null;
  fullDescription: string | null;
  benefits: StrapiTextItem[];
  howWeWork: StrapiTextItem[];
  examples: StrapiServiceExample[];
  cta: StrapiCallToAction | null;
  category: StrapiServiceCategory | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// ==================
// Person
// ==================

export interface StrapiPerson {
  id: number;
  documentId: string;
  fullName: string;
  photo: StrapiImage | null;
  position: string | null;
  headline: string | null;
  experienceYears: number | null;
  order: number;
  team: { id: number } | null;
  expertGroup: { id: number } | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// ==================
// Shared Components
// ==================

export interface StrapiLink {
  id: number;
  label: string;
  href: string;
}

export interface StrapiFaqItem {
  id: number;
  question: string;
  answer: string;
  order: number;
}

export interface StrapiHero {
  id: number;
  headline: string;
  lead: string | null;
  primaryCta: StrapiLink | null;
}

export interface StrapiMetric {
  id: number;
  key: string;
  label: string;
  displayValue: string;
  valueNumber: number | null;
}

export interface StrapiLegalDocument {
  id: number;
  label: string;
  href: string;
  type: 'pdf' | 'docx' | 'other';
}

// ==================
// Site Setting
// ==================

export interface StrapiSiteSetting {
  id: number;
  documentId: string;
  organizationFullName: string;
  organizationShortName: string;
  contactsPhone: string;
  contactsEmail: string;
  contactsLegalAddress: string | null;
  socialLinks: StrapiLink[];
  legalLinks: StrapiLink[];
  legalDocumentsTitle: string | null;
  legalDocuments: StrapiLegalDocument[];
  copyrightYears: string | null;
  copyrightText: string | null;
  copyrightNotice: string | null;
  metrics: StrapiMetric[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// ==================
// Home Page
// ==================

export interface StrapiHomeProofPoint {
  id: number;
  strong: boolean;
  text: string;
  links: StrapiLink[];
}

export interface StrapiHomeAward {
  id: number;
  title: string;
  year: number | null;
  imgPath: string | null;
}

export interface StrapiHomeLogo {
  id: number;
  title: string;
  href: string | null;
  imgPath: string | null;
}

export interface StrapiHomeClientsCategory {
  id: number;
  key: string;
  name: string;
  logos: StrapiHomeLogo[];
  moreDisplay: string | null;
  moreValue: number | null;
  moreUnit: string | null;
}

export interface StrapiHomeClientsCarousel {
  id: number;
  title: string;
  archiveCta: StrapiLink | null;
  categories: StrapiHomeClientsCategory[];
}

export interface StrapiHomeTestimonial {
  id: number;
  company: string;
  logoImgPath: string | null;
  quote: string;
}

export interface StrapiHomeTestimonialsMore {
  id: number;
  labelTop: string;
  labelBottom: string;
  href: string;
}

export interface StrapiHomeTestimonialsBlock {
  id: number;
  title: string;
  items: StrapiHomeTestimonial[];
  more: StrapiHomeTestimonialsMore | null;
}

export interface StrapiHomePartnersBlock {
  id: number;
  awards: StrapiHomeAward[];
  clientsCarousel: StrapiHomeClientsCarousel | null;
  testimonials: StrapiHomeTestimonialsBlock | null;
}

export interface StrapiHomePage {
  id: number;
  documentId: string;
  hero: StrapiHero | null;
  supportingHeadings: StrapiTextItem[];
  proofPoints: StrapiHomeProofPoint[];
  servicesTitle: string | null;
  partners: StrapiHomePartnersBlock | null;
  faqTitle: string | null;
  newsTitle: string | null;
  newsTeaser: string | null;
  newsArchiveLink: StrapiLink | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// ==================
// Companies Page
// ==================

export interface StrapiCompaniesPage {
  id: number;
  documentId: string;
  hero: StrapiHero | null;
  faqItems: StrapiFaqItem[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// ==================
// Individuals Page
// ==================

export interface StrapiIndividualsProduct {
  id: number;
  title: string;
  description: string;
  href: string;
  audience: string | null;
  iconKey: 'graduation-cap' | 'trending-up' | 'zap' | null;
  imagePath: string | null;
}

export interface StrapiIndividualsPage {
  id: number;
  documentId: string;
  hero: StrapiHero | null;
  productsTitle: string | null;
  productsLead: string | null;
  products: StrapiIndividualsProduct[];
  faqItems: StrapiFaqItem[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// ==================
// About Page
// ==================

export interface StrapiHowWeWorkStep {
  id: number;
  order: number;
  title: string;
  description: string | null;
}

export interface StrapiPrinciple {
  id: number;
  key: string;
  order: number;
  title: string;
  description: string;
}

export interface StrapiAboutPage {
  id: number;
  documentId: string;
  heroHeadline: string | null;
  heroCta: StrapiLink | null;
  howWeWorkTitle: string | null;
  howWeWorkLead: string | null;
  howWeWorkSteps: StrapiHowWeWorkStep[];
  principlesTitle: string | null;
  principlesLead: string | null;
  principles: StrapiPrinciple[];
  faqItems: StrapiFaqItem[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// ==================
// Blog Page
// ==================

export interface StrapiBlogPage {
  id: number;
  documentId: string;
  title: string;
  lead: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// ==================
// Service UI
// ==================

export interface StrapiServiceUi {
  id: number;
  documentId: string;
  iconKey: string;
  service: Pick<StrapiService, 'id' | 'documentId' | 'slug'> | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}
